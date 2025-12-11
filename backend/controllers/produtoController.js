const { query } = require('../database');
const path = require('path');
const fs = require('fs').promises;

function safeLog(label, value) {
  console.log(`🧪 ${label}:`, value);
}

/* ================= LISTAR ================= */
exports.listarProdutos = async (req, res) => {
  try {
    const result = await query(`
      SELECT i.*, c.nomecategoria
      FROM item i
      JOIN categoria c ON c.idcategoria = i.idcategoria
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro listar produtos' });
  }
};

/* ================= OBTER ================= */
exports.obterProduto = async (req, res) => {
  try {
    const result = await query(
      'SELECT * FROM item WHERE iditem=$1',
      [req.params.id]
    );
    if (!result.rows.length) return res.sendStatus(404);
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro buscar produto' });
  }
};

/* ================= CRIAR ================= */
exports.criarProduto = async (req, res) => {
  try {
    safeLog('BODY', req.body);
    safeLog('FILE', req.file);

    const { nomeitem, estoqueitem, valorunitario, idcategoria } = req.body;

    const result = await query(`
      INSERT INTO item (nomeitem, estoqueitem, valorunitario, idcategoria)
      VALUES ($1,$2,$3,$4)
      RETURNING iditem
    `, [nomeitem, estoqueitem, valorunitario, idcategoria]);

    const iditem = result.rows[0].iditem;
    let imagemitem = null;

    if (req.file && req.file.path) {
      const ext = path.extname(req.file.originalname) || '.png';
      imagemitem = `${iditem}${ext}`;

      const destino = path.join(__dirname, '..', 'images', imagemitem);

      await fs.mkdir(path.dirname(destino), { recursive: true });

      try {
        await fs.rename(req.file.path, destino);
      } catch (err) {
        console.error('⚠️ Erro ao mover imagem:', err);
      }

      await query(
        'UPDATE item SET imagemitem=$1 WHERE iditem=$2',
        [imagemitem, iditem]
      );
    }

    res.status(201).json({ iditem, imagemitem });

  } catch (err) {
    console.error('🔥 CREATE:', err);
    res.status(500).json({ error: 'Erro criar produto' });
  }
};

/* ================= ATUALIZAR ================= */
exports.atualizarProduto = async (req, res) => {
  try {
    safeLog('FILE', req.file);

    const { id } = req.params;

    await query(`
      UPDATE item SET nomeitem=$1, estoqueitem=$2, valorunitario=$3, idcategoria=$4
      WHERE iditem=$5
    `, [
      req.body.nomeitem,
      req.body.estoqueitem,
      req.body.valorunitario,
      req.body.idcategoria,
      id
    ]);

    if (req.file && req.file.path) {
      const ext = path.extname(req.file.originalname) || '.png';
      const imagemitem = `${id}${ext}`;
      const destino = path.join(__dirname, '..', 'images', imagemitem);

      await fs.mkdir(path.dirname(destino), { recursive: true });

      try {
        await fs.rename(req.file.path, destino);
      } catch (err) {
        console.error('⚠️ rename falhou:', err);
      }

      await query(
        'UPDATE item SET imagemitem=$1 WHERE iditem=$2',
        [imagemitem, id]
      );
    }

    res.json({ success: true });

  } catch (err) {
    console.error('🔥 UPDATE:', err);
    res.status(500).json({ error: 'Erro atualizar produto' });
  }
};

/* ================= DELETE ================= */
exports.deletarProduto = async (req, res) => {
  try {
    await query('DELETE FROM item WHERE iditem=$1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro deletar produto' });
  }
};
