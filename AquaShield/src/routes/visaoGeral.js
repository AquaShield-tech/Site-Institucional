var express = require("express");
var router = express.Router();

var visaoGeralController = require("../controllers/visaoGeralController");

router.get("/kpis/:idEmpresa", function (req, res) {
    visaoGeralController.buscarKpis(req, res);
});

router.get("/grafico24h/:idEmpresa", function (req, res) {
    visaoGeralController.buscarGrafico24h(req, res);
});

router.get("/grafico30d/:idEmpresa", function (req, res) {
    visaoGeralController.buscarGrafico30d(req, res);
});

router.get("/historico/:idEmpresa", function (req, res) {
    visaoGeralController.buscarHistorico(req, res);
});

module.exports = router;