/* Etapa 04-mobile: lógica preservada do mapa original. Consulte README.md para atualização dos dados. */

/* 07.2 — Botão móvel e abertura do menu de camadas */
(function(){
  const sidebar = document.querySelector('.sidebar');
  const mapEl = document.getElementById('map');

  if(!sidebar || !mapEl) return;

  const btn = document.createElement('button');
  btn.className = 'mobile-layer-btn';
  btn.innerHTML = '☰ Camadas';

  document.body.appendChild(btn);

  btn.addEventListener('click', function(){
    sidebar.classList.toggle('mobile-open');
  });

  mapEl.addEventListener('click', function(){
    sidebar.classList.remove('mobile-open');
  });

  window.addEventListener('resize', function(){
    if(window.innerWidth > 768){
      sidebar.classList.remove('mobile-open');
    }
  });
})();
