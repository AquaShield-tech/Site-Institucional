var express = require("express");
var router = express.Router();

var ccoController = require("../controllers/ccoController");

router.post("/cadastrar", function (req, res) {
    ccoController.cadastrar(req, res);
});

module.exports = router;