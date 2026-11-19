var database = require("../database/config");

function buscarKpis(idEmpresa) {
    var instrucaoSql = `
        SELECT
            -- kpi 1 Máquinas em sobrecarga de CPU por mais de 20 min
            (
                SELECT COUNT(*) FROM (
                    SELECT l.configuracao_fk_maquina
                    FROM leitura l
                    JOIN configuracao cfg ON l.configuracao_fk_maquina = cfg.fk_maquina
                        AND l.configuracao_fk_componente = cfg.fk_componente
                    JOIN componente comp ON cfg.fk_componente = comp.id
                    JOIN tipo_componente tc ON comp.fk_tipoComponente = tc.id
                    JOIN definicao_alerta da ON comp.fk_definicaoAlerta = da.id
                    JOIN maquina m ON cfg.fk_maquina = m.id
                    JOIN eta e ON m.fk_eta = e.id
                    JOIN cco c ON e.fk_cco = c.id
                    WHERE c.fk_empresa = ${idEmpresa}
                      AND m.ativo = 1
                      AND c.ativo = 1
                      AND UPPER(tc.tipo) LIKE '%CPU%'
                      AND l.data_hora >= NOW() - INTERVAL 30 MINUTE
                      AND l.valor >= da.valor_limite
                    GROUP BY l.configuracao_fk_maquina
                    HAVING TIMESTAMPDIFF(MINUTE, MIN(l.data_hora), MAX(l.data_hora)) >= 20
                       AND MAX(l.data_hora) >= NOW() - INTERVAL 5 MINUTE
                ) AS sub_cpu
            ) AS cpu_sobrecarga,

            -- kpi 2 Máquinas em sobrecarga de RAM por mais de 20 min
            (
                SELECT COUNT(*) FROM (
                    SELECT l.configuracao_fk_maquina
                    FROM leitura l
                    JOIN configuracao cfg ON l.configuracao_fk_maquina = cfg.fk_maquina
                        AND l.configuracao_fk_componente = cfg.fk_componente
                    JOIN componente comp ON cfg.fk_componente = comp.id
                    JOIN tipo_componente tc ON comp.fk_tipoComponente = tc.id
                    JOIN definicao_alerta da ON comp.fk_definicaoAlerta = da.id
                    JOIN maquina m ON cfg.fk_maquina = m.id
                    JOIN eta e ON m.fk_eta = e.id
                    JOIN cco c ON e.fk_cco = c.id
                    WHERE c.fk_empresa = ${idEmpresa}
                      AND m.ativo = 1
                      AND c.ativo = 1
                      AND UPPER(tc.tipo) LIKE '%RAM%'
                      AND l.data_hora >= NOW() - INTERVAL 30 MINUTE
                      AND l.valor >= da.valor_limite
                    GROUP BY l.configuracao_fk_maquina
                    HAVING TIMESTAMPDIFF(MINUTE, MIN(l.data_hora), MAX(l.data_hora)) >= 20
                       AND MAX(l.data_hora) >= NOW() - INTERVAL 5 MINUTE
                ) AS sub_ram
            ) AS ram_sobrecarga,

            -- kpi 3 Discos em estado crítico (leitura recente acima do limite)
            (
                SELECT COUNT(DISTINCT l.configuracao_fk_maquina)
                FROM leitura l
                JOIN configuracao cfg ON l.configuracao_fk_maquina = cfg.fk_maquina
                    AND l.configuracao_fk_componente = cfg.fk_componente
                JOIN componente comp ON cfg.fk_componente = comp.id
                JOIN tipo_componente tc ON comp.fk_tipoComponente = tc.id
                JOIN definicao_alerta da ON comp.fk_definicaoAlerta = da.id
                JOIN maquina m ON cfg.fk_maquina = m.id
                JOIN eta e ON m.fk_eta = e.id
                JOIN cco c ON e.fk_cco = c.id
                WHERE c.fk_empresa = ${idEmpresa}
                  AND m.ativo = 1
                  AND c.ativo = 1
                  AND UPPER(tc.tipo) LIKE '%DISCO%'
                  AND l.data_hora >= NOW() - INTERVAL 10 MINUTE
                  AND l.valor >= da.valor_limite
            ) AS discos_criticos,

            -- kpi 4 Máquinas desconectadas
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
                  AND LOWER(sm.estado) IN ('desconectada', 'inativa', 'offline')
            ) AS maquinas_desconectadas;
    `;

    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

function buscarGrafico24h(idEmpresa) {
    var instrucaoSql = `
        SELECT
            DATE_FORMAT(l.data_hora, '%Hh') AS label,
            SUM(CASE WHEN LOWER(dsc.status_alerta) LIKE '%crítico%' OR LOWER(dsc.status_alerta) LIKE '%critico%' THEN 1 ELSE 0 END) AS critico,
            SUM(CASE WHEN LOWER(dsc.status_alerta) NOT LIKE '%crítico%' AND LOWER(dsc.status_alerta) NOT LIKE '%critico%' THEN 1 ELSE 0 END) AS alerta
        FROM leitura_alerta la
        JOIN leitura l ON la.fk_leitura = l.id
        JOIN definicao_alerta da ON la.fk_definicaoAlerta = da.id
        JOIN descricao_alerta dsc ON da.fk_alerta_descricao = dsc.id
        JOIN maquina m ON l.configuracao_fk_maquina = m.id
        JOIN eta e ON m.fk_eta = e.id
        JOIN cco c ON e.fk_cco = c.id
        WHERE c.fk_empresa = ${idEmpresa}
          AND m.ativo = 1
          AND c.ativo = 1
          AND l.data_hora >= NOW() - INTERVAL 24 HOUR
        GROUP BY DATE_FORMAT(l.data_hora, '%Y-%m-%d %H'), DATE_FORMAT(l.data_hora, '%Hh')
        ORDER BY DATE_FORMAT(l.data_hora, '%Y-%m-%d %H') ASC;
    `;

    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

function buscarGrafico30d(idEmpresa) {
    var instrucaoSql = `
        SELECT
            DATE_FORMAT(l.data_hora, '%d/%m') AS label,
            SUM(CASE WHEN LOWER(dsc.status_alerta) LIKE '%crítico%' OR LOWER(dsc.status_alerta) LIKE '%critico%' THEN 1 ELSE 0 END) AS critico,
            SUM(CASE WHEN LOWER(dsc.status_alerta) NOT LIKE '%crítico%' AND LOWER(dsc.status_alerta) NOT LIKE '%critico%' THEN 1 ELSE 0 END) AS alerta
        FROM leitura_alerta la
        JOIN leitura l ON la.fk_leitura = l.id
        JOIN definicao_alerta da ON la.fk_definicaoAlerta = da.id
        JOIN descricao_alerta dsc ON da.fk_alerta_descricao = dsc.id
        JOIN maquina m ON l.configuracao_fk_maquina = m.id
        JOIN eta e ON m.fk_eta = e.id
        JOIN cco c ON e.fk_cco = c.id
        WHERE c.fk_empresa = ${idEmpresa}
          AND m.ativo = 1
          AND c.ativo = 1
          AND l.data_hora >= CURDATE() - INTERVAL 29 DAY
        GROUP BY DATE(l.data_hora), DATE_FORMAT(l.data_hora, '%d/%m')
        ORDER BY DATE(l.data_hora) ASC;
    `;

    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

function buscarHistorico(idEmpresa) {
    var instrucaoSql = `
        SELECT
            DATE_FORMAT(l.data_hora, '%d/%m/%Y %H:%i') AS data_hora,
            m.hostname AS maquina,
            tc.tipo AS componente,
            CONCAT('Uso em ', ROUND(l.valor, 1), '% (limite: ', ROUND(da.valor_limite, 0), '%)') AS ocorrencia,
            CASE
                WHEN LOWER(dsc.status_alerta) LIKE '%crítico%' OR LOWER(dsc.status_alerta) LIKE '%critico%' THEN 'Crítico'
                ELSE 'Alerta'
            END AS nivel,
            CASE
                WHEN l.data_hora >= NOW() - INTERVAL 30 MINUTE THEN 'Em aberto'
                ELSE 'Resolvido'
            END AS status
        FROM leitura_alerta la
        JOIN leitura l ON la.fk_leitura = l.id
        JOIN definicao_alerta da ON la.fk_definicaoAlerta = da.id
        JOIN descricao_alerta dsc ON da.fk_alerta_descricao = dsc.id
        JOIN componente comp ON l.configuracao_fk_componente = comp.id
        JOIN tipo_componente tc ON comp.fk_tipoComponente = tc.id
        JOIN maquina m ON l.configuracao_fk_maquina = m.id
        JOIN eta e ON m.fk_eta = e.id
        JOIN cco c ON e.fk_cco = c.id
        WHERE c.fk_empresa = ${idEmpresa}
          AND m.ativo = 1
          AND c.ativo = 1
        ORDER BY l.data_hora DESC
        LIMIT 10;
    `;

    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

module.exports = {
    buscarKpis,
    buscarGrafico24h,
    buscarGrafico30d,
    buscarHistorico
};