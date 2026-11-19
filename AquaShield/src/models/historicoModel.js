var database = require("../database/config");

function listar(idEmpresa) {
    var instrucaoSql = `
        SELECT
            h.id,
            m.hostname AS maquina,
            DATE_FORMAT(h.data_hora, '%d/%m/%Y %H:%i') AS data_hora,
            h.acao,
            h.descricao,
            IFNULL(h.componente, '-') AS componente,
            u.nome AS responsavel
        FROM historico_alteracao h
        JOIN maquina m ON h.fk_maquina = m.id
        JOIN eta e ON m.fk_eta = e.id
        JOIN cco c ON e.fk_cco = c.id
        JOIN usuario u ON h.fk_usuario = u.id
        WHERE c.fk_empresa = ${idEmpresa}
        ORDER BY h.data_hora DESC;
    `;

    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

function registrar(acao, descricao, componente, fkMaquina, fkUsuario) {
    var compFinal = componente ? `'${componente}'` : `'-'`;

    var instrucaoSql = `
        INSERT INTO historico_alteracao (acao, descricao, componente, fk_maquina, fk_usuario)
        VALUES ('${acao}', '${descricao}', ${compFinal}, ${fkMaquina}, ${fkUsuario});
    `;

    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

module.exports = {
    listar,
    registrar
};