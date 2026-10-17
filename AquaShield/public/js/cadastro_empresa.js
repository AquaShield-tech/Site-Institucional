function avancarEtapa2() {
    var razaoVar = input_razao_social.value.trim();
    var fantasiaVar = input_nome_fantasia.value.trim();
    var cnpjVar = input_cnpj.value.trim();

    var ax_erro = false;

    // Reseta as mensagens da etapa 1
    validacao_razao.style.display = "none";
    validacao_fantasia.style.display = "none";
    validacao_cnpj.style.display = "none";

    // Validação da Razão Social
    if (razaoVar == "") {
        validacao_razao.innerHTML = "Campo Obrigatório";
        validacao_razao.style.display = "block";
        ax_erro = true;
    }

    // Validação do Nome Fantasia
    if (fantasiaVar == "") {
        validacao_fantasia.innerHTML = "Campo Obrigatório";
        validacao_fantasia.style.display = "block";
        ax_erro = true;
    }

    // Validação do CNPJ
    if (cnpjVar == "") {
        validacao_cnpj.innerHTML = "Campo Obrigatório";
        validacao_cnpj.style.display = "block";
        ax_erro = true;
    } else if (cnpjVar.length != 14) {
        validacao_cnpj.innerHTML = "Insira um CNPJ válido com 14 dígitos";
        validacao_cnpj.style.display = "block";
        ax_erro = true;
    }

    // Só avança se não houver erros
    if (ax_erro == false) {
        etapa_empresa.style.display = "none";
        etapa_cco.style.display = "flex";

        circulo_etapa_2.style.backgroundColor = "#1f99ac";
        circulo_etapa_2.style.color = "#fff";
        texto_etapa_2.style.color = "#1f99ac";
    }
}

function voltarEtapa1() {
    etapa_cco.style.display = "none";
    etapa_empresa.style.display = "flex";

    circulo_etapa_2.style.backgroundColor = "#ddd";
    circulo_etapa_2.style.color = "#666";
    texto_etapa_2.style.color = "#888";
}

function avancarEtapa3() {
    var ccoVar = input_nome_cco.value.trim();
    var cepVar = input_cep_cco.value.trim();
    var ufVar = input_uf_cco.value.trim();

    var ax_erro = false;

    // Reseta as mensagens da etapa 2
    validacao_cco.style.display = "none";
    validacao_cep.style.display = "none";
    validacao_uf.style.display = "none";

    if (ccoVar == "") {
        validacao_cco.innerHTML = "Campo Obrigatório";
        validacao_cco.style.display = "block";
        ax_erro = true;
    }

    if (cepVar == "") {
        validacao_cep.innerHTML = "Campo Obrigatório";
        validacao_cep.style.display = "block";
        ax_erro = true;
    } else if (cepVar.length != 8) {
        validacao_cep.innerHTML = "Insira um CEP válido com 8 dígitos";
        validacao_cep.style.display = "block";
        ax_erro = true;
    }

    if (ufVar == "") {
        validacao_uf.innerHTML = "Campo Obrigatório";
        validacao_uf.style.display = "block";
        ax_erro = true;
    }

    if (ax_erro == false) {
        etapa_cco.style.display = "none";
        etapa_gestor.style.display = "flex";

        circulo_etapa_3.style.backgroundColor = "#1f99ac";
        circulo_etapa_3.style.color = "#fff";
        texto_etapa_3.style.color = "#1f99ac";
    }
}

function voltarEtapa2() {
    etapa_gestor.style.display = "none";
    etapa_cco.style.display = "flex";

    circulo_etapa_3.style.backgroundColor = "#ddd";
    circulo_etapa_3.style.color = "#666";
    texto_etapa_3.style.color = "#888";
}

function cadastrarEmpresa() {
    var nomeGestorVar = input_nome_gestor.value.trim();
    var emailGestorVar = input_email_gestor.value.trim();
    var senhaGestorVar = input_senha_gestor.value.trim();

    var ax_erro = false;

    let qtdNumero = 0;
    let caracterEspecial = '!@#$%&*';
    let possuiCaracEspecial = false;

    // Reseta mensagens da etapa 3
    validacao_nome_gestor.style.display = "none";
    validacao_email_gestor.style.display = "none";
    validacao_senha_gestor.style.display = "none";

    // Validação nome Gestor
    if (nomeGestorVar == "") {
        validacao_nome_gestor.innerHTML = "Campo Obrigatório";
        validacao_nome_gestor.style.display = "block";
        ax_erro = true;
    }

    // Validação email Gestor
    if (emailGestorVar == "") {
        validacao_email_gestor.innerHTML = "Campo Obrigatório";
        validacao_email_gestor.style.display = "block";
        ax_erro = true;
    } else if (emailGestorVar.indexOf('@') < 0) {
        validacao_email_gestor.innerHTML = "Insira um e-mail válido";
        validacao_email_gestor.style.display = "block";
        ax_erro = true;
    }

    // Contagem de números e caracteres especiais na senha
    for (let ind = 0; ind < senhaGestorVar.length; ind++) {
        let caracAtual = senhaGestorVar[ind];

        if (caracAtual >= '0' && caracAtual <= '9') {
            qtdNumero++;
        } else if (caracterEspecial.indexOf(caracAtual) >= 0) {
            possuiCaracEspecial = true;
        }
    }

    // Validação da Senha
    if (senhaGestorVar == "") {
        validacao_senha_gestor.innerHTML = "Campo Obrigatório";
        validacao_senha_gestor.style.display = "block";
        ax_erro = true;
    } else if (senhaGestorVar.length < 8) {
        validacao_senha_gestor.innerHTML = "Senha muito curta! Mínimo 8 caracteres";
        validacao_senha_gestor.style.display = "block";
        ax_erro = true;
    } else if (qtdNumero < 2) {
        validacao_senha_gestor.innerHTML = "Senha fraca! Insira ao menos 2 números";
        validacao_senha_gestor.style.display = "block";
        ax_erro = true;
    } else if (!possuiCaracEspecial) {
        validacao_senha_gestor.innerHTML = "Senha fraca! Insira ao menos 1 caractere especial (!@#$%&*)";
        validacao_senha_gestor.style.display = "block";
        ax_erro = true;
    }

    
    if (ax_erro == false) {
    fetch("/empresas/cadastrar", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            razaoSocialServer: input_razao_social.value.trim(),
            nomeFantasiaServer: input_nome_fantasia.value.trim(),
            cnpjServer: input_cnpj.value.trim(),
            nomeCcoServer: input_nome_cco.value.trim(),
            cepCcoServer: input_cep_cco.value.trim(),
            ufCcoServer: input_uf_cco.value.trim(),
            paisCcoServer: input_pais_cco.value.trim(),
            nomeGestorServer: nomeGestorVar,
            emailGestorServer: emailGestorVar,
            senhaGestorServer: senhaGestorVar,
            fkCargoServer: 1
        })
    }).then(function (resposta) {
        if (resposta.ok) {
            alert("Empresa, CCO e Gestor cadastrados com sucesso!");
            setTimeout(function () {
                window.location = "login.html";
            }, 1000);
        } else {
            alert("Houve um erro ao realizar o cadastro!");
        }
    }).catch(function (erro) {
        console.log("#ERRO: ", erro);
    });
}
}