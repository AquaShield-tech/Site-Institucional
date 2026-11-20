const PADROES = {
    cpu: { atencao: 50, critico: 80 },
    ram: { atencao: 60, critico: 80 },
    disco: { atencao: 80, critico: 90 },
    rede: { atencao: 50, critico: 80 }
};

function carregarConfiguracoes() {
    var idEmpresa = sessionStorage.FK_EMPRESA;

    document.getElementById("cpu_atencao").value = PADROES.cpu.atencao;
    document.getElementById("cpu_critico").value = PADROES.cpu.critico;
    document.getElementById("ram_atencao").value = PADROES.ram.atencao;
    document.getElementById("ram_critico").value = PADROES.ram.critico;
    document.getElementById("disco_atencao").value = PADROES.disco.atencao;
    document.getElementById("disco_critico").value = PADROES.disco.critico;
    document.getElementById("rede_atencao").value = PADROES.rede.atencao;
    document.getElementById("rede_critico").value = PADROES.rede.critico;

    document.getElementById("auto-update").checked = sessionStorage.AUTO_UPDATE !== "false";
    document.getElementById("intervalo").value = sessionStorage.INTERVALO_ATUALIZACAO || 5;

    if (!idEmpresa) {
        return;
    }

    fetch(`/configuracao/carregar/${idEmpresa}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        }
    })
        .then(function (resposta) {
            if (resposta.ok) {
                resposta.json().then(function (atuais) {
                    for (var i = 0; i < atuais.length; i++) {
                        var item = atuais[i];
                        var valor = Number(item.limite_atencao);

                        if (valor > 0) {
                            if (item.fk_tipo == 1) document.getElementById("cpu_atencao").value = valor;
                            if (item.fk_tipo == 2) document.getElementById("ram_atencao").value = valor;
                            if (item.fk_tipo == 3) document.getElementById("disco_atencao").value = valor;
                            if (item.fk_tipo == 4) document.getElementById("rede_atencao").value = valor;
                        }
                    }
                });
            }
        })
        .catch(function (erro) {
            console.error("Erro ao carregar configurações:", erro);
        });
}

function aplicarConfiguracoes() {
    if (sessionStorage.FK_CARGO != "1") {
        exibirToast("Permissão negada! Apenas gestores podem alterar os gatilhos.", "alerta");
        return;
    }

    var idEmpresa = sessionStorage.FK_EMPRESA;
    var cpuAtencao = Number(document.getElementById("cpu_atencao").value);
    var cpuCritico = Number(document.getElementById("cpu_critico").value);
    var ramAtencao = Number(document.getElementById("ram_atencao").value);
    var ramCritico = Number(document.getElementById("ram_critico").value);
    var discoAtencao = Number(document.getElementById("disco_atencao").value);
    var discoCritico = Number(document.getElementById("disco_critico").value);
    var redeAtencao = Number(document.getElementById("rede_atencao").value);
    var redeCritico = Number(document.getElementById("rede_critico").value);

    var autoUpdate = document.getElementById("auto-update").checked;
    var intervalo = Number(document.getElementById("intervalo").value);

    if (intervalo <= 0) {
        exibirToast("O intervalo de atualização deve ser maior que 0 segundos.", "alerta");
        return;
    }

    if (
        cpuAtencao <= 0 || cpuCritico <= cpuAtencao ||
        ramAtencao <= 0 || ramCritico <= ramAtencao ||
        discoAtencao <= 0 || discoCritico <= discoAtencao ||
        redeAtencao <= 0 || redeCritico <= redeAtencao
    ) {
        exibirToast("Verifique os valores: todos devem ser > 0 e o Crítico deve ser maior que Atenção.", "alerta");
        return;
    }

    sessionStorage.AUTO_UPDATE = autoUpdate;
    sessionStorage.INTERVALO_ATUALIZACAO = intervalo;

    fetch(`/configuracao/aplicar/${idEmpresa}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            cpuAtencaoServer: cpuAtencao,
            cpuCriticoServer: cpuCritico,
            ramAtencaoServer: ramAtencao,
            ramCriticoServer: ramCritico,
            discoAtencaoServer: discoAtencao,
            discoCriticoServer: discoCritico,
            redeAtencaoServer: redeAtencao,
            redeCriticoServer: redeCritico
        })
    })
        .then(function (resposta) {
            if (resposta.ok) {
                exibirToast("Gatilhos aplicados com sucesso para todas as máquinas!", "sucesso");
                carregarConfiguracoes();
            } else {
                exibirToast("Houve um erro ao aplicar as configurações.", "erro");
            }
        })
        .catch(function (erro) {
            console.error("Erro ao aplicar configurações:", erro);
            exibirToast("Falha de comunicação com o servidor.", "erro");
        });
}

function restaurarPadroes() {
    if (sessionStorage.FK_CARGO != "1") {
        exibirToast("Permissão negada! Apenas gestores podem restaurar os padrões.", "alerta");
        return;
    }

    var idEmpresa = sessionStorage.FK_EMPRESA;

    confirmarAcao(
        "Restaurar padrões?",
        "Deseja restaurar os gatilhos padrão e excluir os limites personalizados?",
        function () {
            fetch(`/configuracao/restaurar/${idEmpresa}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json"
                }
            })
                .then(function (resposta) {
                    if (resposta.ok) {
                        exibirToast("Gatilhos padrão restaurados com sucesso!", "sucesso");
                        carregarConfiguracoes();
                    } else {
                        exibirToast("Houve um erro ao restaurar os padrões.", "erro");
                    }
                })
                .catch(function (erro) {
                    console.error("Erro ao restaurar padrões:", erro);
                    exibirToast("Falha de comunicação com o servidor.", "erro");
                });
        },
        "Restaurar"
    );
}

carregarConfiguracoes();