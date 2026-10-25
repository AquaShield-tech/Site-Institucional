var database = require("../database/config");

function cadastrar(nome, pais, cep, uf, fkEmpresa) {
    var instrucaoSql = `
        INSERT INTO cco (nome, pais, cep, uf, fk_empresa) 
        VALUES ('${nome}', '${pais}', '${cep}', '${uf}', ${fkEmpresa});
    `;
    console.log("A executar a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

module.exports = {
    cadastrar
};