var ccoModel = require("../models/ccoModel");

function cadastrar(req, res) {
    var nome = req.body.nomeServer;
    var pais = req.body.paisServer;
    var cep = req.body.cepServer;
    var uf = req.body.ufServer;
    var fkEmpresa = req.body.fkEmpresaServer;

    if (nome == undefined) {
        res.status(400).send("O nome está undefined!");
    } else if (pais == undefined) {
        res.status(400).send("O país está undefined!");
    } else if (cep == undefined) {
        res.status(400).send("O CEP está undefined!");
    } else if (uf == undefined) {
        res.status(400).send("A UF está undefined!");
    } else if (fkEmpresa == undefined) {
        res.status(400).send("A empresa (fkEmpresa) está undefined!");
    } else {
        ccoModel.cadastrar(nome, pais, cep, uf, fkEmpresa)
            .then(function (resultado) {
                res.status(201).json(resultado);
            })
            .catch(function (erro) {
                console.log(erro);
                res.status(500).json(erro.sqlMessage);
            });
    }
}

module.exports = {
    cadastrar
};