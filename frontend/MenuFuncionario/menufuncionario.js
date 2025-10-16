// ===== Funções de Cookie =====
function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return decodeURIComponent(parts.pop().split(';').shift());
}

function deleteCookie(name) {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
}

// ===== Mostrar nome do funcionário logado =====
function mostrarFuncionario() {
  const cookie = getCookie("usuarioLogado");

  if (cookie) {
    try {
      const usuario = JSON.parse(cookie);
      document.getElementById("nomeFuncionario").textContent = usuario.nomepessoa || "Funcionário";
    } catch (err) {
      console.warn("Erro ao ler cookie do usuário:", err);
      window.location.href = "../LoginFuncionario/login.html"; // volta se o cookie estiver corrompido
    }
  } else {
    // sem cookie → volta para login
    window.location.href = "../LoginFuncionario/login.html";
  }
}

// ===== Logout =====
function logout() {
  deleteCookie("usuarioLogado");
  window.location.href = "../LoginFuncionario/login.html";
}

// ===== Inicialização =====
window.addEventListener("DOMContentLoaded", mostrarFuncionario);
