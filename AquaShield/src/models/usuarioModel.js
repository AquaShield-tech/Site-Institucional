var database = require("../database/config");

function autenticar(email, senha) {
    var instrucaoSql = `
        SELECT 
            u.id, 
            u.nome, 
            u.email, 
            u.fk_empresa, 
            u.fk_cargo 
        FROM usuario u 
        WHERE u.email = '${email}' 
          AND u.senha = '${senha}'
          AND (u.status_atual = 'Ativo' OR u.status_atual IS NULL);
    `;
    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

function cadastrar(nome, email, senha, status, fkEmpresa, fkCargo) {
    var instrucaoSql = `
        INSERT INTO usuario (nome, email, senha, data_cadastro, status_atual, fk_empresa, fk_cargo) 
        VALUES ('${nome}', '${email}', '${senha}', NOW(), '${status}', ${fkEmpresa}, ${fkCargo});
    `;
    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

function cadastrarFuncionario(nome, email, telefone, senha, fkEmpresa, fkCargo) {
    var instrucaoSql = `
        INSERT INTO usuario (nome, email, telefone, senha, data_cadastro, status_atual, fk_empresa, fk_cargo) 
        VALUES ('${nome}', '${email}', '${telefone}', '${senha}', NOW(), 'Ativo', ${fkEmpresa}, ${fkCargo});
    `;
    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

function listarPorEmpresa(idEmpresa) {
    var instrucaoSql = `
        SELECT
            u.id,
            u.nome,
            u.email,
            IFNULL(u.telefone, 'Sem telefone') AS telefone,
            u.fk_cargo,
            CASE
                WHEN u.fk_cargo = 1 THEN 'Gestor'
                WHEN u.fk_cargo = 2 THEN 'Analista'
                ELSE 'Operador'
            END AS cargo
        FROM usuario u
        WHERE u.fk_empresa = ${idEmpresa}
          AND (u.status_atual = 'Ativo' OR u.status_atual IS NULL)
        ORDER BY u.nome ASC;
    `;
    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

function editarFuncionario(idUsuario, nome, email, telefone, fkCargo) {
    var instrucaoSql = `
        UPDATE usuario
        SET nome = '${nome}',
            email = '${email}',
            telefone = '${telefone}',
            fk_cargo = ${fkCargo}
        WHERE id = ${idUsuario};
    `;
    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

function excluirFuncionario(idUsuario) {
    var instrucaoSql = `
        UPDATE usuario
        SET status_atual = 'Inativo'
        WHERE id = ${idUsuario};
    `;
    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

module.exports = {
    autenticar,
    cadastrar,
    cadastrarFuncionario,
    listarPorEmpresa,
    editarFuncionario,
    excluirFuncionario
};