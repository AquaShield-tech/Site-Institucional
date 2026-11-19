var idFuncionarioEditando = null;

function validarSessao() {
    var fkCargo = sessionStorage.FK_CARGO;
    var nomeUsuario = sessionStorage.NOME_USUARIO;

    if (!fkCargo || fkCargo != "1") {
        alert("Permissão negada! Apenas gestores podem acessar esta sessão.");
        window.location.replace("inicio.html");
    } else {
        var elementUsuario = document.getElementById("b_usuario");
        if (elementUsuario && nomeUsuario) {
            elementUsuario.innerHTML = nomeUsuario;
        }
        listarFuncionarios();
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
    alert("Sessão encerrada com sucesso.");
    window.location = "index.html";
}

function cadastrarFuncionario() {
    var nomeVar = input_nome.value.trim();
    var emailVar = input_email_cadastro.value.trim();
    var telefoneVar = input_telefone.value.trim();
    var cargoVar = select_cargo.value;
    var senhaVar = input_senha_provisoria.value.trim();
    var fkEmpresaVar = sessionStorage.FK_EMPRESA;

    var ax_erro = false;

    validacao_nome.style.display = "none";
    validacao_email.style.display = "none";
    validacao_telefone.style.display = "none";
    validacao_cargo.style.display = "none";
    validacao_senha.style.display = "none";

    if (nomeVar == "") {
        validacao_nome.innerHTML = "Campo Obrigatório";
        validacao_nome.style.display = "block";
        ax_erro = true;
    }

    if (emailVar == "") {
        validacao_email.innerHTML = "Campo Obrigatório";
        validacao_email.style.display = "block";
        ax_erro = true;
    }

    if (telefoneVar == "") {
        validacao_telefone.innerHTML = "Campo Obrigatório";
        validacao_telefone.style.display = "block";
        ax_erro = true;
    }

    if (cargoVar == "" || cargoVar == null) {
        validacao_cargo.innerHTML = "Selecione o Cargo do Usuário";
        validacao_cargo.style.display = "block";
        ax_erro = true;
    }

    if (senhaVar == "") {
        validacao_senha.innerHTML = "Campo Obrigatório";
        validacao_senha.style.display = "block";
        ax_erro = true;
    }

    if (ax_erro == false) {
        fetch("/usuarios/cadastrarFuncionario", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                nomeServer: nomeVar,
                emailServer: emailVar,
                telefoneServer: telefoneVar,
                senhaServer: senhaVar,
                fkEmpresaServer: fkEmpresaVar,
                fkCargoServer: Number(cargoVar)
            })
        }).then(function (resposta) {
            if (resposta.ok) {
                alert("Funcionário cadastrado com sucesso!");
                window.location.reload();
            } else {
                alert("Houve um erro ao cadastrar o funcionário!");
            }
        }).catch(function (erro) {
            console.log("#ERRO: ", erro);
        });
    }
}

function listarFuncionarios() {
    var fkEmpresaVar = sessionStorage.FK_EMPRESA;

    fetch(`/usuarios/listar/${fkEmpresaVar}`)
        .then(function (resposta) {
            if (resposta.ok) {
                resposta.json().then(function (lista) {
                    lista_funcionarios.innerHTML = "";
                    msg_vazio.style.display = lista.length == 0 ? "block" : "none";

                    for (var i = 0; i < lista.length; i++) {
                        let func = lista[i];
                        var item = molde_funcionario.content.cloneNode(true);

                        item.querySelector(".func-nome").innerText = `${func.nome} (${func.cargo})`;
                        item.querySelector(".func-detalhes").innerText = `${func.email} | Tel: ${func.telefone}`;

                        item.querySelector(".btn-editar").onclick = function () {
                            prepararEdicao(func);
                        };
                        item.querySelector(".btn-excluir").onclick = function () {
                            excluirFuncionario(func.id, func.nome);
                        };

                        lista_funcionarios.appendChild(item);
                    }
                });
            }
        });
}

function prepararEdicao(func) {
    idFuncionarioEditando = func.id;
    input_nome.value = func.nome;
    input_email_cadastro.value = func.email;
    input_telefone.value = func.telefone == "Sem telefone" ? "" : func.telefone;
    select_cargo.value = func.fk_cargo;

    input_senha_provisoria.style.display = "none";
    validacao_senha.style.display = "none";

    titulo_funcionario.innerText = "Editar Funcionário";
    btn_criar.style.display = "none";
    btn_salvar.style.display = "block";
    btn_cancelar.style.display = "block";
}

function cancelarEdicao() {
    idFuncionarioEditando = null;
    input_nome.value = "";
    input_email_cadastro.value = "";
    input_telefone.value = "";
    select_cargo.value = "";
    input_senha_provisoria.value = "";
    input_senha_provisoria.style.display = "block";

    titulo_funcionario.innerText = "Cadastro de Funcionário";
    btn_criar.style.display = "block";
    btn_salvar.style.display = "none";
    btn_cancelar.style.display = "none";
}

function salvarEdicao() {
    var nomeVar = input_nome.value.trim();
    var emailVar = input_email_cadastro.value.trim();
    var telefoneVar = input_telefone.value.trim();
    var cargoVar = select_cargo.value;

    if (nomeVar == "" || emailVar == "" || telefoneVar == "" || cargoVar == "") {
        alert("Preencha todos os campos corretamente.");
        return;
    }

    fetch(`/usuarios/editar/${idFuncionarioEditando}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            nomeServer: nomeVar,
            emailServer: emailVar,
            telefoneServer: telefoneVar,
            fkCargoServer: Number(cargoVar)
        })
    }).then(function (resposta) {
        if (resposta.ok) {
            alert("Funcionário atualizado com sucesso!");
            cancelarEdicao();
            listarFuncionarios();
        } else {
            alert("Houve um erro ao atualizar o funcionário.");
        }
    });
}

function excluirFuncionario(id, nome) {
    if (id == sessionStorage.ID_USUARIO) {
        alert("Você não pode desativar a sua própria conta enquanto estiver logado.");
        return;
    }

    if (confirm(`Tem certeza que deseja remover o funcionário "${nome}"?`)) {
        fetch(`/usuarios/excluir/${id}`, {
            method: "DELETE"
        }).then(function (resposta) {
            if (resposta.ok) {
                alert("Funcionário removido com sucesso!");
                listarFuncionarios();
            } else {
                alert("Não foi possível remover o funcionário.");
            }
        });
    }
}