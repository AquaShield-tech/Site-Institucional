var express = require("express");
var router = express.Router();

var pedroDashController = require("../controllers/pedroDashController");

router.get("/kpis/:idEmpresa", function (req, res) {
    pedroDashController.buscarKpis(req, res);
});

router.get("/falhas/:idEmpresa/:periodo", function (req, res) {
    pedroDashController.buscarFalhas(req, res);
});

module.exports = router;