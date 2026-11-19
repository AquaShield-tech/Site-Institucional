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

function listar(req, res) {
    var idEmpresa = req.params.idEmpresa;

    if (idEmpresa == undefined) {
        res.status(400).send("O idEmpresa está undefined!");
    } else {
        ccoModel.listar(idEmpresa)
            .then(function (resultado) {
                res.status(200).json(resultado);
            })
            .catch(function (erro) {
                console.log(erro);
                res.status(500).json(erro.sqlMessage);
            });
    }
}

function editar(req, res) {
    var idCco = req.params.idCco;
    var nome = req.body.nomeServer;
    var pais = req.body.paisServer;
    var cep = req.body.cepServer;
    var uf = req.body.ufServer;

    if (idCco == undefined) {
        res.status(400).send("O idCco está undefined!");
    } else if (nome == undefined || pais == undefined || cep == undefined || uf == undefined) {
        res.status(400).send("Campos obrigatórios estão undefined!");
    } else {
        ccoModel.editar(idCco, nome, pais, cep, uf)
            .then(function (resultado) {
                res.status(200).json(resultado);
            })
            .catch(function (erro) {
                console.log(erro);
                res.status(500).json(erro.sqlMessage);
            });
    }
}

function excluir(req, res) {
    var idCco = req.params.idCco;

    if (idCco == undefined) {
        res.status(400).send("O idCco está undefined!");
    } else {
        ccoModel.verificarMaquinasAtivas(idCco)
            .then(function (resultado) {
                var qtdMaquinas = resultado[0].qtd_maquinas;

                if (qtdMaquinas > 0) {
                    res.status(400).send("Não é possível excluir este CCO pois existem máquinas ativas vinculadas a ele.");
                    return null;
                }

                return ccoModel.excluir(idCco);
            })
            .then(function (resultadoExclusao) {
                if (resultadoExclusao) {
                    res.status(200).json(resultadoExclusao);
                }
            })
            .catch(function (erro) {
                console.log(erro);
                res.status(500).json(erro.sqlMessage);
            });
    }
}

module.exports = {
    cadastrar,
    listar,
    editar,
    excluir
};