// ===============================
// CRUD PEDIDO - BEPLANT (versão final)
// ===============================

const API_BASE_URL = 'http://localhost:3001';

let operacao = null;
let pedidoAtual = null;

// Referências do DOM
const form = document.getElementById('pedidoForm');
const searchId = document.getElementById('searchId');
const btnBuscar = document.getElementById('btnBuscar');
const btnIncluir = document.getElementById('btnIncluir');
const btnAlterar = document.getElementById('btnAlterar');
const btnExcluir = document.getElementById('btnExcluir');
const btnSalvar = document.getElementById('btnSalvar');
const btnCancelar = document.getElementById('btnCancelar');
const itensTableBody = document.getElementById('itensTableBody');
const messageContainer = document.getElementById('messageContainer');

// Campos principais
const dataPedido = document.getElementById('data_pedido');
const clienteInput = document.getElementById('cliente_pessoa_cpf_pessoa');
const funcionarioInput = document.getElementById('funcionario_pessoa_cpf_pessoa');

// ===============================
// Funções auxiliares
// ===============================
function showMessage(text, type = 'info') {
  const div = document.createElement('div');
  div.className = `message ${type}`;
  div.textContent = text;
  messageContainer.innerHTML = '';
  messageContainer.appendChild(div);
  setTimeout(() => (div.style.opacity = '0'), 3000);
}

function limparFormulario() {
  form.reset();
  itensTableBody.innerHTML = '';
  pedidoAtual = null;
  operacao = null;
  alternarBotoes('inicio');
}

function alternarBotoes(estado) {
  const estados = {
    inicio: { buscar: true, incluir: true, alterar: false, excluir: false, salvar: false },
    visualizar: { buscar: true, incluir: false, alterar: true, excluir: true, salvar: false },
    editando: { buscar: false, incluir: false, alterar: false, excluir: false, salvar: true }
  };

  const s = estados[estado] || estados.inicio;
  btnBuscar.style.display = s.buscar ? 'inline-block' : 'none';
  btnIncluir.style.display = s.incluir ? 'inline-block' : 'none';
  btnAlterar.style.display = s.alterar ? 'inline-block' : 'none';
  btnExcluir.style.display = s.excluir ? 'inline-block' : 'none';
  btnSalvar.style.display = s.salvar ? 'inline-block' : 'none';
  btnCancelar.style.display = 'inline-block';
}

// ===============================
// CRUD PEDIDO
// ===============================
async function buscarPedido() {
  const id = searchId.value.trim();
  if (!id) return showMessage('Digite um ID para buscar.', 'warning');

  try {
    const res = await fetch(`${API_BASE_URL}/pedido/${id}`);
    if (!res.ok) throw new Error('Pedido não encontrado.');
    const pedido = await res.json();
    preencherFormulario(pedido);
    pedidoAtual = pedido;
    alternarBotoes('visualizar');
    showMessage('Pedido carregado com sucesso.', 'success');
  } catch (err) {
    limparFormulario();
    showMessage(err.message, 'error');
  }
}

function preencherFormulario(pedido) {
  dataPedido.value = pedido.datapedido ? pedido.datapedido.substring(0, 10) : '';
  clienteInput.value = pedido.idpessoa || '';
  funcionarioInput.value = pedido.idfuncionario || '';
  carregarItens(pedido.itens || []);
  atualizarTotal();
}

async function salvarPedido() {
  const pedido = {
    datapedido: dataPedido.value,
    idpessoa: clienteInput.value,
    idfuncionario: funcionarioInput.value,
    valortotal: atualizarTotal(),
    itens: obterItensTabela()
  };

  try {
    let res;
    if (operacao === 'incluir') {
      res = await fetch(`${API_BASE_URL}/pedido`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pedido)
      });
    } else if (operacao === 'alterar' && pedidoAtual) {
      res = await fetch(`${API_BASE_URL}/pedido/${pedidoAtual.idpedido}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pedido)
      });
    }

    if (!res.ok) throw new Error('Erro ao salvar pedido.');
    showMessage('Pedido salvo com sucesso!', 'success');
    limparFormulario();
  } catch (err) {
    showMessage(err.message, 'error');
  }
}

async function excluirPedido() {
  if (!pedidoAtual) return showMessage('Nenhum pedido carregado.', 'warning');
  if (!confirm('Deseja realmente excluir este pedido?')) return;

  try {
    const res = await fetch(`${API_BASE_URL}/pedido/${pedidoAtual.idpedido}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Erro ao excluir pedido.');
    showMessage('Pedido excluído com sucesso!', 'success');
    limparFormulario();
  } catch (err) {
    showMessage(err.message, 'error');
  }
}

// ===============================
// ITENS DO PEDIDO
// ===============================
function carregarItens(itens) {
  itensTableBody.innerHTML = '';
  itens.forEach(item => adicionarLinhaItem(item));
}

function adicionarItem() {
  adicionarLinhaItem();
}

function adicionarLinhaItem(item = {}) {
  const row = document.createElement('tr');

  // Valores padrão
  const idpedido = item.idpedido || pedidoAtual?.idpedido || '';
  const iditem = item.iditem || '';
  const nomeitem = item.nomeitem || '';
  const quantidade = item.quantidade || 1;
  const valorunitario = item.valorunitario || 0;
  const subtotal = quantidade * valorunitario;

  // Monta a linha da tabela
  row.innerHTML = `
    <td>${idpedido}</td>
    <td><input type="number" class="iditem" value="${iditem}" min="1" /></td>
    <td class="nomeitem-cell">${nomeitem}</td>
    <td><input type="number" class="quantidade" value="${quantidade}" min="1" /></td>
    <td><input type="number" class="valorunitario" value="${valorunitario}" step="0.01" min="0" /></td>
    <td class="subtotal">${subtotal.toFixed(2)}</td>
    <td><button class="btn-save btn-small" onclick="salvarItem(this)">💾</button></td>
    <td><button class="btn-danger btn-small" onclick="removerItem(this)">🗑</button></td>
  `;

  // Garante que os inputs realmente existem antes de adicionar listeners
  const qtdInput = row.querySelector('.quantidade');
  const valorInput = row.querySelector('.valorunitario');
  const subtotalCell = row.querySelector('.subtotal');

  if (qtdInput && valorInput && subtotalCell) {
    const updateSubtotal = () => {
      const qtd = parseFloat(qtdInput.value) || 0;
      const preco = parseFloat(valorInput.value) || 0;
      subtotalCell.textContent = (qtd * preco).toFixed(2);
      atualizarTotal();
    };
    qtdInput.addEventListener('input', updateSubtotal);
    valorInput.addEventListener('input', updateSubtotal);
  }

  itensTableBody.appendChild(row);
  atualizarTotal();
}


function obterItensTabela() {
  return Array.from(itensTableBody.querySelectorAll('tr')).map(linha => ({
    iditem: parseInt(linha.querySelector('.iditem')?.value) || null,
    nomeitem: linha.querySelector('.nomeitem-cell')?.textContent?.trim() || '',
    quantidade: parseFloat(linha.querySelector('.quantidade')?.value) || 0,
    valorunitario: parseFloat(linha.querySelector('.valorunitario')?.value) || 0
  }));
}

function atualizarTotal() {
  const total = obterItensTabela().reduce((acc, item) => acc + item.quantidade * item.valorunitario, 0);
  let totalEl = document.getElementById('valorTotal');
  if (!totalEl) {
    totalEl = document.createElement('h3');
    totalEl.id = 'valorTotal';
    totalEl.style.marginTop = '1rem';
    totalEl.style.color = '#0a3126';
    form.appendChild(totalEl);
  }
  totalEl.textContent = `Valor Total: R$ ${total.toFixed(2)}`;
  return total;
}

async function salvarItem(btn) {
  const row = btn.closest('tr');
  const idpedido = pedidoAtual?.idpedido || searchId.value;
  const iditem = parseInt(row.querySelector('.iditem').value);
  const quantidade = parseFloat(row.querySelector('.quantidade').value);
  const valorunitario = parseFloat(row.querySelector('.valorunitario').value);

  if (!idpedido || !iditem) return showMessage('Preencha os campos corretamente.', 'warning');

  try {
    const res = await fetch(`${API_BASE_URL}/pedido_item`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idpedido, iditem, quantidade, valorunitario })
    });

    if (!res.ok) throw new Error('Erro ao salvar item.');
    showMessage('Item salvo com sucesso.', 'success');
    buscarPedido();
  } catch (err) {
    showMessage(err.message, 'error');
  }
}

async function removerItem(btn) {
  const row = btn.closest('tr');
  const idpedido = pedidoAtual?.idpedido || searchId.value;
  const iditem = parseInt(row.querySelector('.iditem').value);

  if (!confirm('Deseja realmente excluir este item?')) return;

  try {
    const res = await fetch(`${API_BASE_URL}/pedido_item/${idpedido}/${iditem}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Erro ao remover item.');
    row.remove();
    atualizarTotal();
    showMessage('Item removido com sucesso.', 'success');
  } catch (err) {
    showMessage(err.message, 'error');
  }
}

// ===============================
// BOTÕES PRINCIPAIS
// ===============================
btnBuscar.addEventListener('click', buscarPedido);
btnIncluir.addEventListener('click', () => {
  operacao = 'incluir';
  limparFormulario();
  alternarBotoes('editando');
});
btnAlterar.addEventListener('click', () => {
  if (!pedidoAtual) return showMessage('Nenhum pedido carregado.', 'warning');
  operacao = 'alterar';
  alternarBotoes('editando');
});
btnExcluir.addEventListener('click', excluirPedido);
btnSalvar.addEventListener('click', salvarPedido);
btnCancelar.addEventListener('click', limparFormulario);

// Inicialização
alternarBotoes('inicio');
