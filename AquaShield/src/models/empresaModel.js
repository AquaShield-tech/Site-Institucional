var database = require("../database/config");

function buscarPorId(id) {
  var instrucaoSql = `SELECT * FROM empresa WHERE id = '${id}'`;

  return database.executar(instrucaoSql);
}

function listar() {
  var instrucaoSql = `SELECT id, razao_social, cnpj, codigo_ativacao FROM empresa`;

  return database.executar(instrucaoSql);
}

function buscarPorCnpj(cnpj) {
  var instrucaoSql = `SELECT * FROM empresa WHERE cnpj = '${cnpj}'`;

  return database.executar(instrucaoSql);
}

function cadastrarEmpresa(razaoSocial, nomeFantasia, cnpj) {
    var instrucaoSql = `
        INSERT INTO empresa (razao_social, nome_fantasia, cnpj, data_cadastro) 
        VALUES ('${razaoSocial}', '${nomeFantasia}', '${cnpj}', NOW());
    `;
    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

function cadastrarCco(nome, pais, cep, uf, fkEmpresa) {
    var instrucaoSql = `
        INSERT INTO cco (nome, pais, CEP, uf, fk_empresa) 
        VALUES ('${nome}', '${pais}', '${cep}', '${uf}', ${fkEmpresa});
    `;
    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

function cadastrarGestor(nome, email, senha, fkEmpresa, fkCargo) {
    var instrucaoSql = `
        INSERT INTO usuario (nome, email, senha, data_cadastro, status_atual, fk_empresa, fk_cargo) 
        VALUES ('${nome}', '${email}', '${senha}', NOW(), 'Ativo', ${fkEmpresa}, ${fkCargo});
    `;
    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

module.exports = {
    buscarPorCnpj,
    cadastrarEmpresa,
    cadastrarCco,
    cadastrarGestor
};