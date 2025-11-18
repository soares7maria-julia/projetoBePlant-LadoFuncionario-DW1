const { query } = require('../database');

// Listar todos os itens de todos os pedidos
exports.listarPedidoItens = async (req, res) => {
  try {
    const result = await query(`
      SELECT pi.idpedido, pi.iditem, i.nomeitem, pi.quantidade, pi.valorunitario
      FROM pedido_item pi
      JOIN item i ON i.iditem = pi.iditem
      ORDER BY pi.idpedido ASC
    `);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Erro ao listar pedido_itens:', error);
    res.status(500).json({ error: 'Erro ao listar pedido_itens.' });
  }
};

// Obter itens de um pedido específico
exports.listarItensPorPedido = async (req, res) => {
  try {
    const { idpedido } = req.params;
    const result = await query(
      `SELECT pi.idpedido, pi.iditem, i.nomeitem, pi.quantidade, pi.valorunitario
       FROM pedido_item pi
       JOIN item i ON i.iditem = pi.iditem
       WHERE pi.idpedido = $1`,
      [idpedido]
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Erro ao listar itens do pedido:', error);
    res.status(500).json({ error: 'Erro ao listar itens do pedido.' });
  }
};

// Atualizar item (quantidade ou valor)
exports.atualizarPedidoItem = async (req, res) => {
  try {
    const { idpedido, iditem } = req.params;
    const { quantidade, valorunitario } = req.body;

    await query(
      `UPDATE pedido_item
       SET quantidade = $1, valorunitario = $2
       WHERE idpedido = $3 AND iditem = $4`,
      [quantidade, valorunitario, idpedido, iditem]
    );

    res.status(200).json({ message: 'Item atualizado com sucesso.' });
  } catch (error) {
    console.error('Erro ao atualizar pedido_item:', error);
    res.status(500).json({ error: 'Erro ao atualizar pedido_item.' });
  }
};

// Deletar um item específico de um pedido
exports.deletarPedidoItem = async (req, res) => {
  try {
    const { idpedido, iditem } = req.params;
    await query(
      `DELETE FROM pedido_item WHERE idpedido = $1 AND iditem = $2`,
      [idpedido, iditem]
    );
    res.status(200).json({ message: 'Item removido com sucesso.' });
  } catch (error) {
    console.error('Erro ao deletar pedido_item:', error);
    res.status(500).json({ error: 'Erro ao deletar pedido_item.' });
  }
};
