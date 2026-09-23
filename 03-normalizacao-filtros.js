/* Etapa 03-normalizacao-filtros: lógica preservada do mapa original. Consulte README.md para atualização dos dados. */

(function(){
  if (typeof map === 'undefined' || typeof layers === 'undefined' || typeof markers === 'undefined') {
    console.warn('Mapa, layers ou markers não encontrados. Cole este bloco depois do script principal do mapa.');
    return;
  }

  const TIPO_CANONICO = {
    'ALBERGUES': 'ALBERGUE',
    'ALBERGUE': 'ALBERGUE',
    'CADRIO': 'CADRIO',
    'CADRIO ': 'CADRIO',
    'CONSELHO TUTELAR': 'CONSELHO_TUTELAR',
    'CONSELHO_TUTELAR': 'CONSELHO_TUTELAR',
    'CONTUTELAR': 'CONSELHO_TUTELAR',
    'URS': 'URS',
    'CENTRO POP': 'CENTRO_POP',
    'CENTRO_POP': 'CENTRO_POP',
    'CENTROPOP': 'CENTRO_POP',
    'CAS': 'CAS',
    'CRAS': 'CRAS',
    'CREAS': 'CREAS',
    'INSS': 'INSS'
  };

  const TIPO_LABEL = {
    CAS: 'CAS',
    CRAS: 'CRAS',
    CREAS: 'CREAS',
    INSS: 'INSS',
    ALBERGUE: 'Albergues',
    CADRIO: 'CADRio',
    CONSELHO_TUTELAR: 'Conselho Tutelar',
    URS: 'URS',
    CENTRO_POP: 'Centro POP'
  };

  const CORES = {
    CAS:'#F97316',
    CRAS:'#FACC15',
    CREAS:'#DC2626',
    INSS:'#5B2C83',
    ALBERGUE:'#EC4899',
    CADRIO:'#808080',
    CONSELHO_TUTELAR:'#000000',
    URS:'#2563EB',
    CENTRO_POP:'#16A34A'
  };

  function normalizarTexto(v){
    return String(v || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, ' ')
      .trim()
      .toUpperCase();
  }

  function normalizarTipo(v){
    const bruto = String(v || '').trim();
    const chave = normalizarTexto(bruto).replace(/-/g, ' ');
    return TIPO_CANONICO[chave] || TIPO_CANONICO[bruto] || bruto.toUpperCase().replace(/\s+/g, '_');
  }

  function normalizarCAS(v){
    const s = normalizarTexto(v);
    if (!s || s === 'TODAS') return 'TODAS';
    const m = s.match(/(\d{1,2})\s*(?:A|ª|O|º)?\s*CAS/);
    if (m) return parseInt(m[1], 10) + 'ª CAS';
    return s;
  }

  function corTipo(tipo){
    return CORES[normalizarTipo(tipo)] || '#64748B';
  }

  window.TYPE_COLORS = Object.assign(window.TYPE_COLORS || {}, CORES);

  function estiloMarcadorCorrigido(p){
    const tipo = normalizarTipo(p.tipo);
    const raio = tipo === 'CAS' ? 9 : (tipo === 'INSS' ? 7 : 6);
    return {
      radius: raio,
      color: '#fff',
      weight: 2,
      fillColor: corTipo(tipo),
      fillOpacity: .92,
      opacity: 1
    };
  }

  function garantirCamadas(){
    markers.forEach(function(m){
      if (!m || !m._props) return;
      const tipo = normalizarTipo(m._props.tipo);
      m._props.tipo = tipo;
      if (!layers[tipo]) layers[tipo] = L.layerGroup().addTo(map);
    });
  }

  function getCASAtiva(){
    const ativo = document.querySelector('.cas-btn.active');
    return normalizarCAS(ativo ? ativo.textContent : 'TODAS');
  }

  function getTiposHabilitados(){
    const habilitados = {};

    document.querySelectorAll('input[data-type]').forEach(function(cb){
      habilitados[normalizarTipo(cb.dataset.type)] = cb.checked;
    });

    document.querySelectorAll('.check label').forEach(function(label){
      const cb = label.querySelector('input[type="checkbox"]');
      if (!cb) return;
      const texto = label.textContent || '';
      const tipo = normalizarTipo(cb.dataset.type || texto);
      habilitados[tipo] = cb.checked;
      cb.dataset.type = tipo;
    });

    return habilitados;
  }

  function limparTodasAsCamadas(){
    Object.keys(layers).forEach(function(k){
      if (layers[k] && typeof layers[k].clearLayers === 'function') {
        layers[k].clearLayers();
      }
    });
  }

  window.applyFilters = function(){
    garantirCamadas();

    const casAtiva = getCASAtiva();
    const habilitados = getTiposHabilitados();

    limparTodasAsCamadas();

    markers.forEach(function(m){
      if (!m || !m._props) return;

      const p = m._props;
      const tipo = normalizarTipo(p.tipo);
      const casDoEquipamento = normalizarCAS(p.cas);

      p.tipo = tipo;

      const camadaLigada = habilitados[tipo] !== false;

      // Mantém a regra original: INSS não pertence a uma CAS específica.
      // Todos os demais equipamentos, inclusive os novos, obedecem ao filtro por CAS.
      const casOk = casAtiva === 'TODAS' || tipo === 'INSS' || casDoEquipamento === casAtiva;

      if (camadaLigada && casOk) {
        if (typeof m.setStyle === 'function') m.setStyle(estiloMarcadorCorrigido(p));
        if (!layers[tipo]) layers[tipo] = L.layerGroup().addTo(map);
        m.addTo(layers[tipo]);
      }
    });
  };

  function reconfigurarBotoesCAS(){
    document.querySelectorAll('.cas-btn').forEach(function(btn){
      btn.onclick = function(){
        document.querySelectorAll('.cas-btn').forEach(function(x){ x.classList.remove('active'); });
        btn.classList.add('active');
        window.applyFilters();
      };
    });
  }

  function reconfigurarCheckboxes(){
    document.querySelectorAll('input[data-type]').forEach(function(cb){
      cb.dataset.type = normalizarTipo(cb.dataset.type);
      cb.onchange = window.applyFilters;
    });
  }

  function atualizarContadoresSuperiores(){
    const stats = document.querySelector('.stats');
    if (!stats) return;

    const ordem = ['CAS','CRAS','CREAS','INSS','ALBERGUE','CADRIO','CONSELHO_TUTELAR','URS','CENTRO_POP','CENTRAIS'];
    const contagem = {};

    markers.forEach(function(m){
      if (!m || !m._props) return;
      const tipo = normalizarTipo(m._props.tipo);
      contagem[tipo] = (contagem[tipo] || 0) + 1;
    });

    stats.innerHTML = ordem
      .filter(function(tipo){ return contagem[tipo]; })
      .map(function(tipo){
        return '<span class="pill"><b>' + contagem[tipo] + '</b> ' + TIPO_LABEL[tipo] + '</span>';
      })
      .join('');
  }

  function corrigirDrawerCores(){
    const originalShowDetails = window.showDetails;
    if (typeof originalShowDetails !== 'function') return;

    window.showDetails = function(p){
      p.tipo = normalizarTipo(p.tipo);
      originalShowDetails(p);
      const type = document.getElementById('drawerType');
      if (type) type.style.background = corTipo(p.tipo);
    };
  }

  garantirCamadas();
  reconfigurarBotoesCAS();
  reconfigurarCheckboxes();
  atualizarContadoresSuperiores();
  corrigirDrawerCores();
  window.applyFilters();
})();
