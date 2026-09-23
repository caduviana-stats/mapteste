/* Etapa 02-camadas-complementares: lógica preservada do mapa original. Consulte README.md para atualização dos dados. */

(function(){
  if (window.__NOVAS_CAMADAS_SMAS_RIO_V3__) {
    console.warn('Novas camadas SMAS-Rio já foram carregadas. Remova blocos duplicados do final do HTML.');
    return;
  }
  window.__NOVAS_CAMADAS_SMAS_RIO_V3__ = true;

  const NOVOS_EQUIPAMENTOS = []; // Dados vêm de data/equipamentos.js.

  const NOVAS_CORES = {
    ALBERGUE: '#FF69B4',
    CADRIO: '#808080',
    CONSELHO_TUTELAR: '#000000',
    URS: '#0066FF',
    CENTRO_POP: '#00AA00',
    CENTRAIS: '#8B4513'
  };

  const ROTULOS = {
    ALBERGUE: 'Albergues',
    CADRIO: 'CADRio',
    CONSELHO_TUTELAR: 'Conselho Tutelar',
    URS: 'URS',
    CENTRO_POP: 'Centro POP',
    CENTRAIS: 'Centrais'
  };

  if (typeof map === 'undefined' || typeof L === 'undefined') {
    console.error('Mapa Leaflet não encontrado. Cole este bloco depois do script principal do mapa.');
    return;
  }

  if (typeof TYPE_COLORS !== 'undefined') {
    Object.assign(TYPE_COLORS, NOVAS_CORES);
  } else {
    window.TYPE_COLORS = Object.assign({}, NOVAS_CORES);
  }

  if (typeof layers === 'undefined') {
    window.layers = {};
  }

  Object.keys(NOVAS_CORES).forEach(function(tipo){
    if (!layers[tipo]) {
      layers[tipo] = L.layerGroup().addTo(map);
    }
  });

  // Evita duplicidade caso algum item já exista no FEATURES.
  const idsExistentes = new Set((typeof FEATURES !== 'undefined' ? FEATURES : []).map(function(f){
    return String((f.properties && f.properties.tipo) || '') + '|' + String((f.properties && f.properties.nome) || '');
  }));

  const novosValidos = NOVOS_EQUIPAMENTOS.filter(function(f){
    const p = f.properties || {};
    const c = f.geometry && f.geometry.coordinates;
    return p.nome && p.tipo && Array.isArray(c) && Number.isFinite(c[0]) && Number.isFinite(c[1]);
  }).filter(function(f){
    const key = String(f.properties.tipo) + '|' + String(f.properties.nome);
    if (idsExistentes.has(key)) return false;
    idsExistentes.add(key);
    return true;
  });

  if (typeof FEATURES !== 'undefined') {
    FEATURES.push.apply(FEATURES, novosValidos);
  }

  function estiloNovo(p){
    const cor = (typeof TYPE_COLORS !== 'undefined' && TYPE_COLORS[p.tipo]) ? TYPE_COLORS[p.tipo] : '#334155';
    return {
      radius: 7,
      color: '#fff',
      weight: 2,
      fillColor: cor,
      fillOpacity: .94,
      opacity: 1
    };
  }

  function abrirDetalhesNovo(p){
    if (typeof showDetails === 'function') {
      showDetails(p);
      return;
    }
    alert((p.tipo || '') + '\n' + (p.nome || '') + '\n' + (p.endereco || ''));
  }

  function adicionarMarcadorNovo(f){
    const p = f.properties;
    const coords = f.geometry.coordinates;
    const lon = coords[0];
    const lat = coords[1];

    const m = L.circleMarker([lat, lon], estiloNovo(p))
      .bindTooltip(p.nome, {
        className: 'tooltip-clean',
        direction: 'top'
      });

    m.on('click', function(){
      abrirDetalhesNovo(p);
    });

    m._props = p;

    if (!layers[p.tipo]) {
      layers[p.tipo] = L.layerGroup().addTo(map);
    }

    m.addTo(layers[p.tipo]);

    if (typeof markers !== 'undefined') {
      markers.push(m);
    }
  }

  novosValidos.forEach(function(f){
    // Usa o addMarker original quando possível; se falhar, usa marcador próprio.
    try {
      if (typeof addMarker === 'function') {
        addMarker(f);
      } else {
        adicionarMarcadorNovo(f);
      }
    } catch(e) {
      adicionarMarcadorNovo(f);
    }
  });

  // Adiciona checkboxes das novas camadas no menu esquerdo.
  const primeiraSecao = document.querySelector('.sidebar .section');
  if (primeiraSecao) {
    Object.keys(NOVAS_CORES).forEach(function(tipo){
      if (primeiraSecao.querySelector('input[data-type="' + tipo + '"]')) return;

      const div = document.createElement('div');
      div.className = 'check';
      div.innerHTML =
        '<label>' +
          '<input type="checkbox" data-type="' + tipo + '" checked>' +
          '<span><i class="dot" style="background:' + NOVAS_CORES[tipo] + '"></i> ' + ROTULOS[tipo] + '</span>' +
        '</label>';

      primeiraSecao.appendChild(div);

      const cb = div.querySelector('input');
      cb.addEventListener('change', function(){
        if (typeof applyFilters === 'function') {
          applyFilters();
        } else {
          if (cb.checked) map.addLayer(layers[tipo]);
          else map.removeLayer(layers[tipo]);
        }
      });
    });
  }

  // Adiciona itens na legenda.
  const legenda = document.querySelector('.legend-row');
  if (legenda) {
    Object.keys(NOVAS_CORES).forEach(function(tipo){
      if (legenda.querySelector('[data-legend-type="' + tipo + '"]')) return;

      const span = document.createElement('span');
      span.setAttribute('data-legend-type', tipo);
      span.innerHTML = '<i class="dot" style="background:' + NOVAS_CORES[tipo] + '"></i> ' + ROTULOS[tipo];
      legenda.appendChild(span);
    });
  }

  // Atualiza o contador da barra superior.
  function atualizarContadores(){
    const stats = document.querySelector('.stats');
    if (!stats || typeof FEATURES === 'undefined') return;

    const ordem = ['CAS','CRAS','CREAS','INSS','ALBERGUE','CADRIO','CONSELHO_TUTELAR','URS','CENTRO_POP','CENTRAIS'];
    const contagem = {};

    FEATURES.forEach(function(f){
      const tipo = f.properties && f.properties.tipo;
      if (!tipo) return;
      contagem[tipo] = (contagem[tipo] || 0) + 1;
    });

    stats.innerHTML = ordem
      .filter(function(tipo){ return contagem[tipo] > 0; })
      .map(function(tipo){
        const rotulo = ROTULOS[tipo] || tipo;
        return '<span class="pill"><b>' + contagem[tipo] + '</b> ' + rotulo + '</span>';
      })
      .join('');
  }

  atualizarContadores();

  /*
    CORREÇÃO DOS FILTROS DAS NOVAS CAMADAS
    Este trecho substitui a lógica original de filtragem por uma versão ampliada.
    Assim, ALBERGUE, CADRIO, CONSELHO_TUTELAR, URS e CENTRO_POP passam a se comportar
    exatamente como CAS, CRAS, CREAS e INSS: ao desmarcar, somem do mapa; ao marcar, voltam.
  */
  function estiloAmpliado(p){
    if (typeof markerStyle === 'function' && ['CAS','CRAS','CREAS','INSS'].includes(p.tipo)) {
      return markerStyle(p);
    }

    const cor = (typeof TYPE_COLORS !== 'undefined' && TYPE_COLORS[p.tipo])
      ? TYPE_COLORS[p.tipo]
      : (NOVAS_CORES[p.tipo] || '#334155');

    return {
      radius: p.tipo === 'CADRIO' ? 7 : 7,
      color: '#fff',
      weight: 2,
      fillColor: cor,
      fillOpacity: .94,
      opacity: 1
    };
  }


  function normalizarCas(valor){
    return String(valor || '')
      .replace(/\s+/g, ' ')
      .trim()
      .toUpperCase();
  }

  function obterCasSelecionada(){
    /*
      O arquivo original guarda selectedCas dentro do primeiro <script>.
      Em alguns navegadores/versões, esse valor não fica acessível ao bloco colado no final.
      Por isso, a fonte mais segura passa a ser o botão ativo em "Filtrar por CAS".
    */
    const ativo = document.querySelector('.cas-btn.active');
    if (ativo && ativo.textContent) return ativo.textContent.trim();

    try {
      if (typeof selectedCas !== 'undefined') return selectedCas;
    } catch(e) {}

    return 'TODAS';
  }

  function aplicarFiltrosAmpliados(){
    if (typeof layers === 'undefined' || typeof markers === 'undefined') return;

    const enabled = {};
    document.querySelectorAll('input[data-type]').forEach(function(cb){
      enabled[cb.dataset.type] = cb.checked;
    });

    Object.keys(layers).forEach(function(tipo){
      if (layers[tipo] && typeof layers[tipo].clearLayers === 'function') {
        layers[tipo].clearLayers();
      }
    });

    markers.forEach(function(m){
      const p = m._props || {};
      if (!p.tipo || !layers[p.tipo]) return;

      const casSelecionada = obterCasSelecionada();
      const casOk = (
        casSelecionada === 'TODAS' ||
        p.tipo === 'INSS' ||
        normalizarCas(p.cas) === normalizarCas(casSelecionada)
      );

      if (enabled[p.tipo] && casOk) {
        if (typeof m.setStyle === 'function') {
          m.setStyle(estiloAmpliado(p));
        }
        m.addTo(layers[p.tipo]);
      }
    });
  }

  try {
    applyFilters = aplicarFiltrosAmpliados;
  } catch(e) {
    window.applyFilters = aplicarFiltrosAmpliados;
  }

  document.querySelectorAll('input[data-type]').forEach(function(cb){
    cb.addEventListener('change', aplicarFiltrosAmpliados);
  });

  document.querySelectorAll('.cas-btn').forEach(function(btn){
    btn.addEventListener('click', function(){
      setTimeout(aplicarFiltrosAmpliados, 0);
    });
  });

  aplicarFiltrosAmpliados();

  console.log('Novas camadas SMAS-Rio carregadas com filtros CAS corrigidos:', novosValidos.length, 'equipamentos.');
})();
