"use strict";

console.log("Iniciando carregamento de clientes...");

window.dadosParaFiltrar = []; // 🔥 Agora é global e sempre atualizado

// =========================
// 1) Buscar clientes no backend
// =========================
fetch("http://localhost:3001/pessoa")
  .then((response) => response.json())
  .then((data) => {
    window.dadosParaFiltrar = data.map((item) => ({
      idpessoa: item.idpessoa,
      cpf: item.cpfpessoa,
      nome: item.nomepessoa,
    }));

    console.log("✅ Clientes recebidos:", window.dadosParaFiltrar);
  })
  .catch((error) => {
    console.error("Erro ao buscar clientes:", error);
    window.dadosParaFiltrar = [];
  });


// =========================
// 2) Componente da busca dinâmica
// =========================
function createBuscaDinamica(config) {
  console.log("📌 Criando busca dinâmica para:", config.searchInputId);

  const searchTypeElement = document.getElementById(config.searchTypeId);
  const searchInputElement = document.getElementById(config.searchInputId);
  const resultsList = document.getElementById(config.resultsListId);

  let currentResolve = null;

  // 🔥 Sempre retorna o array ATUALIZADO
  const getDados = () => window.dadosParaFiltrar || [];


  // ------- Funções auxiliares -------
  function hideList() {
    resultsList.classList.remove("show");
    resultsList.innerHTML = "";
    console.log("⬆ Lista escondida");
  }

  function renderList(filtered) {
    console.log("📄 Renderizando lista:", filtered);

    resultsList.innerHTML = "";

    if (!filtered.length) {
      console.warn("⚠ Nenhum resultado encontrado");
      hideList();
      return;
    }

    filtered.forEach((dado) => {
      const li = document.createElement("li");
      li.className = "result-item";

      li.innerHTML = `
        <span class="result-main">${dado.nome}</span>
        <span class="result-type">(${dado.cpf})</span>
      `;

      li.addEventListener("click", () => {
        hideList();

        // Preenche input com o CPF (ou nome, tanto faz — o pedido.js decide)
        searchInputElement.value = searchTypeElement.value === "cpf"
          ? dado.cpf
          : dado.nome;

        // Preenche ID oculto
        let hiddenField = document.getElementById("idpessoa_cliente");
        if (hiddenField) hiddenField.value = dado.idpessoa;

        if (currentResolve) {
          currentResolve(dado);
          currentResolve = null;
        }

        console.log("✔ Cliente selecionado:", dado);
      });

      resultsList.appendChild(li);
    });

    resultsList.classList.add("show");
  }


  // ------- Filtro principal -------
  function filterBase() {
    const query = searchInputElement.value.trim().toLowerCase();
    const type = searchTypeElement.value;

    console.log(`🔍 Digitado: "${query}" | Tipo: ${type}`);

    if (!query.length) {
      hideList();
      return;
    }

    const dados = getDados();

    const filtered = dados.filter((dado) => {
      const valor = String(dado[type] || "").toLowerCase();
      return valor.includes(query);
    });

    console.log("🔎 Resultados filtrados:", filtered);

    renderList(filtered);
  }


  // ------- Eventos -------
  searchInputElement.addEventListener("focus", () => {
    console.log("👁 Campo focado");
    filterBase();
  });

  searchInputElement.addEventListener("input", () => {
    console.log("⌨ Evento: DIGITOU no campo");
    filterBase();
  });

  document.addEventListener("click", (event) => {
    if (!event.target.closest(".search-bar-container")) hideList();
  });


  console.log("✨ Busca dinâmica criada!");
  return {
    waitForSelection() {
      return new Promise((resolve) => (currentResolve = resolve));
    },
  };
}


// =========================
// 3) Inicialização
// =========================
document.addEventListener("DOMContentLoaded", () => {
  console.log("🚀 DOM carregado — iniciando busca dinâmica...");

  // Garante que o campo oculto exista
  if (!document.getElementById("idpessoa_cliente")) {
    const hidden = document.createElement("input");
    hidden.type = "hidden";
    hidden.id = "idpessoa_cliente";
    document.getElementById("pedidoForm").appendChild(hidden);
  }

  window.bdBusca = createBuscaDinamica({
    searchTypeId: "searchType",
    searchInputId: "cliente_pessoa_cpf_pessoa",
    resultsListId: "resultsList",
  });

  console.log("✅ Busca dinâmica pronta!");
});
