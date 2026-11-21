var configuracaoModel = require("../models/configuracaoModel");

function obterOuCriarDefinicao(valorLimite, fkDescricao) {
    return configuracaoModel.buscarDefinicaoPorValor(valorLimite, fkDescricao)
        .then(function (resultado) {
            if (resultado.length > 0) {
                return resultado[0].id;
            }
            return configuracaoModel.cadastrarDefinicao(valorLimite, fkDescricao)
                .then(function (novo) {
                    return novo.insertId;
                });
        });
}

function carregar(req, res) {
    var idEmpresa = req.params.idEmpresa;

    if (idEmpresa == undefined) {
        res.status(400).send("Seu idEmpresa está undefined!");
    } else {
        configuracaoModel.buscarAtuais(idEmpresa)
            .then(function (resultado) {
                res.status(200).json(resultado);
            })
            .catch(function (erro) {
                console.log(erro);
                console.log("\nHouve um erro ao carregar configurações! Erro: ", erro.sqlMessage);
                res.status(500).json(erro.sqlMessage);
            });
    }
}

function aplicar(req, res) {
    var idEmpresa = req.params.idEmpresa;
    var cpuAtencao = req.body.cpuAtencaoServer;
    var cpuCritico = req.body.cpuCriticoServer;
    var ramAtencao = req.body.ramAtencaoServer;
    var ramCritico = req.body.ramCriticoServer;
    var discoAtencao = req.body.discoAtencaoServer;
    var discoCritico = req.body.discoCriticoServer;
    var redeAtencao = req.body.redeAtencaoServer;
    var redeCritico = req.body.redeCriticoServer;

    if (idEmpresa == undefined) {
        res.status(400).send("Seu idEmpresa está undefined!");
        return;
    }

    // cpu
    obterOuCriarDefinicao(cpuAtencao, 1)
        .then(function (idCpuAtencao) {
            return obterOuCriarDefinicao(cpuCritico, 2)
                .then(function (idCpuCritico) {
                    return configuracaoModel.aplicarGlobalComponente(idEmpresa, 1, idCpuAtencao, idCpuCritico);
                });
        })
    // ram
        .then(function () {
            return obterOuCriarDefinicao(ramAtencao, 1)
                .then(function (idRamAtencao) {
                    return obterOuCriarDefinicao(ramCritico, 2)
                        .then(function (idRamCritico) {
                            return configuracaoModel.aplicarGlobalComponente(idEmpresa, 2, idRamAtencao, idRamCritico);
                        });
                });
        })
    // disco
        .then(function () {
            return obterOuCriarDefinicao(discoAtencao, 1)
                .then(function (idDiscoAtencao) {
                    return obterOuCriarDefinicao(discoCritico, 2)
                        .then(function (idDiscoCritico) {
                            return configuracaoModel.aplicarGlobalComponente(idEmpresa, 3, idDiscoAtencao, idDiscoCritico);
                        });
                });
        })
    // rede
        .then(function () {
            return obterOuCriarDefinicao(redeAtencao, 1)
                .then(function (idRedeAtencao) {
                    return obterOuCriarDefinicao(redeCritico, 2)
                        .then(function (idRedeCritico) {
                            return configuracaoModel.aplicarGlobalComponente(idEmpresa, 4, idRedeAtencao, idRedeCritico);
                        });
                });
        })
        .then(function () {
            res.status(200).send("Configurações aplicadas com sucesso!");
        })
        .catch(function (erro) {
            console.log(erro);
            console.log("\nHouve um erro ao aplicar configurações! Erro: ", erro.sqlMessage);
            res.status(500).json(erro.sqlMessage);
        });
}

function restaurar(req, res) {
    var idEmpresa = req.params.idEmpresa;

    if (idEmpresa == undefined) {
        res.status(400).send("Seu idEmpresa está undefined!");
    } else {
        configuracaoModel.restaurarPadraoEmpresa(idEmpresa)
            .then(function () {
                return configuracaoModel.excluirPersonalizados();
            })
            .then(function (resultado) {
                res.status(200).json(resultado);
            })
            .catch(function (erro) {
                console.log(erro);
                console.log("\nHouve um erro ao restaurar os padrões! Erro: ", erro.sqlMessage);
                res.status(500).json(erro.sqlMessage);
            });
    }
}

module.exports = {
    carregar,
    aplicar,
    restaurar
};