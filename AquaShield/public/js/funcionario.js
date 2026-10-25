function validarSessao() {
    var fkCargo = sessionStorage.FK_CARGO;
    var nomeUsuario = sessionStorage.NOME_USUARIO;

    if (!fkCargo || fkCargo != "1") {
        alert("Permissão negada! Apenas gestores podem cadastrar um CCO.");
        window.location.replace("inicio.html");
    } else {
        var elementUsuario = document.getElementById("b_usuario");
        if (elementUsuario && nomeUsuario) {
            elementUsuario.innerHTML = nomeUsuario;
        }
    }

    var elementCargo = document.getElementById("b_cargo");
    if (elementCargo && fkCargo) {
        if (fkCargo == "1") {
            elementCargo.innerHTML = "Gestor";
        } else if (fkCargo == "2") {
            elementCargo.innerHTML = "Analista";
        } else if(fkCargo == "3"){
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