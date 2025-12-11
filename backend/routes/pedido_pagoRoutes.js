const express = require("express");
const router = express.Router();
const pedido_pagoController = require("../controllers/pedido_pagoController");

// Buscar pagamento por pedido
router.get("/:idpedido", pedido_pagoController.buscarPagamento);

// Criar pagamento
router.post("/", pedido_pagoController.criarPagamento);

// Excluir pagamento
router.delete("/:idpedido", pedido_pagoController.excluirPagamento);

module.exports = router;
