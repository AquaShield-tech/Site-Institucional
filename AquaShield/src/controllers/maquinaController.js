var maquinaModel = require("../models/maquinaModel");

function cadastrar(req, res) {
    var hostname = req.body.hostnameServer;
    var macAddress = req.body.macAddressServer;
    var so = req.body.soServer;
    var verSO = req.body.verSOServer;
    var cpuTotal = req.body.cpuTotalServer;
    var memoriaTotal = req.body.memoriaTotalServer;
    var discoTotal = req.body.discoTotalServer;
    var rede = req.body.redeServer;
    var fkEta = req.body.fkEtaServer || 1;

    if (hostname == undefined) {
        res.status(400).send("Seu hostname está undefined!");
    } else if (macAddress == undefined) {
        res.status(400).send("Seu macAddress está undefined!");
    } else if (so == undefined) {
        res.status(400).send("Seu SO está undefined!");
    } else if (verSO == undefined) {
        res.status(400).send("Sua versão do SO está undefined!");
    } else {
        var macFinal = macAddress.trim().toUpperCase().replace(/-/g, ":");

        maquinaModel.cadastrar(hostname, macFinal, so, verSO, fkEta)
            .then(function (resultadoMaquina) {
                var idMaquina = resultadoMaquina.insertId;

                return maquinaModel.cadastrarComponente(cpuTotal, 1, 50)
                    .then(function (resCpu) {
                        return maquinaModel.cadastrarConfiguracao(idMaquina, resCpu.insertId, 1);
                    })
                    .then(function () {
                        return maquinaModel.cadastrarComponente(memoriaTotal, 2, 60);
                    })
                    .then(function (resRam) {
                        return maquinaModel.cadastrarConfiguracao(idMaquina, resRam.insertId, 1);
                    })
                    .then(function () {
                        return maquinaModel.cadastrarComponente(discoTotal, 3, 80);
                    })
                    .then(function (resDisco) {
                        return maquinaModel.cadastrarConfiguracao(idMaquina, resDisco.insertId, 1);
                    })
                    .then(function () {
                        return maquinaModel.cadastrarComponente(rede, 4, 50);
                    })
                    .then(function (resRede) {
                        return maquinaModel.cadastrarConfiguracao(idMaquina, resRede.insertId, 1);
                    });
            })
            .then(function () {
                res.status(201).send("Máquina cadastrada com sucesso!");
            })
            .catch(function (erro) {
                console.log(erro);
                console.log("\nHouve um erro ao realizar o cadastro da máquina! Erro: ", erro.sqlMessage);
                res.status(500).json(erro.sqlMessage);
            });
    }
}

function buscarKpis(req, res) {
    var idEmpresa = req.params.idEmpresa;

    if (idEmpresa == undefined) {
        res.status(400).send("Seu idEmpresa está undefined!");
    } else {
        maquinaModel.buscarKpis(idEmpresa)
            .then(function (resultado) {
                if (resultado.length > 0) {
                    res.status(200).json(resultado[0]);
                } else {
                    res.status(204).send("Nenhum resultado encontrado!");
                }
            })
            .catch(function (erro) {
                console.log(erro);
                console.log("\nHouve um erro ao buscar os KPIs de máquinas! Erro: ", erro.sqlMessage);
                res.status(500).json(erro.sqlMessage);
            });
    }
}

function listar(req, res) {
    var idEmpresa = req.params.idEmpresa;

    if (idEmpresa == undefined) {
        res.status(400).send("Seu idEmpresa está undefined!");
    } else {
        maquinaModel.listar(idEmpresa)
            .then(function (resultado) {
                res.status(200).json(resultado);
            })
            .catch(function (erro) {
                console.log(erro);
                console.log("\nHouve um erro ao listar as máquinas! Erro: ", erro.sqlMessage);
                res.status(500).json(erro.sqlMessage);
            });
    }
}

function buscarTempoReal(req, res) {
    var idMaquina = req.params.idMaquina;

    if (idMaquina == undefined) {
        res.status(400).send("Seu idMaquina está undefined!");
    } else {
        maquinaModel.buscarTempoReal(idMaquina)
            .then(function (resultado) {
                res.status(200).json(resultado);
            })
            .catch(function (erro) {
                console.log(erro);
                console.log("\nHouve um erro ao buscar as leituras em tempo real! Erro: ", erro.sqlMessage);
                res.status(500).json(erro.sqlMessage);
            });
    }
}

function editar(req, res) {
    var idMaquina = req.params.idMaquina;
    var hostname = req.body.hostnameServer;

    if (idMaquina == undefined) {
        res.status(400).send("Seu idMaquina está undefined!");
    } else if (hostname == undefined || hostname.trim() == "") {
        res.status(400).send("Seu hostname está undefined!");
    } else {
        maquinaModel.editar(idMaquina, hostname.trim())
            .then(function (resultado) {
                res.status(200).json(resultado);
            })
            .catch(function (erro) {
                console.log(erro);
                console.log("\nHouve um erro ao editar a máquina! Erro: ", erro.sqlMessage);
                res.status(500).json(erro.sqlMessage);
            });
    }
}

function excluir(req, res) {
    var idMaquina = req.params.idMaquina;

    if (idMaquina == undefined) {
        res.status(400).send("Seu idMaquina está undefined!");
    } else {
        maquinaModel.excluir(idMaquina)
            .then(function (resultado) {
                res.status(200).json(resultado);
            })
            .catch(function (erro) {
                console.log(erro);
                console.log("\nHouve um erro ao excluir a máquina! Erro: ", erro.sqlMessage);
                res.status(500).json(erro.sqlMessage);
            });
    }
}

module.exports = {
    cadastrar,
    buscarKpis,
    listar,
    buscarTempoReal,
    editar,
    excluir
};