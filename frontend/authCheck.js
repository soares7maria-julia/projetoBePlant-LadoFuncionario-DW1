// authCheck.js
// Protege páginas verificando cookie "usuarioLogado".
// Se não encontrar cookie válido, redireciona para a página de login.

(function () {
  const REDIRECT_TO = "../../LoginFuncionario/login.html"; // ajuste para sua página de login (p.ex. "/menuFuncionario.html" se for esse o caso)
  const COOKIE_NAME = "usuarioLogado";

  function log(...args) {
    // console.log ativado para debugar — comente se quiser silêncio
    console.log("[authCheck]", ...args);
  }

  function getCookie(name) {
    const cookies = document.cookie ? document.cookie.split(";") : [];
    for (let c of cookies) {
      const [k, ...v] = c.trim().split("=");
      if (k === name) return v.join("=");
    }
    return null;
  }

  function tryParseCookie(value) {
    if (!value) return null;
    try {
      // alguns cookies podem vir com encoding; tentamos decodificar se necessário
      let raw = value;
      try { raw = decodeURIComponent(value); } catch(e) { /* ignora */ }
      // remove aspas externas se existirem
      if (raw.startsWith('"') && raw.endsWith('"')) raw = raw.slice(1, -1);
      // tenta parse JSON
      const parsed = JSON.parse(raw);
      return parsed;
    } catch (err) {
      log("Falha ao parsear cookie:", err, "valor:", value);
      return null;
    }
  }

  function redirectToLogin() {
    log("Usuário não autenticado — redirecionando para:", REDIRECT_TO);
    // evita loop se já estivermos na página de login
    if (location.pathname.endsWith(REDIRECT_TO) || location.pathname.includes("login")) return;
    location.href = REDIRECT_TO;
  }

  function verificarLogin() {
    try {
      const cookieVal = getCookie(COOKIE_NAME);
      if (!cookieVal) {
        log("Cookie não encontrado");
        return redirectToLogin();
      }

      const usuario = tryParseCookie(cookieVal);
      if (!usuario || (!usuario.idpessoa && !usuario.id) ) {
        log("Cookie inválido ou sem id:", usuario);
        return redirectToLogin();
      }

      // tudo ok — você pode colocar elementos na UI com os dados do usuário aqui
      log("Usuário autenticado:", usuario);
      // exemplo: mostrar nome num elemento com id="nomeUsuarioHeader" se existir
      const el = document.getElementById("nomeUsuarioHeader");
      if (el && usuario.nomepessoa) el.textContent = usuario.nomepessoa;
    } catch (err) {
      console.error("[authCheck] erro inesperado:", err);
      redirectToLogin();
    }
  }

  // executa assim que o script for carregado
  verificarLogin();
})();
