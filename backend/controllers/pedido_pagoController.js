const { query } = require("../database");

// ===============================
// BUSCAR PAGAMENTO POR IDPEDIDO
// ===============================
exports.buscarPagamento = async (req, res) => {
  const { idpedido } = req.params;

  try {
    const result = await query(
      `SELECT * FROM pedido_pago WHERE idpedido = $1`,
      [idpedido]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ pago: false });
    }

    res.json({
      pago: true,
      ...result.rows[0]
    });

  } catch (err) {
    console.error("Erro buscarPagamento:", err);
    res.status(500).json({ error: "Erro ao buscar pagamento." });
  }
};

// ===============================
// CRIAR PAGAMENTO
// ===============================
exports.criarPagamento = async (req, res) => {
  const { idpedido, idpessoa, datapagamento, valortotal, formapagamento } = req.body;

  try {
    await query(
      `INSERT INTO pedido_pago (idpedido, idpessoa, datapagamento, valortotal, formapagamento)
       VALUES ($1, $2, $3, $4, $5)`,
      [idpedido, idpessoa, datapagamento, valortotal, formapagamento]
    );

    res.status(201).json({ message: "Pagamento registrado!" });

  } catch (err) {
    console.error("Erro criarPagamento:", err);
    res.status(500).json({ error: "Erro ao registrar pagamento." });
  }
};

// ===============================
// EXCLUIR PAGAMENTO (DESMARCAR CHECKBOX)
// ===============================
exports.excluirPagamento = async (req, res) => {
  const { idpedido } = req.params;

  try {
    await query(`DELETE FROM pedido_pago WHERE idpedido = $1`, [idpedido]);
    res.json({ message: "Pagamento removido!" });

  } catch (err) {
    console.error("Erro excluir Pagamento:", err);
    res.status(500).json({ error: "Erro ao remover pagamento." });
  }
};
