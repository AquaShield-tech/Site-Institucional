var visaoGeralModel = require("../models/visaoGeralModel");

function buscarKpis(req, res) {
    var idEmpresa = req.params.idEmpresa;

    if (idEmpresa == undefined) {
        res.status(400).send("Seu idEmpresa está undefined!");
    } else {
        visaoGeralModel.buscarKpis(idEmpresa)
            .then(function (resultado) {
                if (resultado.length > 0) {
                    res.status(200).json(resultado[0]);
                } else {
                    res.status(204).send("Nenhum resultado encontrado!");
                }
            })
            .catch(function (erro) {
                console.log(erro);
                console.log("\nHouve um erro ao buscar os KPIs! Erro: ", erro.sqlMessage);
                res.status(500).json(erro.sqlMessage);
            });
    }
}

function buscarGrafico24h(req, res) {
    var idEmpresa = req.params.idEmpresa;

    if (idEmpresa == undefined) {
        res.status(400).send("Seu idEmpresa está undefined!");
    } else {
        visaoGeralModel.buscarGrafico24h(idEmpresa)
            .then(function (resultado) {
                res.status(200).json(resultado);
            })
            .catch(function (erro) {
                console.log(erro);
                console.log("\nHouve um erro ao buscar o gráfico de 24h! Erro: ", erro.sqlMessage);
                res.status(500).json(erro.sqlMessage);
            });
    }
}

function buscarGrafico30d(req, res) {
    var idEmpresa = req.params.idEmpresa;

    if (idEmpresa == undefined) {
        res.status(400).send("Seu idEmpresa está undefined!");
    } else {
        visaoGeralModel.buscarGrafico30d(idEmpresa)
            .then(function (resultado) {
                res.status(200).json(resultado);
            })
            .catch(function (erro) {
                console.log(erro);
                console.log("\nHouve um erro ao buscar o gráfico de 30d! Erro: ", erro.sqlMessage);
                res.status(500).json(erro.sqlMessage);
            });
    }
}

function buscarHistorico(req, res) {
    var idEmpresa = req.params.idEmpresa;

    if (idEmpresa == undefined) {
        res.status(400).send("Seu idEmpresa está undefined!");
    } else {
        visaoGeralModel.buscarHistorico(idEmpresa)
            .then(function (resultado) {
                res.status(200).json(resultado);
            })
            .catch(function (erro) {
                console.log(erro);
                console.log("\nHouve um erro ao buscar o histórico! Erro: ", erro.sqlMessage);
                res.status(500).json(erro.sqlMessage);
            });
    }
}

module.exports = {
    buscarKpis,
    buscarGrafico24h,
    buscarGrafico30d,
    buscarHistorico
};