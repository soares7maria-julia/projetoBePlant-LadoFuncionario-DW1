console.log("INICIANDO FETCH DE CLIENTES...");

"use strict"; //Impede uso de variáveis sem declarar


const atributosParaPesquisar = ["cpf", "nome"];
let dadosParaFiltrar = [];

// Busca os clientes no backend
fetch("http://localhost:3001/pessoa")
  .then((response) => response.json())
  .then((data) => {
    dadosParaFiltrar = data.map((item) => ({
      cpf: item.cpfpessoa,
      nome: item.nomepessoa,
    }));
    console.log("Clientes carregados:", dadosParaFiltrar);
  })
  .catch((error) => {
    console.error("Erro ao buscar clientes:", error);
    dadosParaFiltrar = [];
  });


// Cria o mecanismo de busca dinâmica

function createBuscaDinamica({
  searchTypeId,
  searchInputId,
  resultsListId,
  atributosParaPesquisar,
  dadosParaFiltrar,
}) {
  const searchTypeElement = document.getElementById(searchTypeId);
  const searchInputElement = document.getElementById(searchInputId);
  const resultsList = document.getElementById(resultsListId);
  let currentResolve = null;

  function hideList() {
    resultsList.classList.remove("show");
    resultsList.innerHTML = "";
  }

  function renderList(filtered) {
    resultsList.innerHTML = "";

    if (!filtered.length) {
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
        searchInputElement.value = dado.cpf; // coloca CPF no input

        if (currentResolve) {
          currentResolve(dado);
          currentResolve = null;
        }
      });

      resultsList.appendChild(li);
    });

    resultsList.classList.add("show");
  }

  function filterBase() {
    const query = searchInputElement.value.trim().toLowerCase();
    const type = searchTypeElement.value;

    if (!query.length) {
      hideList();
      return;
    }

    const filtered = dadosParaFiltrar.filter((dado) => {
      const valor = String(dado[type] || "").toLowerCase();
      return valor.includes(query);
    });

    renderList(filtered);
  }

  // eventos responsáveis pela busca
  searchInputElement.addEventListener("input", filterBase);
  searchInputElement.addEventListener("focus", filterBase);

  // Fecha a lista se clicar fora
  document.addEventListener("click", (event) => {
    if (!event.target.closest(".search-bar-container")) {
      hideList();
      if (currentResolve) {
        currentResolve(null);
        currentResolve = null;
      }
    }
  });

  return {
    waitForSelection() {
      return new Promise((resolve) => {
        currentResolve = resolve;
      });
    },
  };
}


let bdBusca = null;

document.addEventListener("DOMContentLoaded", () => {
  console.log("Criando busca dinâmica...");

  bdBusca = createBuscaDinamica({
    searchTypeId: "searchType",
    searchInputId: "cliente_pessoa_cpf_pessoa",
    resultsListId: "resultsList",
    atributosParaPesquisar,
    dadosParaFiltrar,
  });
});
