const container = document.getElementById('container');
const registerBtn = document.getElementById('registrar');
const loginBtn = document.getElementById('login');

registerBtn.addEventListener('click', () =>{
    container.classList.add("active");
});

loginBtn.addEventListener('click', () =>{
    container.classList.remove("active");
});


    function entrar() {
        //aguardar();
    var emailVar = input_email_login.value.trim();
    var senhaVar = input_senha_login.value.trim();

    let ax_erro = false;

    var validacao_email_login = document.getElementById("validacao_email_login");
    var validacao_senha_login = document.getElementById("validacao_senha_login");

    if (validacao_email_login) validacao_email_login.style.display = "none";
    if (validacao_senha_login) validacao_senha_login.style.display = "none";

    if (emailVar == '') {
        if (validacao_email_login) {
            validacao_email_login.innerHTML = "Campo Obrigatório";
            validacao_email_login.style.display = "block";
        }
        ax_erro = true;
    }

    if (senhaVar == '') {
        if (validacao_senha_login) {
            validacao_senha_login.innerHTML = "Campo Obrigatório";
            validacao_senha_login.style.display = "block";
        }
        ax_erro = true;
    }

    if (ax_erro == false) {
        console.log("FORM LOGIN: ", emailVar);
        console.log("FORM SENHA: ", senhaVar);

        fetch("/usuarios/autenticar", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                emailServer: emailVar,
                senhaServer: senhaVar
            })
        }).then(function (resposta) {
            if (resposta.ok) {
                resposta.json().then(json => {
                    sessionStorage.EMAIL_USUARIO = json.email;
                    sessionStorage.NOME_USUARIO = json.nome;
                    sessionStorage.ID_USUARIO = json.id;

                    setTimeout(function () {
                        window.location = "./dashboard/cards.html";
                    }, 1000);
                });
            } else {
                alert("Houve um erro ao tentar realizar o login! Verifique suas credenciais.");
            }
        }).catch(function (erro) {
            console.log(erro);
        });
    }

    return false;
}

    function sumirMensagem() {
        cardErro.style.display = "none"
    }


  function cadastrar() {
    // 1. Captura os valores digitados nos inputs
    var nomeVar = input_nome.value.trim();
    var emailVar = input_email_cadastro.value.trim();
    var senhaVar = input_senha_cadastro.value.trim();
    var confSenhaVar = input_senha_confirmada.value.trim();

    var statusVar = "Ativo";
    var fkEmpresaVar = 1;
    var fkCargoVar = 1;

    let qtdNumero = 0;
    let caracterEspecial = '!@#$%&*';
    let possuiCaracEspecial = false;
    let ax_erro = false;

    // Elementos de validação
    var validacao_nome = document.getElementById("validacao_nome");
    var validacao_email = document.getElementById("validacao_email");
    var validacao_senha = document.getElementById("validacao_senha");
    var validacao_confSenha = document.getElementById("validacao_confSenha");

    if (validacao_nome) validacao_nome.style.display = "none";
    if (validacao_email) validacao_email.style.display = "none";
    if (validacao_senha) validacao_senha.style.display = "none";
    if (validacao_confSenha) validacao_confSenha.style.display = "none";

    // Validação Nome
    if (nomeVar == '') {
        if (validacao_nome) {
            validacao_nome.innerHTML = "Campo Obrigatório";
            validacao_nome.style.display = "block";
        }
        ax_erro = true;
    }

    // Validação Email
    if (emailVar == '') {
        if (validacao_email) {
            validacao_email.innerHTML = "Campo Obrigatório";
            validacao_email.style.display = "block";
        }
        ax_erro = true;
    } else if (emailVar.indexOf('@') < 0) {
        if (validacao_email) {
            validacao_email.innerHTML = "Insira um e-mail válido";
            validacao_email.style.display = "block";
        }
        ax_erro = true;
    }

    // Validação Senha
    for (let ind = 0; ind < senhaVar.length; ind++) {
        let caracAtual = senhaVar[ind];

        if (caracAtual >= '0' && caracAtual <= '9') {
            qtdNumero++;
        } else if (caracterEspecial.indexOf(caracAtual) >= 0) {
            possuiCaracEspecial = true;
        }
    }

    if (senhaVar == '') {
        if (validacao_senha) {
            validacao_senha.innerHTML = "Campo Obrigatório";
            validacao_senha.style.display = "block";
        }
        ax_erro = true;
    } else if (senhaVar.length < 8) {
        if (validacao_senha) {
            validacao_senha.innerHTML = "Mínimo 8 caracteres";
            validacao_senha.style.display = "block";
        }
        ax_erro = true;
    } else if (qtdNumero < 2) {
        if (validacao_senha) {
            validacao_senha.innerHTML = "Insira ao menos 2 números";
            validacao_senha.style.display = "block";
        }
        ax_erro = true;
    } else if (!possuiCaracEspecial) {
        if (validacao_senha) {
            validacao_senha.innerHTML = "Insira ao menos 1 caractere especial (!@#$%&*)";
            validacao_senha.style.display = "block";
        }
        ax_erro = true;
    }

    // Validação Confirmação de Senha
    if (confSenhaVar == '') {
        if (validacao_confSenha) {
            validacao_confSenha.innerHTML = "Campo Obrigatório";
            validacao_confSenha.style.display = "block";
        }
        ax_erro = true;
    } else if (senhaVar != confSenhaVar) {
        if (validacao_confSenha) {
            validacao_confSenha.innerHTML = "As senhas não coincidem";
            validacao_confSenha.style.display = "block";
        }
        ax_erro = true;
    }

    // Envio para API caso não existam erros
    if (ax_erro == false) {
        fetch("/usuarios/cadastrar", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                nomeServer: nomeVar,
                emailServer: emailVar,
                senhaServer: senhaVar,
                statusServer: statusVar,
                fkEmpresaServer: fkEmpresaVar,
                fkCargoServer: fkCargoVar
            })
        }).then(function (resposta) {
            if (resposta.ok) {
                alert("Cadastro realizado com sucesso! Faça seu login.");
                input_nome.value = "";
                input_email_cadastro.value = "";
                input_senha_cadastro.value = "";
                input_senha_confirmada.value = "";
                container.classList.remove("active");
            } else {
                alert("Houve um erro ao tentar realizar o cadastro!");
            }
        }).catch(function (erro) {
            console.log("#ERRO: ", erro);
        });
    }

    return false;
}