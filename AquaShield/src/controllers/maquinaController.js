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

module.exports = {
    cadastrar
};