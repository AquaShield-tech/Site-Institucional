var database = require("../database/config")

function autenticar(email, senha) {
    console.log("ACESSEI O USUARIO MODEL \n \n\t\t >> Se aqui der erro de 'Error: connect ECONNREFUSED',\n \t\t >> verifique suas credenciais de acesso ao banco\n \t\t >> e se o servidor de seu BD está rodando corretamente. \n\n function entrar(): ", email, senha)
    var instrucaoSql = `
        SELECT 
            u.id, 
            u.nome, 
            u.email, 
            u.fk_empresa, 
            u.fk_cargo 
        FROM usuario u 
        WHERE u.email = '${email}' AND u.senha = '${senha}';
    `;
    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

function cadastrar(nome, email, senha, status, fkEmpresa, fkCargo) {
    console.log("ACESSEI O USUARIO MODEL \n \n\t\t >> Se aqui der erro de 'Error: connect ECONNREFUSED',\n \t\t >> verifique suas credenciais de acesso ao banco\n \t\t >> e se o servidor de seu BD está rodando corretamente. \n\n function cadastrar():", nome, email, senha, status, fkEmpresa, fkCargo);

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

module.exports = {
    autenticar,
    cadastrar,
    cadastrarFuncionario
};