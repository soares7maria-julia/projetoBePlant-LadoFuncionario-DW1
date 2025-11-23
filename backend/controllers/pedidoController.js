// ===============================
// CONTROLLER PEDIDO 
// ===============================

const { query } = require('../database');


// ===============================
// LISTAR TODOS OS PEDIDOS
// ===============================
exports.listarPedidos = async (req, res) => {
  try {
    const pedidos = await query(`
      SELECT 
        idpedido,
        datapedido,
        idpessoa,
        valortotal
      FROM pedido
      ORDER BY idpedido ASC
    `);

    res.status(200).json(pedidos.rows);

  } catch (error) {
    console.error("Erro ao listar pedidos:", error);
    res.status(500).json({ error: "Erro ao listar pedidos." });
  }
};


// ===============================
// OBTER UM PEDIDO POR ID
// ===============================
exports.obterPedido = async (req, res) => {
  try {
    const { id } = req.params;

    const pedidoResult = await query(`
      SELECT 
        idpedido,
        datapedido,
        idpessoa,
        valortotal
      FROM pedido
      WHERE idpedido = $1
    `, [id]);

    if (pedidoResult.rows.length === 0)
      return res.status(404).json({ error: "Pedido não encontrado." });

    res.status(200).json(pedidoResult.rows[0]);

  } catch (error) {
    console.error("Erro ao obter pedido:", error);
    res.status(500).json({ error: "Erro ao obter pedido." });
  }
};


// ===============================
// CRIAR NOVO PEDIDO
// ===============================
exports.criarPedido = async (req, res) => {
  try {
    const { datapedido, idpessoa, valortotal } = req.body;

    if (!datapedido || !idpessoa) {
      return res.status(400).json({ error: "Campos obrigatórios ausentes." });
    }

    const insertResult = await query(`
      INSERT INTO pedido (datapedido, idpessoa, valortotal)
      VALUES ($1, $2, $3)
      RETURNING *
    `, [datapedido, idpessoa, valortotal || 0]);

    res.status(201).json(insertResult.rows[0]);

  } catch (error) {
    console.error("Erro ao criar pedido:", error);
    res.status(500).json({ error: "Erro ao criar pedido." });
  }
};


// ===============================
// ATUALIZAR UM PEDIDO
// ===============================
exports.atualizarPedido = async (req, res) => {
  try {
    const { id } = req.params;
    const { datapedido, idpessoa, valortotal } = req.body;

    const updateResult = await query(`
      UPDATE pedido
      SET datapedido = $1,
          idpessoa = $2,
          valortotal = $3
      WHERE idpedido = $4
      RETURNING *
    `, [datapedido, idpessoa, valortotal || 0, id]);

    if (updateResult.rows.length === 0)
      return res.status(404).json({ error: "Pedido não encontrado." });

    res.status(200).json(updateResult.rows[0]);

  } catch (error) {
    console.error("Erro ao atualizar pedido:", error);
    res.status(500).json({ error: "Erro ao atualizar pedido." });
  }
};


// ===============================
// DELETAR UM PEDIDO
// ===============================
exports.deletarPedido = async (req, res) => {
  try {
    const { id } = req.params;

    const deleteResult = await query(`
      DELETE FROM pedido
      WHERE idpedido = $1
      RETURNING *
    `, [id]);

    if (deleteResult.rows.length === 0)
      return res.status(404).json({ error: "Pedido não encontrado." });

    res.status(200).json({ message: "Pedido excluído com sucesso." });

  } catch (error) {
    console.error("Erro ao deletar pedido:", error);
    res.status(500).json({ error: "Erro ao deletar pedido." });
  }
};
