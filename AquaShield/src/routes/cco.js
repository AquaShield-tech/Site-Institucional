var express = require("express");
var router = express.Router();

var ccoController = require("../controllers/ccoController");

router.post("/cadastrar", function (req, res) {
    ccoController.cadastrar(req, res);
});
router.get("/listar/:idEmpresa", function (req, res) {
    ccoController.listar(req, res);
});

router.put("/editar/:idCco", function (req, res) {
    ccoController.editar(req, res);
});

router.delete("/excluir/:idCco", function (req, res) {
    ccoController.excluir(req, res);
});
router.get("/etas/:idEmpresa", function (req, res) {
    ccoController.listarEtas(req, res);
});
module.exports = router;