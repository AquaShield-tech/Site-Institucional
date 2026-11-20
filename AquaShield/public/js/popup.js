function obterContainerToast() {
    var container = document.getElementById("aqua-toast-container");
    if (!container) {
        container = document.createElement("div");
        container.id = "aqua-toast-container";
        container.className = "aqua-toast-container";
        document.body.appendChild(container);
    }
    return container;
}

function exibirToast(mensagem, tipo) {
    var categoria = tipo || "sucesso";
    var container = obterContainerToast();

    var toast = document.createElement("div");
    toast.className = `aqua-toast ${categoria}`;

    var iconeDiv = document.createElement("div");
    iconeDiv.className = "aqua-toast-icone";

    if (categoria === "erro") {
        iconeDiv.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';
    } else if (categoria === "alerta") {
        iconeDiv.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>';
    } else {
        iconeDiv.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>';
    }

    var textoSpan = document.createElement("span");
    textoSpan.className = "aqua-toast-texto";
    textoSpan.textContent = mensagem;

    var barraDiv = document.createElement("div");
    barraDiv.className = "aqua-toast-barra";

    toast.appendChild(iconeDiv);
    toast.appendChild(textoSpan);
    toast.appendChild(barraDiv);
    container.appendChild(toast);

    setTimeout(function () {
        toast.classList.add("saindo");
        setTimeout(function () {
            toast.remove();
        }, 300);
    }, 3500);
}

function agendarToast(mensagem, tipo) {
    sessionStorage.TOAST_MSG = mensagem;
    sessionStorage.TOAST_TIPO = tipo || "sucesso";
}

function confirmarAcao(titulo, mensagem, aoConfirmar, textoConfirmar) {
    var fundo = document.createElement("div");
    fundo.className = "aqua-modal-fundo";

    var caixa = document.createElement("div");
    caixa.className = "aqua-modal-caixa";

    var h3 = document.createElement("h3");
    h3.className = "aqua-modal-titulo";
    h3.textContent = titulo;

    var p = document.createElement("p");
    p.className = "aqua-modal-desc";
    p.textContent = mensagem;

    var botoes = document.createElement("div");
    botoes.className = "aqua-modal-botoes";

    var btnCancelar = document.createElement("button");
    btnCancelar.type = "button";
    btnCancelar.className = "aqua-btn-cancelar";
    btnCancelar.textContent = "Cancelar";

    var btnConfirmar = document.createElement("button");
    btnConfirmar.type = "button";
    btnConfirmar.className = "aqua-btn-confirmar";
    btnConfirmar.textContent = textoConfirmar || "Excluir";

    botoes.appendChild(btnCancelar);
    botoes.appendChild(btnConfirmar);

    caixa.appendChild(h3);
    caixa.appendChild(p);
    caixa.appendChild(botoes);
    fundo.appendChild(caixa);
    document.body.appendChild(fundo);

    void fundo.offsetWidth;
    fundo.classList.add("ativo");

    function fecharModal() {
        fundo.classList.remove("ativo");
        setTimeout(function () {
            fundo.remove();
        }, 200);
    }

    btnCancelar.onclick = fecharModal;

    fundo.onclick = function (evento) {
        if (evento.target === fundo) {
            fecharModal();
        }
    };

    btnConfirmar.onclick = function () {
        fecharModal();
        if (typeof aoConfirmar === "function") {
            aoConfirmar();
        }
    };
}

window.addEventListener("DOMContentLoaded", function () {
    if (sessionStorage.TOAST_MSG) {
        var msg = sessionStorage.TOAST_MSG;
        var tipo = sessionStorage.TOAST_TIPO || "sucesso";
        sessionStorage.removeItem("TOAST_MSG");
        sessionStorage.removeItem("TOAST_TIPO");
        exibirToast(msg, tipo);
    }
});