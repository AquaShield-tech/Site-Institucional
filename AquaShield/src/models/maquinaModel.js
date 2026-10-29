var mysql = require("mysql2");
var database = require("../database/config");

function cadastrar(hostname, macAddress, so, verSO, cpuTotal, memoriaTotal, discoTotal, rede, fkEta) {
    var macFinal = macAddress.trim().toUpperCase().replace(/-/g, ":");

    var instrucaoSql = mysql.format(
        `INSERT INTO Maquina (
            hostname,
            mac_address,
            sistema_operacional,
            versao_so,
            data_cadastro,
            fk_eta
        )
        VALUES (?, ?, ?, ?, NOW(), ?);`,
        [
            hostname.substring(0, 100),
            macFinal,
            so.substring(0, 45),
            verSO.substring(0, 10),
            fkEta || 1
        ]
    );

    console.log("Executando a instrução SQL:\n" + instrucaoSql);

    return database.executar(instrucaoSql).then(function (maquina) {
        var idMaquina = maquina.insertId;

        return cadastrarComponente(idMaquina, "CPU", cpuTotal)
            .then(function () {
                return cadastrarComponente(idMaquina, "Memoria RAM", memoriaTotal);
            })
            .then(function () {
                return cadastrarComponente(idMaquina, "Armazenamento", discoTotal);
            })
            .then(function () {
                return cadastrarComponente(idMaquina, "Rede", rede);
            })
            .then(function () {
                return maquina;
            });
    });
}

function cadastrarComponente(idMaquina, tipo, valorMaximo) {
    var limiteAlerta = 80;

    if (tipo === "Armazenamento" || tipo === "Rede") {
        limiteAlerta = 90;
    }

    var sqlComponente = mysql.format(
        `INSERT INTO Componente (
            valor_maximo,
            fk_tipoComponente,
            fk_definicaoAlerta
        )
        VALUES (
            ?,
            (SELECT id FROM Tipo_Componente WHERE tipo = ? LIMIT 1),
            (SELECT id FROM Definicao_Alerta WHERE valor_limite = ? LIMIT 1)
        );`,
        [valorMaximo, tipo, limiteAlerta]
    );

    console.log("Executando a instrução SQL:\n" + sqlComponente);

    return database.executar(sqlComponente).then(function (componente) {
        var sqlConfiguracao = mysql.format(
            `INSERT INTO Configuracao (
                fk_maquina,
                fk_componente,
                fk_statusMaquina
            )
            VALUES (
                ?,
                ?,
                (SELECT id FROM Status_Maquina WHERE estado = 'Ativo' LIMIT 1)
            );`,
            [idMaquina, componente.insertId]
        );

        console.log("Executando a instrução SQL:\n" + sqlConfiguracao);

        return database.executar(sqlConfiguracao);
    });
}

module.exports = { cadastrar };