var idCcoEditando = null;

function validarSessao() {
    var fkCargo = sessionStorage.FK_CARGO;
    var nomeUsuario = sessionStorage.NOME_USUARIO;

    if (!fkCargo || fkCargo != "1") {
        agendarToast("Acesso negado! Apenas gestores podem cadastrar um CCO.", "erro");
        window.location.replace("inicio.html");
    } else {
        var elementUsuario = document.getElementById("b_usuario");
        if (elementUsuario && nomeUsuario) {
            elementUsuario.innerHTML = nomeUsuario;
        }
        listarCcos();
    }

    var elementCargo = document.getElementById("b_cargo");
    if (elementCargo && fkCargo) {
        if (fkCargo == "1") {
            elementCargo.innerHTML = "Gestor";
        } else if (fkCargo == "2") {
            elementCargo.innerHTML = "Analista";
        } else if (fkCargo == "3") {
            elementCargo.innerHTML = "Operador";
        }
    }
}

function deslogar() {
    sessionStorage.clear();
    agendarToast("Sessão encerrada com sucesso.", "sucesso");
    window.location = "index.html";
}

function cadastrarCco() {
    var nomeVar = input_nome.value.trim();
    var paisVar = input_pais.value.trim();
    var cepVar = input_cep.value.trim();
    var ufVar = input_uf.value.trim().toUpperCase();
    var fkEmpresaVar = sessionStorage.FK_EMPRESA;

    var ax_erro = false;

    validacao_nome.style.display = "none";
    validacao_pais.style.display = "none";
    validacao_cep.style.display = "none";
    validacao_uf.style.display = "none";

    if (nomeVar == "") {
        validacao_nome.innerHTML = "Campo Obrigatório";
        validacao_nome.style.display = "block";
        ax_erro = true;
    }
    if (paisVar == "") {
        validacao_pais.innerHTML = "Campo Obrigatório";
        validacao_pais.style.display = "block";
        ax_erro = true;
    }
    if (cepVar == "" || cepVar.length != 8) {
        validacao_cep.innerHTML = "Insira um CEP válido de 8 dígitos";
        validacao_cep.style.display = "block";
        ax_erro = true;
    }
    if (ufVar == "") {
        validacao_uf.innerHTML = "Campo Obrigatório";
        validacao_uf.style.display = "block";
        ax_erro = true;
    }

    if (ax_erro == false) {
        fetch("/cco/cadastrar", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                nomeServer: nomeVar,
                paisServer: paisVar,
                cepServer: cepVar,
                ufServer: ufVar,
                fkEmpresaServer: fkEmpresaVar
            })
        }).then(function (resposta) {
            if (resposta.ok) {
                agendarToast("CCO cadastrado com sucesso!", "sucesso");
                window.location.reload();
            } else {
                exibirToast("Houve um erro ao cadastrar o CCO.", "erro");
            }
        }).catch(function (erro) {
            console.log("#ERRO: ", erro);
            exibirToast("Falha de comunicação com o servidor.", "erro");
        });
    }
}

function listarCcos() {
    var fkEmpresaVar = sessionStorage.FK_EMPRESA;

    fetch(`/cco/listar/${fkEmpresaVar}`)
        .then(function (resposta) {
            if (resposta.ok) {
                resposta.json().then(function (lista) {
                    lista_ccos.innerHTML = "";
                    msg_vazio.style.display = lista.length == 0 ? "block" : "none";

                    for (var i = 0; i < lista.length; i++) {
                        let cco = lista[i];
                        var item = molde_cco.content.cloneNode(true);

                        item.querySelector(".cco-nome").innerText = cco.nome;
                        item.querySelector(".cco-detalhes").innerText = `${cco.pais} - ${cco.uf} | CEP: ${cco.cep}`;

                        item.querySelector(".btn-editar").onclick = function () {
                            prepararEdicao(cco);
                        };
                        item.querySelector(".btn-excluir").onclick = function () {
                            excluirCco(cco.id, cco.nome);
                        };

                        lista_ccos.appendChild(item);
                    }
                });
            }
        });
}

function prepararEdicao(cco) {
    idCcoEditando = cco.id;
    input_nome.value = cco.nome;
    input_pais.value = cco.pais;
    input_cep.value = cco.cep;
    input_uf.value = cco.uf;

    titulo_cco.innerText = "Editar CCO";
    btn_criar.style.display = "none";
    btn_salvar.style.display = "block";
    btn_cancelar.style.display = "block";
}

function cancelarEdicao() {
    idCcoEditando = null;
    input_nome.value = "";
    input_pais.value = "";
    input_cep.value = "";
    input_uf.value = "";

    titulo_cco.innerText = "Cadastro de CCO";
    btn_criar.style.display = "block";
    btn_salvar.style.display = "none";
    btn_cancelar.style.display = "none";
}

function salvarEdicao() {
    var nomeVar = input_nome.value.trim();
    var paisVar = input_pais.value.trim();
    var cepVar = input_cep.value.trim();
    var ufVar = input_uf.value.trim().toUpperCase();

    if (nomeVar == "" || paisVar == "" || cepVar.length != 8 || ufVar == "") {
        exibirToast("Preencha todos os campos corretamente (CEP com 8 dígitos).", "alerta");
        return;
    }

    fetch(`/cco/editar/${idCcoEditando}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            nomeServer: nomeVar,
            paisServer: paisVar,
            cepServer: cepVar,
            ufServer: ufVar
        })
    }).then(function (resposta) {
        if (resposta.ok) {
            exibirToast("Alterações do CCO salvas com sucesso!", "sucesso");
            cancelarEdicao();
            listarCcos();
        } else {
            exibirToast("Houve um erro ao atualizar o CCO.", "erro");
        }
    }).catch(function (erro) {
        console.log("#ERRO: ", erro);
        exibirToast("Falha de comunicação com o servidor.", "erro");
    });
}

function excluirCco(id, nome) {
    confirmarAcao(
        "Tem certeza?",
        `Deseja realmente excluir o CCO "${nome}"?`,
        function () {
            fetch(`/cco/excluir/${id}`, {
                method: "DELETE"
            }).then(function (resposta) {
                if (resposta.ok) {
                    exibirToast("CCO removido com sucesso!", "sucesso");
                    listarCcos();
                } else {
                    resposta.text().then(function (mensagem) {
                        exibirToast(mensagem || "Não foi possível excluir o CCO.", "erro");
                    });
                }
            }).catch(function (erro) {
                console.log("#ERRO: ", erro);
                exibirToast("Falha de comunicação com o servidor.", "erro");
            });
        },
        "Excluir"
    );
}