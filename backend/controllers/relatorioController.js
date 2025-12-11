const db = require('../database');

// ==================================================================
// 1) CLIENTES CADASTRADOS POR MÊS
// ==================================================================
exports.clientesPorMes = async (req, res) => {
  try {
    const query = `
      SELECT 
        TRIM(TO_CHAR(DATE_TRUNC('month', c.datacadastro), 'TMMonth')) AS mes,
        COUNT(*) AS total
      FROM cliente c
      WHERE c.datacadastro IS NOT NULL
      GROUP BY DATE_TRUNC('month', c.datacadastro)
      ORDER BY DATE_PART('month', MIN(c.datacadastro));
    `;

    const result = await db.pool.query(query);
    res.json(result.rows);

  } catch (error) {
    console.error("Erro ao buscar clientes cadastrados por mês:", error);
    res.status(500).json({ error: "Erro ao gerar relatório de clientes" });
  }
};

// ==================================================================
// 2) VENDAS POR MÊS
// ==================================================================
exports.vendasPorMes = async (req, res) => {
  try {
    const query = `
      SELECT 
        TRIM(TO_CHAR(DATE_TRUNC('month', datapedido), 'TMMonth')) AS mes,
        COUNT(*) AS total
      FROM pedido
      WHERE datapedido IS NOT NULL
      GROUP BY DATE_TRUNC('month', datapedido)
      ORDER BY DATE_PART('month', MIN(datapedido));
    `;
    const result = await db.pool.query(query);
    res.json(result.rows);

  } catch (error) {
    console.error('Erro ao buscar vendas por mês:', error);
    res.status(500).json({ error: 'Erro ao listar vendas mensais' });
  }
};

// ==================================================================
// 3) MÊS COM MAIS VENDAS
// ==================================================================
exports.mesMaisVendas = async (req, res) => {
  try {
    const query = `
      SELECT 
        TRIM(TO_CHAR(DATE_TRUNC('month', datapedido), 'TMMonth')) AS mes,
        COUNT(*) AS total
      FROM pedido
      WHERE datapedido IS NOT NULL
      GROUP BY DATE_TRUNC('month', datapedido)
      ORDER BY total DESC
      LIMIT 1;
    `;

    const result = await db.pool.query(query);

    if (result.rows.length === 0) {
      return res.json({ mes: 'Nenhum pedido encontrado', total: 0 });
    }

    res.json(result.rows[0]);

  } catch (error) {
    console.error('Erro ao buscar mês com mais vendas:', error);
    res.status(500).json({ error: 'Erro ao gerar relatório de mês mais vendido' });
  }
};
