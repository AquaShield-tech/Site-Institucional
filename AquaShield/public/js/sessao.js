// sessão
function validarSessao() {
    var fkCargo = sessionStorage.FK_CARGO;
    var nomeUsuario = sessionStorage.NOME_USUARIO;

    if (!fkCargo) {
        agendarToast("Sessão expirada ou acesso negado! Faça login.", "alerta");
        window.location.replace("login.html");
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
        } else if (fkCargo == "3") {
            elementCargo.innerHTML = "Operador";
        }
    }
}

function limparSessao() {
    sessionStorage.clear();
    agendarToast("Sessão encerrada.", "sucesso");
    window.location = "../login.html";
}

function deslogar() {
    sessionStorage.clear();
    agendarToast("Sessão encerrada com sucesso.", "sucesso");
    window.location = "index.html";
}

// carregamento (loading)
function aguardar() {
    var divAguardar = document.getElementById("div_aguardar");
    if (divAguardar) divAguardar.style.display = "flex";
}

function finalizarAguardar(texto) {
    var divAguardar = document.getElementById("div_aguardar");
    if (divAguardar) divAguardar.style.display = "none";

    var divErrosLogin = document.getElementById("div_erros_login");
    if (divErrosLogin && texto) {
        divErrosLogin.style.display = "flex";
        divErrosLogin.innerHTML = texto;
    }
}