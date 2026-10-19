/* ==========================================================================
   HelioServ — comportamento da página
   ========================================================================== */
(() => {
  'use strict';

  // ---------- Configuração ----------
  const WHATSAPP_PHONE = '5511975819253'; // Hélio — mesmo número do Schema e do rodapé

  // Premissas do simulador (ajuste aqui se precisar)
  const SIM = {
    sunHours: 4.9,         // irradiação média diária em Itu/SP (kWh/m²/dia, CRESESB)
    performance: 0.80,     // perdas típicas (temperatura, cabos, inversor, sujeira)
    minimumKwh: 50,        // custo de disponibilidade — ligação bifásica
    panelWatts: 580,       // potência de uma placa de referência
    panelArea: 2.6,        // m² por placa, já com folga de instalação
  };

  const SERVICES = {
    instalacao: {
      title: 'Instalação de sistemas',
      text: 'Solução fotovoltaica planejada para o perfil do imóvel.',
      image: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=1200&q=80',
      items: ['Levantamento das necessidades', 'Dimensionamento da solução', 'Instalação dos componentes', 'Orientação para acompanhamento do sistema'],
    },
    manutencao: {
      title: 'Manutenção e suporte',
      text: 'Cuidados para preservar segurança e desempenho do sistema.',
      image: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=1200&q=80',
      items: ['Inspeção visual e técnica', 'Verificação de componentes', 'Diagnóstico de falhas', 'Orientação de manutenção preventiva'],
    },
    boilers: {
      title: 'Automação para boilers',
      text: 'Automação de apoio elétrico para complementar e controlar o aquecimento de boilers.',
      image: 'https://images.unsplash.com/photo-1558449028-b53a39d100fc?auto=format&fit=crop&w=1200&q=80',
      items: ['Apoio elétrico automatizado', 'Controle conforme necessidade', 'Integração com o sistema existente', 'Avaliação técnica da instalação'],
    },
    equipamentos: {
      title: 'Equipamentos e soluções',
      text: 'Componentes selecionados conforme a necessidade de cada sistema.',
      image: 'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?auto=format&fit=crop&w=1200&q=80',
      items: ['Painéis fotovoltaicos', 'Inversores e microinversores', 'Proteções e estruturas', 'Soluções conforme o projeto'],
    },
  };

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

  // ---------- WhatsApp ----------
  const whatsappUrl = (message) =>
    `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(message)}`;

  function openWhatsapp(message) {
    window.open(whatsappUrl(message), '_blank', 'noopener,noreferrer');
  }

  // Os links já têm href real (funcionam sem JS); aqui só acrescentamos a mensagem.
  document.addEventListener('click', (e) => {
    const el = e.target.closest('.js-whatsapp');
    if (!el) return;
    e.preventDefault();
    openWhatsapp(el.dataset.message || 'Olá, gostaria de fazer um orçamento!');
  });

  // ---------- Modal de serviços ----------
  const modalEl = $('#serviceModal');
  const modal = new bootstrap.Modal(modalEl);
  const modalBody = $('#serviceModalBody');

  function buildServiceModal(s) {
    const frag = document.createDocumentFragment();

    const hero = document.createElement('div');
    hero.className = 'modal-hero';
    hero.style.backgroundImage = `url("${s.image}")`;
    hero.innerHTML = '<div><span class="section-kicker text-warning">Serviço HelioServ</span><h2 class="fw-bold" id="serviceModalTitle"></h2></div>';
    $('h2', hero).textContent = s.title;

    const body = document.createElement('div');
    body.className = 'modal-body-custom';
    body.innerHTML = `
      <p class="lead text-secondary"></p>
      <h3 class="h6 text-uppercase fw-bold mt-4">O que pode fazer parte da solução</h3>
      <ul class="list-unstyled"></ul>
      <button type="button" class="btn btn-warning btn-lg w-100 mt-3 js-whatsapp">
        <i class="bi bi-whatsapp me-2" aria-hidden="true"></i>Quero falar sobre este serviço
      </button>`;
    $('p', body).textContent = s.text;
    const ul = $('ul', body);
    s.items.forEach((item) => {
      const li = document.createElement('li');
      li.innerHTML = '<i class="bi bi-check2-circle text-warning me-2" aria-hidden="true"></i>';
      li.append(item);
      ul.append(li);
    });
    $('.js-whatsapp', body).dataset.message =
      `Olá, tenho interesse em ${s.title.toLowerCase()} e gostaria de mais informações.`;

    frag.append(hero, body);
    return frag;
  }

  $$('[data-service]').forEach((card) => {
    card.addEventListener('click', () => {
      const s = SERVICES[card.dataset.service];
      if (!s) return;
      modalBody.replaceChildren(buildServiceModal(s));
      modal.show(card);
    });
  });

  // ---------- Abas de componentes (padrão WAI-ARIA tabs) ----------
  const tabs = $$('.solution-tab');

  function selectTab(tab, focus = false) {
    tabs.forEach((t) => {
      const active = t === tab;
      t.classList.toggle('active', active);
      t.setAttribute('aria-selected', String(active));
      t.tabIndex = active ? 0 : -1;
      $(`#${t.getAttribute('aria-controls')}`).hidden = !active;
    });
    if (focus) tab.focus();
  }

  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => selectTab(tab));
    tab.addEventListener('keydown', (e) => {
      const keys = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: tabs.length - 1 };
      if (!(e.key in keys)) return;
      e.preventDefault();
      selectTab(tabs[(keys[e.key] + tabs.length) % tabs.length], true);
    });
  });

  // ---------- Simulador ----------
  const range = $('#billRange');
  const tariffInput = $('#tariff');
  const fmtBRL = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
  const fmtNum = (n, d = 0) => n.toLocaleString('pt-BR', { minimumFractionDigits: d, maximumFractionDigits: d });

  function estimate(bill, tariff) {
    const kwh = bill / tariff;
    const toGenerate = Math.max(kwh - SIM.minimumKwh, 0);
    const kwpNeeded = toGenerate / (SIM.sunHours * 30 * SIM.performance);
    const panels = Math.max(Math.ceil((kwpNeeded * 1000) / SIM.panelWatts), 1);
    const kwp = (panels * SIM.panelWatts) / 1000;
    return { kwh, panels, kwp, area: panels * SIM.panelArea };
  }

  function currentInputs() {
    const bill = Number(range.value);
    let tariff = Number(String(tariffInput.value).replace(',', '.'));
    if (!Number.isFinite(tariff) || tariff < 0.3) tariff = 1;
    return { bill, tariff };
  }

  function updateSimulator() {
    const { bill, tariff } = currentInputs();
    const r = estimate(bill, tariff);
    $('#billValue').textContent = fmtNum(bill);
    $('#estKwh').textContent = `${fmtNum(Math.round(r.kwh / 10) * 10)} kWh/mês`;
    $('#estKwp').textContent = `${fmtNum(r.kwp, 2)} kWp`;
    $('#estPanels').textContent = `${r.panels} placas`;
    $('#estArea').textContent = `~${fmtNum(Math.ceil(r.area))} m²`;
    return { bill, tariff, ...r };
  }

  range.addEventListener('input', updateSimulator);
  tariffInput.addEventListener('input', updateSimulator);
  updateSimulator();

  $('.js-sim-whatsapp').addEventListener('click', () => {
    const r = updateSimulator();
    openWhatsapp(
      `Olá, usei o simulador do site da HelioServ.\n` +
      `• Conta média: ${fmtBRL.format(r.bill)}/mês\n` +
      `• Consumo estimado: ~${fmtNum(Math.round(r.kwh))} kWh/mês\n` +
      `• Sistema estimado: ${fmtNum(r.kwp, 2)} kWp (${r.panels} placas)\n` +
      `Gostaria de uma análise personalizada.`
    );
  });

  // ---------- Navegação ----------
  $('#year').textContent = new Date().getFullYear();

  const navCollapse = $('#navbarMenu');
  $$('#navbarMenu .nav-link').forEach((link) =>
    link.addEventListener('click', () => {
      if (navCollapse.classList.contains('show')) {
        bootstrap.Collapse.getOrCreateInstance(navCollapse).hide();
      }
    })
  );

  // ---------- Animação de entrada ----------
  const reveals = $$('.reveal');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    reveals.forEach((el) => observer.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add('visible'));
  }

  // ---------- Formulário de contato ----------
  const form = $('#contactForm');
  const notice = $('#notification');
  let noticeTimer;

  function notify(message, type) {
    clearTimeout(noticeTimer);
    notice.textContent = message;
    notice.className = `notification ${type} show`;
    noticeTimer = setTimeout(() => notice.classList.remove('show'), 5000);
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    form.classList.add('was-validated');
    if (!form.checkValidity()) {
      $(':invalid', form)?.focus();
      return;
    }

    const button = $('button[type=submit]', form);
    const label = button.innerHTML;
    button.disabled = true;
    button.textContent = 'Enviando...';

    try {
      const response = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' },
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      form.reset();
      form.classList.remove('was-validated');
      notify('Mensagem enviada! Retornaremos em breve.', 'success');
    } catch {
      notify('Não foi possível enviar agora. Fale com a gente pelo WhatsApp.', 'error');
    } finally {
      button.disabled = false;
      button.innerHTML = label;
    }
  });
})();
