var database = require("../database/config");

function listarMaquinas(idEmpresa) {
    var instrucaoSql = ` 
        SELECT 
            m.id,
            m.hostname,
            m.mac_address,
            c.nome AS nome_cco,
            e.id AS id_eta,
            COALESCE(
                (
            -- velocidade de conexao lida pelo oshi (java)
                    SELECT l.valor
                    FROM leitura l
                    JOIN medida med ON l.fk_medida = med.id
                    WHERE l.configuracao_fk_maquina = m.id
                      AND med.unidade_medida = 'Mbps (velocidade link)'
                    ORDER BY l.data_hora DESC
                    LIMIT 1
                ),
                (
            -- limite configurado no site 
                    SELECT MAX(comp.valor_maximo)
                    FROM configuracao cfg
                    JOIN componente comp ON cfg.fk_componente = comp.id
                    JOIN tipo_componente tc ON comp.fk_tipoComponente = tc.id
                    WHERE cfg.fk_maquina = m.id
                      AND UPPER(tc.tipo) LIKE '%REDE%'
                ),
                1000
            ) AS velocidade_link_mbps
        FROM maquina m
        JOIN eta e ON m.fk_eta = e.id
        JOIN cco c ON e.fk_cco = c.id
        WHERE c.fk_empresa = ${idEmpresa}
          AND m.ativo = 1
          AND c.ativo = 1
        ORDER BY c.nome ASC, m.hostname ASC;
    `;

    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

function buscarUltimasLeiturasResumo(idMaquina) {
    var instrucaoSql = `
    -- apenas ultima leitura sem varrer a tabela toda
        SELECT 
            med.unidade_medida,
            l.valor,
            l.data_hora,
            TIMESTAMPDIFF(SECOND, l.data_hora, NOW()) AS segundos_atras
        FROM leitura l
        JOIN medida med ON l.fk_medida = med.id
        INNER JOIN (
            SELECT fk_medida, MAX(id) AS ultimo_id
            FROM leitura
            WHERE configuracao_fk_maquina = ${idMaquina}
            GROUP BY fk_medida
        ) ult ON l.id = ult.ultimo_id
        WHERE med.unidade_medida IN (
            'Mbps (download)',
            'Mbps (upload)',
            'ms (latencia)',
            '% (perda pacotes)',
            'Mbps (velocidade link)'
        );
    `;

    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

function buscarLatenciasRecentes(idMaquina) {
    var instrucaoSql = `
    -- latencias das ultimas 24h ordenadas do menor pro maior
        SELECT l.valor
        FROM leitura l
        JOIN medida med ON l.fk_medida = med.id
        WHERE l.configuracao_fk_maquina = ${idMaquina}
          AND med.unidade_medida = 'ms (latencia)'
          AND l.data_hora >= NOW() - INTERVAL 24 HOUR
        ORDER BY l.valor ASC;
    `;

    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

function buscarPicosDiariosBanda(idMaquina) {
    var instrucaoSql = `
    -- maior pico de cada dia nos ultimos 30 dias
        SELECT 
            dia,
            MAX(vazao_ciclo) AS pico_mbps
        FROM (
            SELECT 
                DATE(l.data_hora) AS dia,
                l.data_hora,
                SUM(l.valor) AS vazao_ciclo
            FROM leitura l
            JOIN medida med ON l.fk_medida = med.id
            WHERE l.configuracao_fk_maquina = ${idMaquina}
              AND med.unidade_medida IN ('Mbps (download)', 'Mbps (upload)')
              AND l.data_hora >= CURDATE() - INTERVAL 30 DAY
            GROUP BY DATE(l.data_hora), l.data_hora
        ) ciclos
        GROUP BY dia
        ORDER BY dia ASC;
    `;

    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

function buscarTrafegoPorJanela(idMaquina, horas, bucketSegundos) {
    var instrucaoSql = `
        SELECT 
            FLOOR(UNIX_TIMESTAMP(l.data_hora) / ${bucketSegundos}) * ${bucketSegundos} AS bucket_unix,
            DATE_FORMAT(
                FROM_UNIXTIME(FLOOR(UNIX_TIMESTAMP(l.data_hora) / ${bucketSegundos}) * ${bucketSegundos}),
                '%H:%i'
            ) AS horario,
            ROUND(COALESCE(AVG(CASE WHEN med.unidade_medida = 'Mbps (download)' THEN l.valor END), 0), 2) AS entrada_mbps,
            ROUND(COALESCE(AVG(CASE WHEN med.unidade_medida = 'Mbps (upload)' THEN l.valor END), 0), 2) AS saida_mbps
        FROM leitura l
        JOIN medida med ON l.fk_medida = med.id
        WHERE l.configuracao_fk_maquina = ${idMaquina}
          AND med.unidade_medida IN ('Mbps (download)', 'Mbps (upload)')
          AND l.data_hora >= NOW() - INTERVAL ${horas} HOUR
        GROUP BY bucket_unix, horario
        ORDER BY bucket_unix ASC;
    `;

    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

function buscarAmostrasDispersao(idMaquina) {
    var instrucaoSql = `
        SELECT 
            l.data_hora,
            ROUND(
                COALESCE(SUM(CASE WHEN med.unidade_medida IN ('Mbps (download)', 'Mbps (upload)') THEN l.valor END), 0),
                2
            ) AS vazao_mbps,
            ROUND(
                COALESCE(MAX(CASE WHEN med.unidade_medida = 'KB (tamanho pacote)' THEN l.valor END), 0),
                2
            ) AS pacote_kb,
            ROUND(
                MAX(CASE WHEN med.unidade_medida = 'ms (latencia)' THEN l.valor END),
                2
            ) AS latencia_ms
        FROM leitura l
        JOIN medida med ON l.fk_medida = med.id
        WHERE l.configuracao_fk_maquina = ${idMaquina}
          AND med.unidade_medida IN (
              'Mbps (download)',
              'Mbps (upload)',
              'KB (tamanho pacote)',
              'ms (latencia)'
          )
          AND l.data_hora >= NOW() - INTERVAL 24 HOUR
        GROUP BY l.data_hora
        HAVING latencia_ms IS NOT NULL
        ORDER BY l.data_hora DESC
        LIMIT 120;
    `;

    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

function buscarEventosRede(idMaquina) {
    var instrucaoSql = `
        SELECT 
            la.id AS id_alerta,
            l.valor AS valor_medido,
            da.valor_limite AS valor_limite,
            med.unidade_medida,
            l.data_hora,
            TIMESTAMPDIFF(MINUTE, l.data_hora, NOW()) AS minutos_atras,
            CASE 
                WHEN da.id = c.fk_definicaoAlertaCritico THEN 'critico'
                ELSE 'atencao'
            END AS nivel
        FROM leitura_alerta la
        JOIN leitura l ON la.fk_leitura = l.id
        JOIN definicao_alerta da ON la.fk_definicaoAlerta = da.id
        JOIN medida med ON l.fk_medida = med.id
        JOIN componente c ON l.configuracao_fk_componente = c.id
        JOIN tipo_componente tc ON c.fk_tipoComponente = tc.id
        WHERE l.configuracao_fk_maquina = ${idMaquina}
          AND UPPER(tc.tipo) LIKE '%REDE%'
        ORDER BY l.data_hora DESC
        LIMIT 3;
    `;

    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

function buscarUltimaVerificacaoRede(idMaquina) {
    var instrucaoSql = `
        SELECT 
            MAX(l.data_hora) AS ultima_coleta,
            TIMESTAMPDIFF(MINUTE, MAX(l.data_hora), NOW()) AS minutos_atras
        FROM leitura l
        JOIN medida med ON l.fk_medida = med.id
        WHERE l.configuracao_fk_maquina = ${idMaquina}
          AND med.unidade_medida IN (
              'Mbps (download)',
              'Mbps (upload)',
              'ms (latencia)',
              '% (perda pacotes)'
          );
    `;

    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

function buscarCapacidadeCadastradaRede(idMaquina) {
    var instrucaoSql = `
        SELECT MAX(comp.valor_maximo) AS capacidade_cadastrada_mbps
        FROM configuracao cfg
        JOIN componente comp ON cfg.fk_componente = comp.id
        JOIN tipo_componente tc ON comp.fk_tipoComponente = tc.id
        WHERE cfg.fk_maquina = ${idMaquina}
          AND UPPER(tc.tipo) LIKE '%REDE%';
    `;

    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

module.exports = {
    listarMaquinas,
    buscarUltimasLeiturasResumo,
    buscarLatenciasRecentes,
    buscarPicosDiariosBanda,
    buscarTrafegoPorJanela,
    buscarAmostrasDispersao,
    buscarEventosRede,
    buscarUltimaVerificacaoRede,
    buscarCapacidadeCadastradaRede
};