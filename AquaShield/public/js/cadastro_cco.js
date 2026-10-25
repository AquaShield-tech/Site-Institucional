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

function cadastrarCco() {
    var nomeVar = input_nome.value.trim();
    var paisVar = input_pais.value.trim();
    var cepVar = input_cep.value.trim();
    var ufVar = input_uf.value.trim();
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
                alert("CCO cadastrado com sucesso!");
                window.location.reload();
            } else {
                alert("Houve um erro ao cadastrar o CCO.");
            }
        }).catch(function (erro) {
            console.log("#ERRO: ", erro);
        });
    }
}