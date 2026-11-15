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

function buscarKpis(idEmpresa) {
    var instrucaoSql = `
        SELECT
            -- Total de maquinas
            (
                SELECT COUNT(DISTINCT m.id)
                FROM maquina m
                JOIN eta e ON m.fk_eta = e.id
                JOIN cco c ON e.fk_cco = c.id
                WHERE c.fk_empresa = ${idEmpresa}
            ) AS total_maquinas,

            -- Maquinas ativas
            (
                SELECT COUNT(DISTINCT m.id)
                FROM maquina m
                JOIN eta e ON m.fk_eta = e.id
                JOIN cco c ON e.fk_cco = c.id
                JOIN configuracao cfg ON cfg.fk_maquina = m.id
                JOIN status_maquina sm ON cfg.fk_statusMaquina = sm.id
                WHERE c.fk_empresa = ${idEmpresa}
                  AND LOWER(sm.estado) NOT IN ('desconectada', 'inativa', 'offline')
            ) AS maquinas_ativas,

            -- Pico CPU 
            (
                SELECT ROUND(MAX(l.valor), 0)
                FROM leitura l
                JOIN componente comp ON l.configuracao_fk_componente = comp.id
                JOIN tipo_componente tc ON comp.fk_tipoComponente = tc.id
                JOIN maquina m ON l.configuracao_fk_maquina = m.id
                JOIN eta e ON m.fk_eta = e.id
                JOIN cco c ON e.fk_cco = c.id
                WHERE c.fk_empresa = ${idEmpresa}
                  AND UPPER(tc.tipo) LIKE '%CPU%'
                  AND l.data_hora >= NOW() - INTERVAL 30 DAY
            ) AS pico_cpu,

            -- Pico de RAM
            (
                SELECT ROUND(MAX(l.valor), 0)
                FROM leitura l
                JOIN componente comp ON l.configuracao_fk_componente = comp.id
                JOIN tipo_componente tc ON comp.fk_tipoComponente = tc.id
                JOIN maquina m ON l.configuracao_fk_maquina = m.id
                JOIN eta e ON m.fk_eta = e.id
                JOIN cco c ON e.fk_cco = c.id
                WHERE c.fk_empresa = ${idEmpresa}
                  AND UPPER(tc.tipo) LIKE '%RAM%'
                  AND l.data_hora >= NOW() - INTERVAL 30 DAY
            ) AS pico_ram;
    `;

    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

function listar(idEmpresa) {
    var instrucaoSql = `
        SELECT
            m.id,
            m.hostname,

            -- Ultimo uso de CPU
            (
                SELECT ROUND(l.valor, 0)
                FROM leitura l
                JOIN componente comp ON l.configuracao_fk_componente = comp.id
                JOIN tipo_componente tc ON comp.fk_tipoComponente = tc.id
                WHERE l.configuracao_fk_maquina = m.id
                  AND UPPER(tc.tipo) LIKE '%CPU%'
                ORDER BY l.data_hora DESC
                LIMIT 1
            ) AS uso_cpu,

            -- Limite para CPU
            (
                SELECT da.valor_limite
                FROM configuracao cfg
                JOIN componente comp ON cfg.fk_componente = comp.id
                JOIN tipo_componente tc ON comp.fk_tipoComponente = tc.id
                JOIN definicao_alerta da ON comp.fk_definicaoAlerta = da.id
                WHERE cfg.fk_maquina = m.id
                  AND UPPER(tc.tipo) LIKE '%CPU%'
                LIMIT 1
            ) AS limite_cpu,

            -- Ultimo uso de RAM
            (
                SELECT ROUND(l.valor, 0)
                FROM leitura l
                JOIN componente comp ON l.configuracao_fk_componente = comp.id
                JOIN tipo_componente tc ON comp.fk_tipoComponente = tc.id
                WHERE l.configuracao_fk_maquina = m.id
                  AND UPPER(tc.tipo) LIKE '%RAM%'
                ORDER BY l.data_hora DESC
                LIMIT 1
            ) AS uso_ram,

            -- Limite para RAM
            (
                SELECT da.valor_limite
                FROM configuracao cfg
                JOIN componente comp ON cfg.fk_componente = comp.id
                JOIN tipo_componente tc ON comp.fk_tipoComponente = tc.id
                JOIN definicao_alerta da ON comp.fk_definicaoAlerta = da.id
                WHERE cfg.fk_maquina = m.id
                  AND UPPER(tc.tipo) LIKE '%RAM%'
                LIMIT 1
            ) AS limite_ram,

            -- Data da ultima leitura
            (
                SELECT DATE_FORMAT(MAX(l.data_hora), '%d/%m/%Y %H:%i')
                FROM leitura l
                WHERE l.configuracao_fk_maquina = m.id
            ) AS ultima_leitura,

            -- Verificacao se está desconectada/inativa
            (
                SELECT COUNT(*)
                FROM configuracao cfg
                JOIN status_maquina sm ON cfg.fk_statusMaquina = sm.id
                WHERE cfg.fk_maquina = m.id
                  AND LOWER(sm.estado) IN ('desconectada', 'inativa', 'offline')
            ) AS is_inativa

        FROM maquina m
        JOIN eta e ON m.fk_eta = e.id
        JOIN cco c ON e.fk_cco = c.id
        WHERE c.fk_empresa = ${idEmpresa}
        ORDER BY m.id ASC;
    `;

    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

function buscarTempoReal(idMaquina) {
    var instrucaoSql = `
        SELECT
            tc.tipo AS componente,
            ROUND(l.valor, 1) AS valor,
            DATE_FORMAT(l.data_hora, '%H:%i:%s') AS horario,
            da.valor_limite AS limite_alerta
        FROM leitura l
        JOIN componente comp ON l.configuracao_fk_componente = comp.id
        JOIN tipo_componente tc ON comp.fk_tipoComponente = tc.id
        JOIN definicao_alerta da ON comp.fk_definicaoAlerta = da.id
        WHERE l.configuracao_fk_maquina = ${idMaquina}
        ORDER BY l.data_hora DESC
        LIMIT 60;
    `;

    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

module.exports = { 
    cadastrar, 
    listar,
    buscarKpis,
    buscarTempoReal
};