/* Etapa 08-acesso: lógica preservada do mapa original. Consulte README.md para atualização dos dados. */

(function configurarControleDeAcesso(){
  const HASH_AUTORIZADO = '9477ef9b7256118969dcc15145714f06c7e67c1331c3ca63435015d9b74da8e3';
  const CHAVE_SESSAO = 'sig-smas-acesso-validado';
  const gate = document.getElementById('accessGate');
  const form = document.getElementById('accessForm');
  const passwordInput = document.getElementById('accessPassword');
  const errorMessage = document.getElementById('accessError');

  function acessoJaValidado(){
    try {
      return sessionStorage.getItem(CHAVE_SESSAO) === 'sim';
    } catch (erro) {
      return false;
    }
  }

  function registrarAcesso(){
    try {
      sessionStorage.setItem(CHAVE_SESSAO, 'sim');
    } catch (erro) {
      /* O mapa ainda sera liberado se o navegador bloquear sessionStorage. */
    }
  }

  function liberarMapa(){
    registrarAcesso();
    document.body.classList.remove('app-locked');
    gate.hidden = true;

    /* Recalcula o tamanho depois que o mapa deixa de estar oculto. */
    setTimeout(function(){
      if (typeof map !== 'undefined' && map && typeof map.invalidateSize === 'function') {
        map.invalidateSize();
      }
    }, 0);
  }

  async function calcularHash(texto){
    const bytes = new TextEncoder().encode(texto);
    const digest = await crypto.subtle.digest('SHA-256', bytes);
    return Array.from(new Uint8Array(digest))
      .map(function(byte){ return byte.toString(16).padStart(2, '0'); })
      .join('');
  }

  if (acessoJaValidado()) {
    liberarMapa();
    return;
  }

  form.addEventListener('submit', async function(event){
    event.preventDefault();
    errorMessage.textContent = '';

    try {
      const hashInformado = await calcularHash(passwordInput.value);

      if (hashInformado === HASH_AUTORIZADO) {
        passwordInput.value = '';
        liberarMapa();
        return;
      }

      errorMessage.textContent = 'Senha incorreta. Tente novamente.';
      passwordInput.select();
    } catch (erro) {
      errorMessage.textContent = 'Não foi possível validar a senha neste navegador.';
    }
  });
})();
