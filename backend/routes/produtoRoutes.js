const express = require('express');
const router = express.Router();
const produtoController = require('../controllers/produtoController');
const multer = require('multer');
const path = require('path');

// multer simples → só salva temporariamente
const upload = multer({
  dest: 'temp/' // 👈 obrigatório para evitar crash
});

// Rotas
router.get('/', produtoController.listarProdutos);
router.get('/:id', produtoController.obterProduto);
router.post('/', upload.single('imagemitem'), produtoController.criarProduto);
router.put('/:id', upload.single('imagemitem'), produtoController.atualizarProduto);
router.delete('/:id', produtoController.deletarProduto);

module.exports = router;
