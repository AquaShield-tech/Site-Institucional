var express = require("express");
var router = express.Router();

var configuracaoController = require("../controllers/configuracaoController");

router.get("/carregar/:idEmpresa", function (req, res) {
    configuracaoController.carregar(req, res);
});

router.post("/aplicar/:idEmpresa", function (req, res) {
    configuracaoController.aplicar(req, res);
});

router.delete("/restaurar/:idEmpresa", function (req, res) {
    configuracaoController.restaurar(req, res);
});

module.exports = router;