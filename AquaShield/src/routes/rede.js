var express = require("express");
var router = express.Router();

var redeController = require("../controllers/redeController");

router.get("/maquinas/:idEmpresa", function (req, res) {
    redeController.listarMaquinas(req, res);
});
router.get("/resumo/:idMaquina", function (req, res) {
    redeController.obterResumoRede(req, res);
});
router.get("/trafego/:idMaquina/:janela", function (req, res) {
    redeController.obterTrafegoRede(req, res);
});
router.get("/dispersao/:idMaquina", function (req, res) {
    redeController.obterDispersaoRede(req, res);
});
router.get("/eventos/:idMaquina", function (req, res) {
    redeController.obterEventosRede(req, res);
});

module.exports = router;