const { query } = require('../database.js');


// ================================
// RELATÓRIO: CLIENTES POR MÊS
// ================================
exports.clientesPorMes = (req, res) => {
    const sql = `
        SELECT 
            DATE_FORMAT(datacadastro, '%Y-%m') AS mes,
            COUNT(*) AS total_clientes
        FROM cliente
        GROUP BY mes
        ORDER BY mes;
    `;
    query(sql, [], (err, result) => {
        if (err) {
            return res.status(500).json({ error: 'Erro ao gerar relatório' });
        }
        res.json(result);
    });
};


// ================================
// RELATÓRIO: VENDAS POR MÊS
// ================================
exports.vendasPorMes = (req, res) => {
    const sql = `
        SELECT
            DATE_FORMAT(datapedido, '%Y-%m') AS mes,
            COUNT(*) AS total_vendas,
            SUM(valortotal) AS valor_total
        FROM pedido
        GROUP BY mes
        ORDER BY mes;
    `;

    query(sql, [], (err, result) => {
        if (err) {
            return res.status(500).json({ error: 'Erro ao gerar relatório' });
        }
        res.json(result);
    });
};
