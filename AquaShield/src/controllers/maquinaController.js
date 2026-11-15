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
        res.status(400).send("O hostname está undefined!");
    } else if (macAddress == undefined) {
        res.status(400).send("O macAddress está undefined!");
    } else if (so == undefined) {
        res.status(400).send("O SO está undefined!");
    } else if (verSO == undefined) {
        res.status(400).send("A versão do SO está undefined!");
    } else if (!(cpuTotal > 0) || !(memoriaTotal > 0) || !(discoTotal > 0) || !(rede > 0)) {
        res.status(400).send("Informe valores válidos (> 0) para CPU, memória, disco e rede!");
    } else {
        maquinaModel.cadastrar(hostname, macAddress, so, verSO, cpuTotal, memoriaTotal, discoTotal, rede, fkEta)
            .then(
                function (resultado) {
                    res.json(resultado);
                }   
            ).catch(
                function (erro) {
                    console.log(erro);
                    console.log(
                        "\nHouve um erro ao realizar o cadastro da máquina! Erro: ",
                        erro.sqlMessage
                    );
                    res.status(500).json(erro.sqlMessage);
                }
            );
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

module.exports = {
    cadastrar,
    buscarKpis,
    listar,
    buscarTempoReal
};