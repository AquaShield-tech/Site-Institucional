// sessão
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

function limparSessao() {
    sessionStorage.clear();
    window.location = "../login.html";
}

function deslogar() {
    sessionStorage.clear();
    alert("Sessão encerrada com sucesso.");
    window.location = "index.html";
}

// carregamento (loading)
function aguardar() {
    var divAguardar = document.getElementById("div_aguardar");
    divAguardar.style.display = "flex";
}

function finalizarAguardar(texto) {
    var divAguardar = document.getElementById("div_aguardar");
    divAguardar.style.display = "none";

    var divErrosLogin = document.getElementById("div_erros_login");
    if (texto) {
        divErrosLogin.style.display = "flex";
        divErrosLogin.innerHTML = texto;
    }
}

