var empresaModel = require("../models/empresaModel");

function buscarPorCnpj(req, res) {
  var cnpj = req.query.cnpj;

  empresaModel.buscarPorCnpj(cnpj).then((resultado) => {
    res.status(200).json(resultado);
  });
}

function listar(req, res) {
  empresaModel.listar().then((resultado) => {
    res.status(200).json(resultado);
  });
}

function buscarPorId(req, res) {
  var id = req.params.id;

  empresaModel.buscarPorId(id).then((resultado) => {
    res.status(200).json(resultado);
  });
}

function cadastrar(req, res) {
    var razaoSocial = req.body.razaoSocialServer;
    var nomeFantasia = req.body.nomeFantasiaServer;
    var cnpj = req.body.cnpjServer;

    var nomeGestor = req.body.nomeGestorServer;
    var emailGestor = req.body.emailGestorServer;
    var senhaGestor = req.body.senhaGestorServer;
    var fkCargo = req.body.fkCargoServer;

    if (razaoSocial == undefined) {
        res.status(400).send("A razão social está undefined!");
    } else if (cnpj == undefined) {
        res.status(400).send("O CNPJ está undefined!");
    } else if (emailGestor == undefined) {
        res.status(400).send("O e-mail do gestor está undefined!");
    } else {
        // Busca CNPJ 
        empresaModel.buscarPorCnpj(cnpj).then(function (resultadoCnpj) {
            if (resultadoCnpj.length > 0) {
                res.status(401).json({ mensagem: `A empresa com o CNPJ ${cnpj} já existe` });
            } else {
                // Cadastra a Empresa
                empresaModel.cadastrarEmpresa(razaoSocial, nomeFantasia, cnpj).then(function (resultadoEmpresa) {
                    var idEmpresa = resultadoEmpresa.insertId;

                    // Cadastra o Gestor DIRETAMENTE após a empresa
                    empresaModel.cadastrarGestor(nomeGestor, emailGestor, senhaGestor, idEmpresa, fkCargo).then(function (resultadoGestor) {
                        res.status(201).json(resultadoGestor);
                    }).catch(function (erroGestor) {
                        console.log(erroGestor);
                        res.status(500).json(erroGestor.sqlMessage);
                    });

                }).catch(function (erroEmpresa) {
                    console.log(erroEmpresa);
                    res.status(500).json(erroEmpresa.sqlMessage);
                });
            }
        }).catch(function (erroConsulta) {
            console.log(erroConsulta);
            res.status(500).json(erroConsulta.sqlMessage);
        });
    }
}

module.exports = {
  buscarPorCnpj,
  buscarPorId,
  cadastrar,
  listar,
};
