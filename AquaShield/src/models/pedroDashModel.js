var database = require("../database/config");

// Altere aqui quando mudar de teste ('RAM') para produção ('Disco')
const LIMITE_FALHA = 75;
const TIPO_MONITORADO = 'RAM';

function buscarKpis(idEmpresa) {
    var instrucaoSql = `
        SELECT
            (
                SELECT COUNT(DISTINCT l.configuracao_fk_maquina)
                FROM leitura l
                JOIN componente comp     ON comp.id = l.configuracao_fk_componente
                JOIN tipo_componente tc  ON tc.id   = comp.fk_tipoComponente
                JOIN maquina m           ON m.id    = l.configuracao_fk_maquina
                JOIN eta e               ON e.id    = m.fk_eta
                JOIN cco c               ON c.id    = e.fk_cco
                WHERE c.fk_empresa = ${idEmpresa}
                  AND m.ativo = 1
                  AND tc.tipo = '${TIPO_MONITORADO}'
                  AND l.valor > ${LIMITE_FALHA}
                  AND l.data_hora >= NOW() - INTERVAL 24 HOUR
            ) AS em_falha,
            (
                SELECT COUNT(*)
                FROM configuracao cfg
                JOIN componente comp     ON comp.id = cfg.fk_componente
                JOIN tipo_componente tc  ON tc.id   = comp.fk_tipoComponente
                JOIN status_maquina s    ON s.id    = cfg.fk_statusMaquina
                JOIN maquina m           ON m.id    = cfg.fk_maquina
                JOIN eta e               ON e.id    = m.fk_eta
                JOIN cco c               ON c.id    = e.fk_cco
                WHERE c.fk_empresa = ${idEmpresa}
                  AND m.ativo = 1
                  AND tc.tipo = '${TIPO_MONITORADO}'
                  AND s.estado = 'Ativo'
            ) AS total_ativos;
    `;

    console.log("Executando a instrução SQL (pedroDash - KPIs): \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

function buscarFalhas24h(idEmpresa) {
    var instrucaoSql = `
        WITH leituras AS (
            SELECT l.data_hora, l.valor,
                   LAG(l.valor) OVER (
                       PARTITION BY l.configuracao_fk_maquina, l.configuracao_fk_componente
                       ORDER BY l.data_hora
                   ) AS valor_anterior
            FROM leitura l
            JOIN componente comp     ON comp.id = l.configuracao_fk_componente
            JOIN tipo_componente tc  ON tc.id   = comp.fk_tipoComponente
            JOIN maquina m           ON m.id    = l.configuracao_fk_maquina
            JOIN eta e               ON e.id    = m.fk_eta
            JOIN cco c               ON c.id    = e.fk_cco
            WHERE c.fk_empresa = ${idEmpresa}
              AND m.ativo = 1
              AND tc.tipo = '${TIPO_MONITORADO}'
        )
        SELECT DATE_FORMAT(data_hora, '%Hh') AS label, COUNT(*) AS falhas
        FROM leituras
        WHERE valor > ${LIMITE_FALHA}
          AND (valor_anterior IS NULL OR valor_anterior <= ${LIMITE_FALHA})
          AND data_hora >= NOW() - INTERVAL 24 HOUR
        GROUP BY DATE_FORMAT(data_hora, '%Y-%m-%d %H'), DATE_FORMAT(data_hora, '%Hh')
        ORDER BY DATE_FORMAT(data_hora, '%Y-%m-%d %H') ASC;
    `;

    console.log("Executando a instrução SQL (pedroDash - 24h): \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

function buscarFalhasDias(idEmpresa, dias) {
    var intervalo = dias - 1;
    var instrucaoSql = `
        WITH leituras AS (
            SELECT l.data_hora, l.valor,
                   LAG(l.valor) OVER (
                       PARTITION BY l.configuracao_fk_maquina, l.configuracao_fk_componente
                       ORDER BY l.data_hora
                   ) AS valor_anterior
            FROM leitura l
            JOIN componente comp     ON comp.id = l.configuracao_fk_componente
            JOIN tipo_componente tc  ON tc.id   = comp.fk_tipoComponente
            JOIN maquina m           ON m.id    = l.configuracao_fk_maquina
            JOIN eta e               ON e.id    = m.fk_eta
            JOIN cco c               ON c.id    = e.fk_cco
            WHERE c.fk_empresa = ${idEmpresa}
              AND m.ativo = 1
              AND tc.tipo = '${TIPO_MONITORADO}'
        )
        SELECT DATE_FORMAT(data_hora, '%d/%m') AS label, COUNT(*) AS falhas
        FROM leituras
        WHERE valor > ${LIMITE_FALHA}
          AND (valor_anterior IS NULL OR valor_anterior <= ${LIMITE_FALHA})
          AND data_hora >= CURDATE() - INTERVAL ${intervalo} DAY
        GROUP BY DATE(data_hora), DATE_FORMAT(data_hora, '%d/%m')
        ORDER BY DATE(data_hora) ASC;
    `;

    console.log(`Executando a instrução SQL (pedroDash - ${dias}d): \n` + instrucaoSql);
    return database.executar(instrucaoSql);
}

module.exports = {
    buscarKpis,
    buscarFalhas24h,
    buscarFalhasDias
};