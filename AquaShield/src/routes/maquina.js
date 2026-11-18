var express = require("express");
var router = express.Router();

var maquinaController = require("../controllers/maquinaController");

router.post("/cadastrar", function (req, res) {
    maquinaController.cadastrar(req, res);
})
router.get("/kpis/:idEmpresa", function (req, res) {
    maquinaController.buscarKpis(req, res);
});

router.get("/listar/:idEmpresa", function (req, res) {
    maquinaController.listar(req, res);
});
router.get("/tempo-real/:idMaquina", function (req, res) {
    maquinaController.buscarTempoReal(req, res);
});
router.put("/editar/:idMaquina", function (req, res) {
    maquinaController.editar(req, res);
});

router.delete("/excluir/:idMaquina", function (req, res) {
    maquinaController.excluir(req, res);
});
module.exports = router;