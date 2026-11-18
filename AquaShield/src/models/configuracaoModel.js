var database = require("../database/config");

function buscarAtuais(idEmpresa) {
    var instrucaoSql = `
        SELECT
            tc.id AS fk_tipo,
            tc.tipo AS componente,
            MAX(da.valor_limite) AS limite_atencao
        FROM tipo_componente tc
        JOIN componente comp ON comp.fk_tipoComponente = tc.id
        JOIN definicao_alerta da ON comp.fk_definicaoAlerta = da.id
        JOIN configuracao cfg ON cfg.fk_componente = comp.id
        JOIN maquina m ON cfg.fk_maquina = m.id
        JOIN eta e ON m.fk_eta = e.id
        JOIN cco c ON e.fk_cco = c.id
        WHERE c.fk_empresa = ${idEmpresa}
          AND m.ativo = 1
        GROUP BY tc.id, tc.tipo
        ORDER BY tc.id ASC;
    `;

    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

function buscarDefinicaoPorValor(valorLimite, fkDescricao) {
    var instrucaoSql = `
        SELECT id
        FROM definicao_alerta
        WHERE valor_limite = ${valorLimite}
          AND fk_alerta_descricao = ${fkDescricao}
        LIMIT 1;
    `;

    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

function cadastrarDefinicao(valorLimite, fkDescricao) {
    var instrucaoSql = `
        INSERT INTO definicao_alerta (valor_limite, fk_alerta_descricao)
        VALUES (${valorLimite}, ${fkDescricao});
    `;

    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

function aplicarGlobalComponente(idEmpresa, fkTipoComponente, idDefinicaoAlerta) {
    var instrucaoSql = `
        UPDATE componente comp
        JOIN tipo_componente tc ON comp.fk_tipoComponente = tc.id
        JOIN configuracao cfg ON cfg.fk_componente = comp.id
        JOIN maquina m ON cfg.fk_maquina = m.id
        JOIN eta e ON m.fk_eta = e.id
        JOIN cco c ON e.fk_cco = c.id
        SET comp.fk_definicaoAlerta = ${idDefinicaoAlerta}
        WHERE c.fk_empresa = ${idEmpresa}
          AND m.ativo = 1
          AND tc.id = ${fkTipoComponente};
    `;

    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

function restaurarPadraoEmpresa(idEmpresa) {
    var instrucaoSql = `
        UPDATE componente comp
        JOIN tipo_componente tc ON comp.fk_tipoComponente = tc.id
        JOIN configuracao cfg ON cfg.fk_componente = comp.id
        JOIN maquina m ON cfg.fk_maquina = m.id
        JOIN eta e ON m.fk_eta = e.id
        JOIN cco c ON e.fk_cco = c.id
        SET comp.fk_definicaoAlerta = (
            SELECT id FROM definicao_alerta
            WHERE valor_limite = CASE
                WHEN tc.id = 1 THEN 50.00
                WHEN tc.id = 2 THEN 60.00
                WHEN tc.id = 3 THEN 80.00
                WHEN tc.id = 4 THEN 50.00
                ELSE 75.00
            END
            AND fk_alerta_descricao = 1
            LIMIT 1
        )
        WHERE c.fk_empresa = ${idEmpresa};
    `;

    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

function excluirPersonalizados() {
    var instrucaoSql = `
        DELETE FROM definicao_alerta
        WHERE id > 6
          AND id NOT IN (
              SELECT DISTINCT fk_definicaoAlerta
              FROM componente
              WHERE fk_definicaoAlerta IS NOT NULL
          );
    `;

    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

module.exports = {
    buscarAtuais,
    buscarDefinicaoPorValor,
    cadastrarDefinicao,
    aplicarGlobalComponente,
    restaurarPadraoEmpresa,
    excluirPersonalizados
};