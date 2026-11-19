var database = require("../database/config");

function cadastrar(nome, pais, cep, uf, fkEmpresa) {
    var instrucaoSql = `
        INSERT INTO cco (nome, pais, cep, uf, fk_empresa) 
        VALUES ('${nome}', '${pais}', '${cep}', '${uf}', ${fkEmpresa});
    `;
    console.log("A executar a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

function listar(idEmpresa) {
    var instrucaoSql = `
        SELECT
            id,
            nome,
            pais,
            CEP AS cep,
            uf
        FROM cco
        WHERE fk_empresa = ${idEmpresa}
          AND ativo = 1
        ORDER BY id ASC;
    `;
    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

function verificarMaquinasAtivas(idCco) {
    var instrucaoSql = `
        SELECT COUNT(m.id) AS qtd_maquinas
        FROM maquina m
        JOIN eta e ON m.fk_eta = e.id
        WHERE e.fk_cco = ${idCco}
          AND m.ativo = 1;
    `;
    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

function editar(idCco, nome, pais, cep, uf) {
    var instrucaoSql = `
        UPDATE cco
        SET nome = '${nome}',
            pais = '${pais}',
            CEP = '${cep}',
            uf = '${uf}'
        WHERE id = ${idCco};
    `;
    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

function excluir(idCco) {
    var instrucaoSql = `
        UPDATE cco
        SET ativo = 0
        WHERE id = ${idCco};
    `;
    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

function listarEtas(idEmpresa) {
    var instrucaoSql = `
        SELECT
            e.id,
            c.nome AS nome_cco
        FROM eta e
        JOIN cco c ON e.fk_cco = c.id
        WHERE c.fk_empresa = ${idEmpresa}
          AND c.ativo = 1
        ORDER BY c.nome ASC, e.id ASC;
    `;
    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

function cadastrarEta(pais, uf, cep, fkCco) {
    var instrucaoSql = `
        INSERT INTO eta (pais, uf, CEP, fk_cco)
        VALUES ('${pais}', '${uf}', '${cep}', ${fkCco});
    `;
    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

module.exports = {
    cadastrar,
    listar,
    verificarMaquinasAtivas,
    editar,
    excluir,
    listarEtas,
    cadastrarEta
};