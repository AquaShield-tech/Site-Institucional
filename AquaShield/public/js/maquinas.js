// CONTROLE DOS MODAIS (Abrir e Fechar)

// Abrir o modal de cadastro
const botoesAbrir = document.querySelectorAll("[data-abrir]");
botoesAbrir.forEach(function (botao) {
    botao.addEventListener("click", function () {
        if (!validarSessaoMaquina()) {
            return; // não é gestor, não abre o modal
        }

        const idModal = botao.getAttribute("data-abrir");
        const modal = document.getElementById(idModal);
        if (modal) modal.showModal();
    });
});

// Seleciona todos os botões Cancelar para fechar modais
const botoesCancelar = document.querySelectorAll(".btn_secundario");
botoesCancelar.forEach(function (botao) {
    botao.addEventListener("click", function () {
        const modal = botao.closest("dialog");
        if (modal) modal.close();
    });
});

function cadastrar(event) {
    var hostnameVar = cad_hostname.value.trim();
    var macAddressVar = cad_macaddress.value.trim();
    var soVar = cad_so.value.trim();
    var verSOVar = cad_verSO.value.trim();
    var cpuTotalVar = cpu_total.value;
    var memoriaTotalVar = memoria_total.value;
    var discoTotalVar = disco_total.value;
    var redeVar = cad_rede.value;

    let ax_erro = false;

    var validacao_hostname = document.getElementById("validacao_cad_hostname");
    var validacao_macaddress = document.getElementById("validacao_cad_macaddress");
    var validacao_so = document.getElementById("validacao_cad_so");
    var validacao_verSO = document.getElementById("validacao_cad_verSO");
    var validacao_cpu = document.getElementById("validacao_cpu_total");
    var validacao_memoria = document.getElementById("validacao_memoria_total");
    var validacao_disco = document.getElementById("validacao_disco_total");
    var validacao_rede = document.getElementById("validacao_cad_rede");

    if (validacao_hostname) validacao_hostname.style.display = "none";
    if (validacao_macaddress) validacao_macaddress.style.display = "none";
    if (validacao_so) validacao_so.style.display = "none";
    if (validacao_verSO) validacao_verSO.style.display = "none";
    if (validacao_cpu) validacao_cpu.style.display = "none";
    if (validacao_memoria) validacao_memoria.style.display = "none";
    if (validacao_disco) validacao_disco.style.display = "none";
    if (validacao_rede) validacao_rede.style.display = "none";

    if (hostnameVar == '') {
        if (validacao_hostname) {
            validacao_hostname.innerHTML = "Campo Obrigatório";
            validacao_hostname.style.display = "block";
        }
        ax_erro = true;
    }

    var macValido = macAddressVar.length == 17 && macAddressVar.split(":").length == 6;
    if (macAddressVar == '') {
        if (validacao_macaddress) {
            validacao_macaddress.innerHTML = "Campo Obrigatório";
            validacao_macaddress.style.display = "block";
        }
        ax_erro = true;
    } else if (!macValido) {
        if (validacao_macaddress) {
            validacao_macaddress.innerHTML = "Formato inválido (Ex: AA:BB:CC:DD:EE:FF)";
            validacao_macaddress.style.display = "block";
        }
        ax_erro = true;
    }

    if (soVar == '') {
        if (validacao_so) {
            validacao_so.innerHTML = "Campo Obrigatório";
            validacao_so.style.display = "block";
        }
        ax_erro = true;
    }

    if (verSOVar == '') {
        if (validacao_verSO) {
            validacao_verSO.innerHTML = "Campo Obrigatório";
            validacao_verSO.style.display = "block";
        }
        ax_erro = true;
    }

    if (cpuTotalVar == '' || Number(cpuTotalVar) <= 0) {
        if (validacao_cpu) {
            validacao_cpu.innerHTML = "Informe um valor válido (> 0)";
            validacao_cpu.style.display = "block";
        }
        ax_erro = true;
    }

    if (memoriaTotalVar == '' || Number(memoriaTotalVar) <= 0) {
        if (validacao_memoria) {
            validacao_memoria.innerHTML = "Informe um valor válido (> 0)";
            validacao_memoria.style.display = "block";
        }
        ax_erro = true;
    }

    if (discoTotalVar == '' || Number(discoTotalVar) <= 0) {
        if (validacao_disco) {
            validacao_disco.innerHTML = "Informe um valor válido (> 0)";
            validacao_disco.style.display = "block";
        }
        ax_erro = true;
    }

    if (redeVar == '' || Number(redeVar) <= 0) {
        if (validacao_rede) {
            validacao_rede.innerHTML = "Informe uma velocidade válida (> 0)";
            validacao_rede.style.display = "block";
        }
        ax_erro = true;
    }

    if (ax_erro == false) {
        fetch("/maquina/cadastrar", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                hostnameServer: hostnameVar,
                macAddressServer: macAddressVar,
                soServer: soVar,
                verSOServer: verSOVar,
                cpuTotalServer: Number(cpuTotalVar),
                memoriaTotalServer: Number(memoriaTotalVar),
                discoTotalServer: Number(discoTotalVar),
                redeServer: Number(redeVar),
                fkEtaServer: 1
            })
        }).then(function (resposta) {
            if (resposta.ok) {
                alert("Máquina cadastrada com sucesso!");

                // Limpa os campos após o cadastro
                cad_hostname.value = "";
                cad_macaddress.value = "";
                cad_so.value = "";
                cad_verSO.value = "";
                cpu_total.value = "";
                memoria_total.value = "";
                disco_total.value = "";
                cad_rede.value = "";

                // Fecha o modal e atualiza os cards e a tabela
                document.getElementById("modal-cadastrar").close();
                atualizarKpisMaquinas();
                listarMaquinas();
            } else {
                alert("Houve um erro ao tentar cadastrar a máquina!");
            }
        }).catch(function (erro) {
            console.log("#ERRO: ", erro);
        });
    }

    return false;
}

function deslogar() {
    sessionStorage.clear();
    alert("Sessão encerrada com sucesso.");
    window.location = "index.html";
}

function validarSessao() {
    var fkCargo = sessionStorage.FK_CARGO;
    var nomeUsuario = sessionStorage.NOME_USUARIO;

    if (!fkCargo) {
        alert("Permissão negada! Apenas gestores podem cadastrar uma maquina.");
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
        } else if (fkCargo == "3") {
            elementCargo.innerHTML = "Operador";
        }
    }
}

function validarSessaoMaquina() {
    var fkCargo = sessionStorage.FK_CARGO;

    if (fkCargo != "1") {
        alert("Permissão negada! Apenas gestores podem cadastrar uma máquina.");
        return false;
    }

    return true;
}

function atualizarKpisMaquinas() {
    var idEmpresa = sessionStorage.FK_EMPRESA;

    if (!idEmpresa) {
        console.warn("FK_EMPRESA não encontrada no sessionStorage.");
        return;
    }

    fetch(`/maquina/kpis/${idEmpresa}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        }
    })
        .then(function (resposta) {
            if (resposta.ok) {
                if (resposta.status == 204) {
                    return;
                }

                resposta.json().then(function (dados) {
                    var total = Number(dados.total_maquinas) || 0;
                    var ativas = Number(dados.maquinas_ativas) || 0;
                    var inativas = total - ativas;
                    var picoCpu = Number(dados.pico_cpu) || 0;
                    var picoRam = Number(dados.pico_ram) || 0;

                    var porcentagem = total > 0 ? Math.round((ativas / total) * 100) : 0;

                    document.getElementById("kpi_ativas").textContent = ativas;
                    document.getElementById("kpi_total").textContent = `/ ${total}`;
                    document.getElementById("kpi_porcentagem").textContent = `${porcentagem}% da infraestrutura ativa`;
                    document.getElementById("kpi_inativas").textContent = `${inativas} inativas`;
                    document.getElementById("barra_ativas").style.width = `${porcentagem}%`;

                    document.getElementById("kpi_pico_cpu").textContent = picoCpu;
                    document.getElementById("kpi_pico_ram").textContent = picoRam;
                });
            } else {
                console.error("Erro na resposta da API de KPIs de máquinas:", resposta.status);
            }
        })
        .catch(function (erro) {
            console.error("Erro ao buscar KPIs de máquinas:", erro);
        });
}

function verDashboard(idMaquina, hostname) {
    sessionStorage.ID_MAQUINA = idMaquina;
    sessionStorage.HOSTNAME_MAQUINA = hostname;
    window.location = "dashboard.html";
}

function abrirModalEditar(idMaquina, hostname) {
    var modalEditar = document.getElementById("modal-editar");
    var inputNome = document.getElementById("cad_nome_edit");
    if (inputNome) inputNome.value = hostname;
    if (modalEditar) modalEditar.showModal();
}

function abrirModalExcluir(idMaquina, hostname) {
    var modalExcluir = document.getElementById("modal-excluir");
    var spanNome = document.getElementById("excluir-nome");
    if (spanNome) spanNome.textContent = hostname;
    if (modalExcluir) modalExcluir.showModal();
}

function listarMaquinas() {
    var idEmpresa = sessionStorage.FK_EMPRESA;

    if (!idEmpresa) {
        return;
    }

    fetch(`/maquina/listar/${idEmpresa}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        }
    })
        .then(function (resposta) {
            if (resposta.ok) {
                resposta.json().then(function (lista) {
                    var tbody = document.getElementById("tbody_maquinas");
                    if (!tbody) return;

                    if (lista.length === 0) {
                        tbody.innerHTML = `
                            <tr>
                                <td colspan="7" style="text-align: center; color: #6f8392;">
                                    Nenhuma máquina cadastrada.
                                </td>
                            </tr>
                        `;
                        return;
                    }

                    var html = "";

                    for (var i = 0; i < lista.length; i++) {
                        var m = lista[i];
                        var cpu = Number(m.uso_cpu) || 0;
                        var ram = Number(m.uso_ram) || 0;
                        var limiteCpu = Number(m.limite_cpu) || 75;
                        var limiteRam = Number(m.limite_ram) || 75;
                        var ultimaLeitura = m.ultima_leitura || "Sem leituras";
                        var inativa = Number(m.is_inativa) > 0;

                        // Define a classe da linha e o texto do badge (mantendo os filtros CSS)
                        var classeStatus = "normal";
                        var textoStatus = "Normal";

                        if (inativa) {
                            classeStatus = "critica";
                            textoStatus = "Inativa";
                        } else if (cpu >= 90 || ram >= 90) {
                            classeStatus = "critica";
                            textoStatus = "Crítica";
                        } else if (cpu >= limiteCpu || ram >= limiteRam) {
                            classeStatus = "alerta";
                            textoStatus = "Em alerta";
                        }

                        html += `
                            <tr class="${classeStatus}">
                                <td><strong>${m.hostname}</strong></td>
                                <td><span class="status ${classeStatus}">${textoStatus}</span></td>
                                <td>${cpu}%</td>
                                <td>${ram}%</td>
                                <td>${ultimaLeitura}</td>
                                <td>
                                    <div class="action_icons">
                                        <button class="icon_btn" title="Editar" onclick="abrirModalEditar(${m.id}, '${m.hostname}')">
                                            <i class="bi bi-pencil-square"></i>
                                        </button>
                                        <button class="icon_btn" title="Excluir" onclick="abrirModalExcluir(${m.id}, '${m.hostname}')">
                                            <i class="bi bi-trash3"></i>
                                        </button>
                                    </div>
                                </td>
                                <td>
                                    <a class="ver_dashboard" href="#" onclick="verDashboard(${m.id}, '${m.hostname}'); return false;">
                                        Ver dashboard
                                    </a>
                                </td>
                            </tr>
                        `;
                    }

                    tbody.innerHTML = html;
                });
            } else {
                console.error("Erro ao listar máquinas:", resposta.status);
            }
        })
        .catch(function (erro) {
            console.error("Erro na requisição de máquinas:", erro);
        });
}

atualizarKpisMaquinas();
listarMaquinas();