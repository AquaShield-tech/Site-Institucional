function listarHistorico() {
    var idEmpresa = sessionStorage.FK_EMPRESA;
    var corpoTabela = document.getElementById("corpo_historico");
    var msgVazio = document.getElementById("msg_historico_vazio");
    var molde = document.getElementById("molde_historico");

    if (!idEmpresa || !corpoTabela) return;

    fetch(`/historico/listar/${idEmpresa}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        }
    })
        .then(function (resposta) {
            if (resposta.ok) {
                resposta.json().then(function (lista) {
                    corpoTabela.innerHTML = "";
                    msgVazio.style.display = lista.length == 0 ? "block" : "none";

                    for (var i = 0; i < lista.length; i++) {
                        var item = lista[i];
                        var linha = molde.content.cloneNode(true);

                        linha.querySelector(".hist-maquina").innerText = item.maquina;
                        linha.querySelector(".hist-data").innerText = item.data_hora;
                        linha.querySelector(".hist-acao").innerText = item.acao;
                        linha.querySelector(".hist-descricao").innerText = item.descricao;
                        linha.querySelector(".hist-componente").innerText = item.componente;
                        linha.querySelector(".hist-responsavel").innerText = item.responsavel;

                        corpoTabela.appendChild(linha);
                    }
                });
            } else {
                console.error("Erro ao carregar histórico.");
            }
        })
        .catch(function (erro) {
            console.error("#ERRO: ", erro);
        });
}