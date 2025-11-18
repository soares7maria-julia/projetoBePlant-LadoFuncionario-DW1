// ===============================
// CONTROLLER PEDIDO - BEPLANT
// ===============================

const { query } = require('../database');

// Listar todos os pedidos com o valor total
exports.listarPedidos = async (req, res) => {
  try {
    const pedidos = await query(`
      SELECT p.idpedido, p.datapedido, p.idpessoa, p.valortotal
      FROM pedido p
      ORDER BY p.idpedido ASC
    `);
    res.status(200).json(pedidos.rows);
  } catch (error) {
    console.error('Erro ao listar pedidos:', error);
    res.status(500).json({ error: 'Erro ao listar pedidos.' });
  }
};

// Obter um pedido específico com seus itens
exports.obterPedido = async (req, res) => {
  try {
    const { id } = req.params;
    
const pedidoResult = await query(
  `SELECT p.idpedido, p.datapedido, p.idpessoa, 
          pes.cpfpessoa AS cpf, 
          pes.nomepessoa AS nome, 
          p.valortotal
   FROM pedido p
   JOIN pessoa pes ON pes.idpessoa = p.idpessoa
   WHERE p.idpedido = $1`,
  [id]
);


    if (pedidoResult.rows.length === 0)
      return res.status(404).json({ error: 'Pedido não encontrado.' });

    const pedido = pedidoResult.rows[0];

    const itensResult = await query(
      `SELECT pi.idpedido, pi.iditem, i.nomeitem, pi.quantidade, pi.valorunitario
       FROM pedido_item pi
       JOIN item i ON i.iditem = pi.iditem
       WHERE pi.idpedido = $1`,
      [id]
    );

    pedido.itens = itensResult.rows;
    res.status(200).json(pedido);
  } catch (error) {
    console.error('Erro ao obter pedido:', error);
    res.status(500).json({ error: 'Erro ao obter pedido.' });
  }
};

// Criar novo pedido
exports.criarPedido = async (req, res) => {
  const { datapedido, idpessoa, valortotal, itens } = req.body;

  if (!datapedido || !idpessoa)
    return res.status(400).json({ error: 'Campos obrigatórios ausentes.' });

  try {
    // Inserir pedido
    const insertPedido = await query(
      `INSERT INTO pedido (datapedido, idpessoa, valortotal)
       VALUES ($1, $2, $3)
       RETURNING idpedido`,
      [datapedido, idpessoa, valortotal || 0]
    );

    const idpedido = insertPedido.rows[0].idpedido;

    // Inserir itens (pedido_item)
    if (Array.isArray(itens)) {
      for (const item of itens) {
        await query(
          `INSERT INTO pedido_item (idpedido, iditem, quantidade, valorunitario)
           VALUES ($1, $2, $3, $4)`,
          [idpedido, item.iditem, item.quantidade, item.valorunitario]
        );
      }
    }

    res.status(201).json({ message: 'Pedido criado com sucesso.', idpedido });
  } catch (error) {
    console.error('Erro ao criar pedido:', error);
    res.status(500).json({ error: 'Erro ao criar pedido.' });
  }
};

// Atualizar pedido existente
exports.atualizarPedido = async (req, res) => {
  const { id } = req.params;
  const { datapedido, idpessoa, valortotal, itens } = req.body;

  try {
    // Atualiza os dados do pedido
    await query(
      `UPDATE pedido
       SET datapedido = $1, idpessoa = $2, valortotal = $3
       WHERE idpedido = $4`,
      [datapedido, idpessoa, valortotal || 0, id]
    );

    // Remove itens antigos
    await query(`DELETE FROM pedido_item WHERE idpedido = $1`, [id]);

    // Insere os novos itens
    if (Array.isArray(itens)) {
      for (const item of itens) {
        await query(
          `INSERT INTO pedido_item (idpedido, iditem, quantidade, valorunitario)
           VALUES ($1, $2, $3, $4)`,
          [id, item.iditem, item.quantidade, item.valorunitario]
        );
      }
    }

    res.status(200).json({ message: 'Pedido atualizado com sucesso.' });
  } catch (error) {
    console.error('Erro ao atualizar pedido:', error);
    res.status(500).json({ error: 'Erro ao atualizar pedido.' });
  }
};

// Deletar pedido
exports.deletarPedido = async (req, res) => {
  try {
    const { id } = req.params;

    // Remove itens antes do pedido (por FK)
    await query(`DELETE FROM pedido_item WHERE idpedido = $1`, [id]);
    await query(`DELETE FROM pedido WHERE idpedido = $1`, [id]);

    res.status(200).json({ message: 'Pedido excluído com sucesso.' });
  } catch (error) {
    console.error('Erro ao deletar pedido:', error);
    res.status(500).json({ error: 'Erro ao deletar pedido.' });
  }
};
