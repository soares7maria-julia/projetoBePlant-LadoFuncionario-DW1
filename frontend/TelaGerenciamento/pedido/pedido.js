// ===============================
// CRUD PEDIDO - BEPLANT (VERSÃO FINAL CORRIGIDA)
// ===============================

const API_BASE_URL = "http://localhost:3001";

let operacao = null;
let pedidoAtual = null;

// Referências do DOM
const form = document.getElementById("pedidoForm");
const searchId = document.getElementById("searchId");
const btnBuscar = document.getElementById("btnBuscar");
const btnIncluir = document.getElementById("btnIncluir");
const btnAlterar = document.getElementById("btnAlterar");
const btnExcluir = document.getElementById("btnExcluir");
const btnSalvar = document.getElementById("btnSalvar");
const btnCancelar = document.getElementById("btnCancelar");
const itensTableBody = document.getElementById("itensTableBody");
const messageContainer = document.getElementById("messageContainer");

const dataPedido = document.getElementById("datapedido");
const clienteInput = document.getElementById("cliente_pessoa_cpf_pessoa");

// ===============================
// MENSAGENS
// ===============================
function showMessage(text, type = "info") {
  const div = document.createElement("div");
  div.className = `message ${type}`;
  div.textContent = text;
  messageContainer.innerHTML = "";
  messageContainer.appendChild(div);
  setTimeout(() => (div.style.opacity = "0"), 3000);
}

// ===============================
// BOTÕES / FORMULÁRIO
// ===============================
function limparFormulario() {
  form.reset();
  itensTableBody.innerHTML = "";
  pedidoAtual = null;
  operacao = null;
  alternarBotoes("inicio");
  atualizarTotal();
}

function alternarBotoes(estado) {
  const estados = {
    inicio: { buscar: true, incluir: true, alterar: false, excluir: false, salvar: false },
    visualizar: { buscar: true, incluir: false, alterar: true, excluir: true, salvar: false },
    editando: { buscar: false, incluir: false, alterar: false, excluir: false, salvar: true }
  };

  const s = estados[estado];
  btnBuscar.style.display = s.buscar ? "inline-block" : "none";
  btnIncluir.style.display = s.incluir ? "inline-block" : "none";
  btnAlterar.style.display = s.alterar ? "inline-block" : "none";
  btnExcluir.style.display = s.excluir ? "inline-block" : "none";
  btnSalvar.style.display = s.salvar ? "inline-block" : "none";
  btnCancelar.style.display = "inline-block";
}

// ===============================
// BUSCAR PEDIDO
// ===============================
async function buscarPedido() {
  const id = searchId.value.trim();
  if (!id) return showMessage("Digite um ID.", "warning");

  try {
    const res = await fetch(`${API_BASE_URL}/pedido/${id}`);
    const pedido = await res.json();

    if (pedido.exists === false) {
      pedidoAtual = null;
      operacao = "incluir";

      itensTableBody.innerHTML = "";
      form.reset();
      searchId.value = id;

      alternarBotoes("editando");
      showMessage("Pedido não encontrado. Você pode criar esse pedido.", "info");
      return;
    }

    pedidoAtual = pedido;

    preencherFormulario(pedido);
    await carregarItensDoBackend(pedido.idpedido);

    alternarBotoes("visualizar");
    showMessage("Pedido carregado!", "success");

  } catch (err) {
    console.error("Erro:", err);
    showMessage("Erro ao buscar o pedido.", "error");
  }
}

// ===============================
// CARREGAR CLIENTE (CPF/NOME)
// ===============================
async function preencherCliente(idpessoa) {
  try {
    const res = await fetch(`${API_BASE_URL}/pessoa/${idpessoa}`);
    if (!res.ok) return;

    const pessoa = await res.json();
    const modo = document.getElementById("searchType").value;

    document.getElementById("idpessoa_cliente").value = pessoa.idpessoa;

    clienteInput.value = modo === "cpf" ? pessoa.cpfpessoa : pessoa.nomepessoa;

  } catch (e) {
    console.error("Erro ao preencher cliente:", e);
  }
}

// ===============================
// PAGAMENTO - CONSULTAR STATUS
// ===============================
async function verificarPagamento(idpedido) {
  try {
 const resp = await fetch(`${API_BASE_URL}/pedido_pago/${idpedido}`, {
  method: "GET",
  headers: { "Accept": "application/json" }
});

    if (resp.status === 404) {
      console.log("Pedido ainda não foi pago");
      return false;
    }

    if (!resp.ok) return false;

    const data = await resp.json();
    return data.pago === true;
  } catch (e) {
    console.error("Erro ao verificar pagamento:", e);
    return false;
  }
}



// ===============================
// PAGAMENTO - SALVAR STATUS
// ===============================
async function salvarStatusPagamento(idpedido) {
  const chk = document.getElementById("chkPago");
  const pago = chk.checked;

  if (!idpedido) {
    console.warn("ERRO: idpedido indefinido ao salvar pagamento.");
    return;
  }

  if (pago) {
    // Criar pagamento
    await fetch(`${API_BASE_URL}/pedido_pago`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        idpedido,
        idpessoa: document.getElementById("idpessoa_cliente").value,
        datapagamento: new Date().toISOString().slice(0, 10),
        valortotal: atualizarTotal(),
        formapagamento: "PIX"
      })
    });
  } else {
    // Remover pagamento
    await fetch(`${API_BASE_URL}/pedido_pago/${idpedido}`, {
      method: "DELETE"
    });
  }
}
async function preencherFormulario(pedido) {
  dataPedido.value = pedido.datapedido?.substring(0, 10) || "";
  await preencherCliente(pedido.idpessoa);

  const chk = document.getElementById("chkPago");
  const box = document.getElementById("pagoGroup");

  const pago = await verificarPagamento(pedido.idpedido);

  chk.checked = pago;

  if (pago) box.classList.add("pago-ativo");
  else box.classList.remove("pago-ativo");
}

// ===============================
// SALVAR PEDIDO
// ===============================
async function salvarPedido() {
  const idpessoaHidden = document.getElementById("idpessoa_cliente").value;

  if (!idpessoaHidden) {
    return showMessage("Selecione um cliente válido na lista.", "warning");
  }

  const pedido = {
    datapedido: dataPedido.value,
    idpessoa: idpessoaHidden,
    valortotal: atualizarTotal()
  };

  try {
    let res;

    if (operacao === "incluir") {
      res = await fetch(`${API_BASE_URL}/pedido`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pedido)
      });
    } else if (operacao === "alterar") {
      res = await fetch(`${API_BASE_URL}/pedido/${pedidoAtual.idpedido}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pedido)
      });
    }
if (!res.ok) throw new Error("Erro ao salvar pedido.");
let idSalvo;

// Inclusão → pega ID retornado
if (operacao === "incluir") {
  const data = await res.json();
  idSalvo = data.idpedido;
}

// Alteração → usa o ID atual
else if (operacao === "alterar") {
  idSalvo = pedidoAtual.idpedido;
}

// Segurança extra: se ainda deu undefined
if (!idSalvo) {
  idSalvo = searchId.value;
}

// Salvar status de pagamento
await salvarStatusPagamento(idSalvo);


showMessage("Pedido salvo com sucesso!", "success");
limparFormulario();

  } catch (err) {
    showMessage(err.message, "error");
  }
}


// ===============================
// EXCLUIR PEDIDO
// ===============================
async function excluirPedido() {
  if (!pedidoAtual) return showMessage("Nenhum pedido carregado.", "warning");

  if (!confirm("Excluir pedido?")) return;

  try {
    const res = await fetch(`${API_BASE_URL}/pedido/${pedidoAtual.idpedido}`, {
      method: "DELETE"
    });

    if (!res.ok) throw new Error("Erro ao excluir pedido.");

    showMessage("Pedido excluído!", "success");
    limparFormulario();

  } catch (err) {
    showMessage(err.message, "error");
  }
}

// ===============================
// CARREGAR ITENS DO PEDIDO
// ===============================
async function carregarItensDoBackend(idpedido) {
  try {
    const res = await fetch(`${API_BASE_URL}/pedido_item/${idpedido}`);

    if (!res.ok) {
      if (res.status === 404) {
        itensTableBody.innerHTML = "";
        atualizarTotal();
        return;
      }
      throw new Error("Erro ao carregar itens.");
    }

    const itens = await res.json();
    renderizarTabelaItensPedido(itens || []);

  } catch (err) {
    console.error("Erro carregarItensDoBackend:", err);
    itensTableBody.innerHTML = "";
    atualizarTotal();
  }
}

// ===============================
// RENDERIZAR ITENS NA TABELA
// ===============================
function renderizarTabelaItensPedido(itens) {
  const tbody = itensTableBody;
  tbody.innerHTML = "";

  if (!Array.isArray(itens)) itens = [itens];

  itens.forEach(item => criarLinhaItem(item));

  atualizarTotal();
}

// =====================================================
// CRIAR LINHA DE ITEM (usado ao carregar e ao adicionar)
// =====================================================
function criarLinhaItem(item = {}) {
  const row = document.createElement("tr");

  const qtd = item.quantidade ?? 1;
const valor = Number(item.valorunitario) || 0;
  const subtotal = (qtd * valor).toFixed(2);

  row.innerHTML = `
    <td class="td-idpedido">${item.idpedido ?? pedidoAtual?.idpedido ?? ""}</td>
    <td><input type="number" class="iditem-input" value="${item.iditem ?? ""}" min="1"></td>
    <td class="nomeitem-cell">${item.nomeitem ?? ""}</td>
    <td><input type="number" class="quantidade-input" value="${qtd}" min="1"></td>
    <td><input type="number" class="valorunitario-input" value="${valor.toFixed(2)}" step="0.01" readonly></td>
    <td class="subtotal-cell">${subtotal}</td>
    <td><button class="btn-save btn-small" onclick="salvarItem(this)">💾</button></td>
    <td><button class="btn-danger btn-small" onclick="removerItem(this)">🗑</button></td>
  `;

  configurarEventosDaLinha(row);
  itensTableBody.appendChild(row);
}

// =====================================================
// ADICIONAR LINHA VAZIA PARA NOVO ITEM
// =====================================================
function adicionarItem() {
  const row = document.createElement("tr");

  row.innerHTML = `
    <td class="td-idpedido">${pedidoAtual?.idpedido ?? searchId.value}</td>
    <td><input type="number" class="iditem-input" min="1"></td>
    <td class="nomeitem-cell"></td>
    <td><input type="number" class="quantidade-input" value="1" min="1"></td>
    <td><input type="number" class="valorunitario-input" value="0.00" step="0.01" readonly></td>
    <td class="subtotal-cell">0.00</td>
    <td><button class="btn-save btn-small" onclick="salvarItem(this)">Adicionar</button></td>
    <td><button class="btn-danger btn-small" onclick="removerItem(this)">Cancelar</button></td>
  `;

  configurarEventosDaLinha(row);
  itensTableBody.appendChild(row);
}

// =====================================================
// CONFIGURA EVENTOS DA LINHA (qtd, valor, iditem)
// =====================================================
function configurarEventosDaLinha(row) {
  const qtdInput = row.querySelector(".quantidade-input");
  const valInput = row.querySelector(".valorunitario-input");
  const iditemInput = row.querySelector(".iditem-input");
  const nomeCell = row.querySelector(".nomeitem-cell");
  const subtotalCell = row.querySelector(".subtotal-cell");

  // Atualiza subtotal ao alterar quantidade ou valor
  const updateSubtotal = () => {
    const q = Number(qtdInput.value) || 0;
    const v = Number(valInput.value) || 0;
    subtotalCell.textContent = (q * v).toFixed(2);
    atualizarTotal();
  };

  qtdInput.addEventListener("input", updateSubtotal);
  valInput.addEventListener("input", updateSubtotal);

  // Buscar produto automaticamente ao digitar ID
  iditemInput.addEventListener("change", async () => {
  const id = iditemInput.value;
  if (!id) return;

  try {
    const res = await fetch(`${API_BASE_URL}/produto/${id}`);
    if (!res.ok) {
      nomeCell.textContent = "❌ Produto inexistente";
      valInput.value = "0.00";
      updateSubtotal();
      return;
    }

    const produto = await res.json();

    // ✔ Nome correto
    nomeCell.textContent = produto.nomeitem;

    // ✔ Valor correto
    const preco = Number(produto.valorunitario) || 0;

    // ✔ Campo não editável
    valInput.value = preco.toFixed(2);
    valInput.setAttribute("readonly", true);

    updateSubtotal();
  } catch (error) {
    console.error("Erro ao buscar produto:", error);
  }
});
}

// =====================================================
// OBTER ITENS DA TABELA
// =====================================================
function obterItensTabela() {
  return [...document.querySelectorAll("#itensTableBody tr")].map(row => ({
    idpedido: Number(
      row.querySelector(".td-idpedido").textContent || pedidoAtual?.idpedido
    ),
    iditem: Number(row.querySelector(".iditem-input").value) || null,
    quantidade: Number(row.querySelector(".quantidade-input").value) || 0,
    valorunitario: Number(row.querySelector(".valorunitario-input").value) || 0
  }));
}

// =====================================================
// SALVAR ITEM (POST OU PUT AUTOMÁTICO)
// =====================================================
async function salvarItem(btn) {
  const row = btn.closest("tr");
  const idpedido = Number(row.querySelector(".td-idpedido").textContent);
  const iditem = Number(row.querySelector(".iditem-input").value);
  const quantidade = Number(row.querySelector(".quantidade-input").value);
  const valorunitario = Number(row.querySelector(".valorunitario-input").value);

  if (!idpedido || !iditem) {
    showMessage("Informe ID do pedido e ID do item.", "warning");
    return;
  }

  try {
    // Verifica se já existe
    const check = await fetch(`${API_BASE_URL}/pedido_item/${idpedido}/${iditem}`);

    let method, url, body;

    if (check.ok) {
      method = "PUT";
      url = `${API_BASE_URL}/pedido_item/${idpedido}/${iditem}`;
      body = { quantidade, valorunitario };
    } else {
      method = "POST";
      url = `${API_BASE_URL}/pedido_item`;
      body = { idpedido, iditem, quantidade, valorunitario };
    }

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    if (!res.ok) throw new Error("Erro ao salvar item.");

    showMessage("Item salvo!", "success");
    await carregarItensDoBackend(idpedido);

  } catch (err) {
    console.error("salvarItem erro:", err);
    showMessage("Erro ao salvar item.", "error");
  }
}

// =====================================================
// REMOVER ITEM
// =====================================================
async function removerItem(btn) {
  const row = btn.closest("tr");

  const idpedido = Number(row.querySelector(".td-idpedido").textContent);
  const iditem = Number(row.querySelector(".iditem-input").value);

  // Se linha é nova (Cancelar)
  if (btn.textContent.includes("Cancelar") || !iditem) {
    row.remove();
    atualizarTotal();
    return;
  }

  if (!confirm("Excluir item?")) return;

  try {
    const res = await fetch(`${API_BASE_URL}/pedido_item/${idpedido}/${iditem}`, {
      method: "DELETE"
    });

    if (!res.ok) throw new Error("Erro ao excluir item.");

    showMessage("Item removido!", "success");
    await carregarItensDoBackend(idpedido);

  } catch (err) {
    showMessage(err.message, "error");
  }
}

// =====================================================
// TOTAL
// =====================================================
function atualizarTotal() {
  const total = obterItensTabela().reduce((s, it) => s + it.quantidade * it.valorunitario, 0);

  let totalEl = document.getElementById("valorTotal");
  if (!totalEl) {
    totalEl = document.createElement("h3");
    totalEl.id = "valorTotal";
    form.appendChild(totalEl);
  }

  totalEl.textContent = `Valor Total: R$ ${total.toFixed(2)}`;
  return total;
}

// =====================================================
// EVENTOS
// =====================================================
btnBuscar.addEventListener("click", buscarPedido);
btnIncluir.addEventListener("click", () => {
  operacao = "incluir";
  limparFormulario();
  alternarBotoes("editando");
});
btnAlterar.addEventListener("click", () => {
  operacao = "alterar";
  alternarBotoes("editando");
});
btnSalvar.addEventListener("click", salvarPedido);
btnExcluir.addEventListener("click", excluirPedido);
btnCancelar.addEventListener("click", limparFormulario);

document.getElementById("searchType").addEventListener("change", () => {
  const id = document.getElementById("idpessoa_cliente").value;
  if (id) preencherCliente(id);
});
