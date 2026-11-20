var pedroDashModel = require("../models/pedroDashModel");

function buscarKpis(req, res) {
    var idEmpresa = req.params.idEmpresa;

    if (idEmpresa == undefined) {
        res.status(400).send("Seu idEmpresa está undefined!");
    } else {
        pedroDashModel.buscarKpis(idEmpresa)
            .then(function (resultado) {
                if (resultado.length > 0) {
                    var emFalha = Number(resultado[0].em_falha) || 0;
                    var totalAtivos = Number(resultado[0].total_ativos) || 0;

                    res.status(200).json({
                        discosEmFalha: emFalha,
                        discosAtivos: totalAtivos
                    });
                } else {
                    res.status(200).json({ discosEmFalha: 0, discosAtivos: 0 });
                }
            })
            .catch(function (erro) {
                console.log(erro);
                console.log("\nHouve um erro ao buscar os KPIs da pedroDash! Erro: ", erro.sqlMessage);
                res.status(500).json(erro.sqlMessage);
            });
    }
}

function buscarFalhas(req, res) {
    var idEmpresa = req.params.idEmpresa;
    var periodo = req.params.periodo;

    if (idEmpresa == undefined) {
        res.status(400).send("Seu idEmpresa está undefined!");
        return;
    }

    var promessa;
    if (periodo === "24h") {
        promessa = pedroDashModel.buscarFalhas24h(idEmpresa);
    } else if (periodo === "30d") {
        promessa = pedroDashModel.buscarFalhasDias(idEmpresa, 30);
    } else {
        promessa = pedroDashModel.buscarFalhasDias(idEmpresa, 7);
    }

    promessa
        .then(function (resultado) {
            res.status(200).json(resultado);
        })
        .catch(function (erro) {
            console.log(erro);
            console.log("\nHouve um erro ao buscar as falhas da pedroDash! Erro: ", erro.sqlMessage);
            res.status(500).json(erro.sqlMessage);
        });
}

module.exports = {
    buscarKpis,
    buscarFalhas
};