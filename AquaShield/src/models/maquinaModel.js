var mysql = require("mysql2");
var database = require("../database/config");

function cadastrar(hostname, macAddress, so, verSO, fkEta) {
    var instrucaoSql = `
        INSERT INTO maquina (hostname, mac_address, sistema_operacional, versao_so, data_cadastro, fk_eta)
        VALUES ('${hostname}', '${macAddress}', '${so}', '${verSO}', NOW(), ${fkEta});
    `;

    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

function cadastrarComponente(valorMaximo, fkTipoComponente, valorLimitePadrao) {
    var instrucaoSql = `
        INSERT INTO componente (valor_maximo, fk_tipoComponente, fk_definicaoAlerta)
        VALUES (${valorMaximo}, ${fkTipoComponente},
            (SELECT id FROM definicao_alerta WHERE valor_limite = ${valorLimitePadrao} AND fk_alerta_descricao = 1 LIMIT 1)
        );
    `;

    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

function cadastrarConfiguracao(fkMaquina, fkComponente, fkStatusMaquina) {
    var instrucaoSql = `
        INSERT INTO configuracao (fk_maquina, fk_componente, fk_statusMaquina)
        VALUES (${fkMaquina}, ${fkComponente}, ${fkStatusMaquina});
    `;

    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
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
                  AND m.ativo = 1
                  AND c.ativo = 1
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
                  AND m.ativo = 1
                  AND c.ativo = 1
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
                  AND m.ativo = 1
                  AND c.ativo = 1
                  AND UPPER(tc.tipo) LIKE '%CPU%'
                  AND l.data_hora >= NOW() - INTERVAL 30 DAY
            ) AS pico_cpu,
            -- Pico RAM
            (
                SELECT ROUND(MAX(l.valor), 0)
                FROM leitura l
                JOIN componente comp ON l.configuracao_fk_componente = comp.id
                JOIN tipo_componente tc ON comp.fk_tipoComponente = tc.id
                JOIN maquina m ON l.configuracao_fk_maquina = m.id
                JOIN eta e ON m.fk_eta = e.id
                JOIN cco c ON e.fk_cco = c.id
                WHERE c.fk_empresa = ${idEmpresa}
                  AND m.ativo = 1
                  AND c.ativo = 1
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
            -- Ultimo uso de cpu
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
            -- Limite para cpu  
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
            -- Ultimo uso de ram
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
            -- Limite para ram 
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
            -- Verificacao se esta ativa 
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
          AND m.ativo = 1
          AND c.ativo = 1
        ORDER BY m.id ASC;
    `;

    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

function editar(idMaquina, hostname) {
    var instrucaoSql = `
        UPDATE maquina
        SET hostname = '${hostname}'
        WHERE id = ${idMaquina};
    `;

    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

function excluir(idMaquina) {
    var instrucaoSql = `
        UPDATE maquina
        SET ativo = 0
        WHERE id = ${idMaquina};
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
    cadastrarComponente,
    cadastrarConfiguracao,
    listar,
    editar,
    excluir,
    buscarKpis,
    buscarTempoReal
};