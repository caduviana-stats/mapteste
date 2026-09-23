/* Etapa 01-mapa-principal: lógica preservada do mapa original. Consulte README.md para atualização dos dados. */

/* 04.1 — Base de dados: CAS, CRAS e CREAS */
const FEATURES = window.SMAS_FEATURES;
if (!Array.isArray(FEATURES)) throw new Error("Dados do mapa não carregados. Gere data/equipamentos.js.");
const INSS_FEATURES = []; // Os registros do INSS agora vêm da planilha.
/* 04.3 — Configurações visuais, mapa-base e grupos de camadas */

const TYPE_COLORS={CAS:'#F97316',CRAS:'#FACC15',CREAS:'#DC2626',INSS:'#5B2C83',CADRIO:'#808080',ALBERGUE:'#FF69B4',CONSELHO_TUTELAR:'#000000',URS:'#0066FF',CENTRO_POP:'#00AA00',CENTRAIS:'#8B4513'};
const CAS_COLORS={"1ª CAS": "#2563EB", "2ª CAS": "#16A34A", "3ª CAS": "#F97316", "4ª CAS": "#DC2626", "5ª CAS": "#7C3AED", "6ª CAS": "#0891B2", "7ª CAS": "#CA8A04", "8ª CAS": "#92400E", "9ª CAS": "#DB2777", "10ª CAS": "#475569"};
const MAP_CONFIG=Object.freeze({center:[-22.91,-43.39],initialZoom:10,minZoom:10,maxZoom:16});
const map=L.map('map',{zoomControl:true,minZoom:MAP_CONFIG.minZoom,maxZoom:MAP_CONFIG.maxZoom,zoomSnap:1,zoomDelta:1,preferCanvas:true}).setView(MAP_CONFIG.center,MAP_CONFIG.initialZoom);
map.setMaxBounds([[-23.12,-43.83],[-22.70,-43.05]]);
/* Esri Light Gray Canvas: fundo claro sem chave de API. A cartografia e os
   rotulos ficam separados para que os nomes permaneçam sobre os territorios. */
const BASE_MAP_URL='https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}';
const LABELS_MAP_URL='https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Reference/MapServer/tile/{z}/{y}/{x}';
const BASE_MAP_OPTIONS={attribution:'Tiles &copy; Esri',minNativeZoom:0,maxNativeZoom:16,maxZoom:MAP_CONFIG.maxZoom,crossOrigin:true,updateWhenIdle:true,updateWhenZooming:false,keepBuffer:4};

L.tileLayer(BASE_MAP_URL,BASE_MAP_OPTIONS).addTo(map);

map.createPane('labelsPane');
map.getPane('labelsPane').classList.add('leaflet-labels-pane');
map.getPane('labelsPane').style.zIndex=450;
L.tileLayer(LABELS_MAP_URL,{...BASE_MAP_OPTIONS,pane:'labelsPane'}).addTo(map);
const layers = {};
[...new Set(FEATURES.map(f => f.properties.tipo))].forEach(tipo => { layers[tipo] = L.layerGroup().addTo(map); });
const markers=[];

/* 04.4 — Utilitários, marcadores e painel lateral de detalhes */
function escapeHtml(s){return String(s||'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));}
function splitList(s){return String(s||'').split(/,|;| e /).map(x=>x.trim()).filter(Boolean).slice(0,60)}
function markerStyle(p){let size=p.tipo==='CAS'?18:(p.tipo==='INSS'?14:12);let color=TYPE_COLORS[p.tipo];return {radius:size/2,color:'#fff',weight:2,fillColor:color,fillOpacity:.92,opacity:1};}
function showDetails(p){document.getElementById('drawer').classList.add('open');const type=document.getElementById('drawerType');type.textContent=p.tipo;type.style.background=TYPE_COLORS[p.tipo];document.getElementById('drawerTitle').textContent=p.nome;let abrang=splitList(p.abrangencia);const vinculo=p.tipo==='INSS'?'Agência do INSS':`${escapeHtml(p.cas)} — ${escapeHtml(p.cas_nome)}`;const vinculoTitulo=p.tipo==='INSS'?'Tipo de equipamento':'CAS responsável';document.getElementById('drawerBody').innerHTML=`<div class="field"><b>${vinculoTitulo}</b><div>${vinculo}</div></div><div class="field"><b>Endereço</b><div>${escapeHtml(p.endereco)||'<span class="muted">Não informado</span>'}</div></div><div class="field"><b>Bairro</b><div>${escapeHtml(p.bairro)||'<span class="muted">Não identificado</span>'}</div></div><div class="field"><b>E-mail</b><div>${escapeHtml(p.email)||'<span class="muted">Não informado</span>'}</div></div>${p.tipo==='INSS'?'':`<div class="field"><b>Responsável</b><div>${escapeHtml(p.responsavel)||'<span class="muted">Não informado</span>'}</div></div><div class="field"><b>Abrangência</b><div>${abrang.length?'<ul class="list">'+abrang.map(x=>`<li>${escapeHtml(x)}</li>`).join('')+'</ul>':'<span class="muted">Não informada</span>'}</div></div>`}<div class="field"><b>Observação técnica</b><div class="muted">${escapeHtml(p.precisao)}</div></div>`;}
function addMarker(f){const p=f.properties; const [lon,lat]=f.geometry.coordinates; const m=L.circleMarker([lat,lon],markerStyle(p)).bindTooltip(p.nome,{className:'tooltip-clean',direction:'top'});m.on('click',()=>showDetails(p));m._props=p;m.addTo(layers[p.tipo]);markers.push(m); if(p.tipo==='CAS'){m.bindTooltip(p.cas,{permanent:true,className:'label-cas',direction:'right',offset:[10,0]});}}
FEATURES.forEach(addMarker);

/* 04.5 — Filtro por CAS e controle de visibilidade das camadas */
const casGrid=document.getElementById('casGrid');let selectedCas='TODAS';['TODAS','1ª CAS','2ª CAS','3ª CAS','4ª CAS','5ª CAS','6ª CAS','7ª CAS','8ª CAS','9ª CAS','10ª CAS'].forEach(c=>{const b=document.createElement('button');b.className='cas-btn'+(c==='TODAS'?' active':'');b.textContent=c;b.onclick=()=>{selectedCas=c;document.querySelectorAll('.cas-btn').forEach(x=>x.classList.remove('active'));b.classList.add('active');applyFilters();};casGrid.appendChild(b);});
document.querySelectorAll('input[data-type]').forEach(cb=>cb.addEventListener('change',applyFilters));
function applyFilters(){const enabled={};document.querySelectorAll('input[data-type]').forEach(cb=>enabled[cb.dataset.type]=cb.checked);Object.values(layers).forEach(l=>l.clearLayers());markers.forEach(m=>{const p=m._props;const casOk=(selectedCas==='TODAS'||p.tipo==='INSS'||p.cas===selectedCas);if(enabled[p.tipo]&&casOk){m.setStyle(markerStyle(p));m.addTo(layers[p.tipo]);}});}
function focusMarker(m){const p=m._props;map.setView(m.getLatLng(),14,{animate:true});showDetails(p);m.setStyle({...markerStyle(p),radius:(p.tipo==='CAS'?12:(p.tipo==='INSS'?11:10)),fillOpacity:1});setTimeout(()=>m.setStyle(markerStyle(p)),1200);}
/* 04.6 — Pesquisa de equipamentos e navegação para resultados */
const input=document.getElementById('searchInput'), results=document.getElementById('results');
input.addEventListener('input',()=>{const q=input.value.trim().toLowerCase();results.innerHTML='';if(q.length<2){results.style.display='none';return;}const found=markers.filter(m=>{const p=m._props;return [p.nome,p.tipo,p.cas,p.cas_nome,p.bairro,p.endereco,p.abrangencia].join(' ').toLowerCase().includes(q)}).slice(0,10);found.forEach(m=>{const p=m._props;const div=document.createElement('div');div.className='result';div.innerHTML=`<b>${escapeHtml(p.nome)}</b><p>${escapeHtml(p.tipo)}${p.cas?' · '+escapeHtml(p.cas):''} · ${escapeHtml(p.bairro||p.cas_nome||'')}</p>`;div.onclick=()=>{results.style.display='none';input.value=p.nome;focusMarker(m)};results.appendChild(div);});results.style.display=found.length?'block':'none';});
document.getElementById('closeDrawer').onclick=()=>document.getElementById('drawer').classList.remove('open');
map.on('click',()=>{results.style.display='none'});
