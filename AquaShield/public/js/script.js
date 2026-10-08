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

        var emailVar = input_email_login.value;
        var senhaVar = input_senha_login.value;

        if (emailVar == "" || senhaVar == "") {
            cardErro.style.display = "block"
            mensagem_erro.innerHTML = "(Mensagem de erro para todos os campos em branco)";
            finalizarAguardar();
            return false;
        }
        else {
            setInterval(sumirMensagem, 5000)
        }

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
            console.log("ESTOU NO THEN DO entrar()!")

            if (resposta.ok) {
                console.log(resposta);

                resposta.json().then(json => {
                    console.log(json);
                    console.log(JSON.stringify(json));
                    sessionStorage.EMAIL_USUARIO = json.email;
                    sessionStorage.NOME_USUARIO = json.nome;
                    sessionStorage.ID_USUARIO = json.id;
                    sessionStorage.AQUARIOS = JSON.stringify(json.aquarios)

                    setTimeout(function () {
                        window.location = "./dashboard/cards.html";
                    }, 1000); // apenas para exibir o loading

                });

            } else {

                console.log("Houve um erro ao tentar realizar o login!");

                resposta.text().then(texto => {
                    console.error(texto);
                    finalizarAguardar(texto);
                });
            }

        }).catch(function (erro) {
            console.log(erro);
        })

        return false;
    }

    function sumirMensagem() {
        cardErro.style.display = "none"
    }

    // Array para armazenar empresas cadastradas para validação de código de ativação 
  let listaEmpresasCadastradas = [];

  function cadastrar() {
    // 1. Captura os valores digitados nos inputs
    var nomeVar = input_nome.value;
    var emailVar = input_email_cadastro.value;
    var senhaVar = input_senha_cadastro.value;

    // 2. Valores fixos exigidos pela tabela Usuario
    var statusVar = "Ativo";
    var fkEmpresaVar = 1; // ID da empresa já cadastrada na tabela Empresa
    var fkCargoVar = 1;   // ID do cargo padrão (ex: Administrador / Operador)

    // 3. Validação de campos vazios
    if (nomeVar == "" || emailVar == "" || senhaVar == "") {
        alert("Preencha todos os campos para se cadastrar!");
        return false;
    }

    // 4. Envio para a API do web-data-viz
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
            
            // Limpa os campos e desliza a tela de volta para a aba de Login
            input_nome.value = "";
            input_email_cadastro.value = "";
            input_senha_cadastro.value = "";
            container.classList.remove("active");
        } else {
            alert("Houve um erro ao tentar realizar o cadastro!");
        }
    }).catch(function (erro) {
        console.log("#ERRO: ", erro);
    });

    return false;
  }

  // Listando empresas cadastradas 
  function listar() {
    fetch("/empresas/listar", {
      method: "GET",
    })
      .then(function (resposta) {
        resposta.json().then((empresas) => {
          empresas.forEach((empresa) => {
            listaEmpresasCadastradas.push(empresa);

            console.log("listaEmpresasCadastradas")
            console.log(listaEmpresasCadastradas[0].codigo_ativacao)
          });
        });
      })
      .catch(function (resposta) {
        console.log(`#ERRO: ${resposta}`);
      });
  }

  function sumirMensagem() {
    cardErro.style.display = "none";
  }