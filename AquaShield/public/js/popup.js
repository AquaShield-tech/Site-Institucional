var acaoAposAviso = null;

function abrirAviso(titulo, mensagem, tipo, aoFechar) {
    var popup = document.getElementById("popup_aviso");
    var icone = document.getElementById("icone_popup_aviso");

    document.getElementById("titulo_popup_aviso").innerText = titulo;
    document.getElementById("texto_popup_aviso").innerText = mensagem;

    if (tipo == "erro") {
        icone.className = "bi bi-x-circle-fill icone-erro";
    } else {
        icone.className = "bi bi-check-circle-fill icone-sucesso";
    }

    acaoAposAviso = aoFechar || null;
    popup.style.display = "flex";
}

function fecharAviso() {
    document.getElementById("popup_aviso").style.display = "none";

    if (acaoAposAviso) {
        var executar = acaoAposAviso;
        acaoAposAviso = null;
        executar();
    }
}

function abrirConfirmacao(titulo, mensagem, acaoConfirmar) {
    var popup = document.getElementById("popup_confirmacao");

    document.getElementById("titulo_popup_confirmacao").innerText = titulo;
    document.getElementById("texto_popup_confirmacao").innerText = mensagem;

    document.getElementById("btn_sim_confirmacao").onclick = function () {
        fecharConfirmacao();
        if (acaoConfirmar) {
            acaoConfirmar();
        }
    };

    popup.style.display = "flex";
}

function fecharConfirmacao() {
    document.getElementById("popup_confirmacao").style.display = "none";
}