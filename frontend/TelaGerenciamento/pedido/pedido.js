// ===============================
// CRUD PEDIDO - BEPLANT (versão sem funcionário)
// ===============================

const API_BASE_URL = 'http://localhost:3001';

let operacaoPedido = null;
let pedidoAtual = null;

// Referências do DOM
const formPedido = document.getElementById('pedidoForm');
const searchId = document.getElementById('searchId');
const btnBuscar = document.getElementById('btnBuscar');
const btnIncluir = document.getElementById('btnIncluir');
const btnAlterar = document.getElementById('btnAlterar');
const btnExcluir = document.getElementById('btnExcluir');
const btnSalvar = document.getElementById('btnSalvar');
const btnCancelar = document.getElementById('btnCancelar');
const itensTableBody = document.getElementById('itensTableBody');
const messageContainer = document.getElementById('messageContainer');

const dataPedido = document.getElementById('data_pedido');
const clienteCPF = document.getElementById('cliente_pessoa_cpf_pessoa');

// ===============================
// Funções auxiliares
// ===============================
function showMessage(msg, type = 'info') {
  const div = document.createElement('div');
  div.className = `message ${type}`;
  div.textContent = msg;
  messageContainer.appendChild(div);
  setTimeout(() => div.remove(), 3000);
}

function limparFormulario() {
  formPedido.reset();
  itensTableBody.innerHTML = '';
  pedidoAtual = null;
  operacaoPedido = null;
  alternarBotoes('inicio');
}

function alternarBotoes(estado) {
  btnBuscar.style.display = estado === 'inicio' ? 'inline-block' : 'none';
  btnIncluir.style.display = estado === 'inicio' ? 'inline-block' : 'none';
  btnAlterar.style.display = estado === 'visualizar' ? 'inline-block' : 'none';
  btnExcluir.style.display = estado === 'visualizar' ? 'inline-block' : 'none';
  btnSalvar.style.display = estado === 'editando' ? 'inline-block' : 'none';
  btnCancelar.style.display = 'inline-block';
}

// ===============================
// CRUD PEDIDO
// ===============================
async function buscarPedido() {
  const id = searchId.value.trim();
  if (!id) {
    showMessage('Digite um ID para buscar.', 'warning');
    return;
  }

  try {
    const res = await fetch(`${API_BASE_URL}/pedido/${id}`);
    if (!res.ok) throw new Error('Pedido não encontrado');
    const pedido = await res.json();
    preencherFormulario(pedido);
    operacaoPedido = null;
    pedidoAtual = pedido;
    alternarBotoes('visualizar');
    showMessage('Pedido carregado com sucesso.', 'success');
  } catch (error) {
    showMessage(error.message, 'error');
  }
}

function preencherFormulario(pedido) {
  dataPedido.value = pedido.datapedido ? pedido.datapedido.substring(0, 10) : '';
  clienteCPF.value = pedido.idpessoa || '';
  carregarItens(pedido.itens || []);
  atualizarTotal();
}

// ===============================
// ITENS DO PEDIDO
// ===============================
function carregarItens(itens) {
  itensTableBody.innerHTML = '';
  itens.forEach(item => adicionarLinhaItem(item));
}

function adicionarLinhaItem(item = {}) {
  const row = document.createElement('tr');
  const subtotal = (item.quantidade || 0) * (item.valorunitario || 0);

  row.innerHTML = `
    <td>${item.idpedido || ''}</td>
    <td><input type="number" class="iditem" value="${item.iditem || ''}" min="1"></td>
    <td><input type="number" class="quantidade" value="${item.quantidade || 1}" min="1"></td>
    <td><input type="number" class="valorunitario" value="${item.valorunitario || 0}" step="0.01" min="0"></td>
    <td class="subtotal">${subtotal.toFixed(2)}</td>
    <td><button type="button" class="btn-danger btn-small" onclick="removerItem(this)">🗑</button></td>
  `;

  // Cálculo automático de subtotal e total
  row.querySelectorAll('.quantidade, .valorunitario').forEach(input => {
    input.addEventListener('input', () => {
      const qtd = parseFloat(row.querySelector('.quantidade').value) || 0;
      const preco = parseFloat(row.querySelector('.valorunitario').value) || 0;
      const subtotal = qtd * preco;
      row.querySelector('.subtotal').textContent = subtotal.toFixed(2);
      atualizarTotal();
    });
  });

  itensTableBody.appendChild(row);
  atualizarTotal();
}

function adicionarItem() {
  adicionarLinhaItem();
}

function removerItem(botao) {
  botao.closest('tr').remove();
  atualizarTotal();
  showMessage('Item removido.', 'info');
}

function obterItensTabela() {
  const linhas = Array.from(itensTableBody.querySelectorAll('tr'));
  return linhas.map(linha => ({
    iditem: parseInt(linha.querySelector('.iditem').value),
    quantidade: parseFloat(linha.querySelector('.quantidade').value),
    valorunitario: parseFloat(linha.querySelector('.valorunitario').value)
  }));
}

function atualizarTotal() {
  const linhas = Array.from(itensTableBody.querySelectorAll('tr'));
  const total = linhas.reduce((acc, linha) => {
    const qtd = parseFloat(linha.querySelector('.quantidade').value) || 0;
    const preco = parseFloat(linha.querySelector('.valorunitario').value) || 0;
    return acc + qtd * preco;
  }, 0);
  let totalEl = document.getElementById('valorTotal');
  if (!totalEl) {
    totalEl = document.createElement('h3');
    totalEl.id = 'valorTotal';
    totalEl.style.marginTop = '1rem';
    totalEl.style.color = '#0a3126';
    formPedido.appendChild(totalEl);
  }
  totalEl.textContent = `Valor Total: R$ ${total.toFixed(2)}`;
  return total;
}

// ===============================
// BOTÕES PRINCIPAIS
// ===============================
btnBuscar.addEventListener('click', buscarPedido);

btnIncluir.addEventListener('click', () => {
  operacaoPedido = 'incluir';
  limparFormulario();
  alternarBotoes('editando');
});

btnAlterar.addEventListener('click', () => {
  if (!pedidoAtual) return showMessage('Nenhum pedido carregado.', 'warning');
  operacaoPedido = 'alterar';
  alternarBotoes('editando');
});

btnExcluir.addEventListener('click', async () => {
  if (!pedidoAtual) return showMessage('Nenhum pedido carregado.', 'warning');
  if (!confirm('Deseja realmente excluir este pedido?')) return;

  try {
    const res = await fetch(`${API_BASE_URL}/pedido/${pedidoAtual.idpedido}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Erro ao excluir pedido.');
    showMessage('Pedido excluído com sucesso!', 'success');
    limparFormulario();
  } catch (error) {
    showMessage(error.message, 'error');
  }
});

btnSalvar.addEventListener('click', async () => {
  const pedido = {
    datapedido: dataPedido.value,
    idpessoa: clienteCPF.value,
    valortotal: atualizarTotal(),
    itens: obterItensTabela()
  };

  try {
    let res;
    if (operacaoPedido === 'incluir') {
      res = await fetch(`${API_BASE_URL}/pedido`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pedido)
      });
    } else if (operacaoPedido === 'alterar' && pedidoAtual) {
      res = await fetch(`${API_BASE_URL}/pedido/${pedidoAtual.idpedido}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pedido)
      });
    }

    if (!res.ok) throw new Error('Erro ao salvar pedido.');
    showMessage('Pedido salvo com sucesso!', 'success');
    limparFormulario();
  } catch (error) {
    showMessage(error.message, 'error');
  }
});

btnCancelar.addEventListener('click', limparFormulario);


// Inicialização

alternarBotoes('inicio');
