function carregarUsuario() {
    const fkCargo = sessionStorage.FK_CARGO;
    const nomeUsuario = sessionStorage.NOME_USUARIO;

    if (!fkCargo || !nomeUsuario) {
        window.location.replace("index.html");
        return;
    }

    const elUsuario = document.getElementById("b_usuario");
    const elCargo = document.getElementById("b_cargo");

    if (elUsuario) elUsuario.textContent = nomeUsuario;

    if (elCargo) {
        const cargos = { "1": "Gestor", "2": "Analista", "3": "Operador" };
        elCargo.textContent = cargos[fkCargo] || "Operador";
    }
}

function deslogar() {
    sessionStorage.clear();
    agendarToast("Sessão encerrada com sucesso.", "sucesso");
    window.location = "index.html";
}

carregarUsuario();

/* ---------- REGRESSÃO LINEAR PARA RETA DE TENDÊNCIA ---------- */
function calcularRegressaoLinear(pontos) {
    const n = pontos.length;
    if (n < 2) return { m: 0, b: 0 };

    let somaX = 0, somaY = 0, somaXY = 0, somaX2 = 0;

    for (let i = 0; i < n; i++) {
        somaX += pontos[i].x;
        somaY += pontos[i].y;
        somaXY += pontos[i].x * pontos[i].y;
        somaX2 += pontos[i].x * pontos[i].x;
    }

    const denominador = (n * somaX2) - (somaX * somaX);
    const m = denominador !== 0 ? ((n * somaXY) - (somaX * somaY)) / denominador : 0;
    const b = (somaY - m * somaX) / n;
    return { m, b };
}

let dadosDispersaoAtual = {
    vazao: [],
    pacote: []
};
let eixoDispersaoAtual = "vazao";

const TOOLTIP_MODERNO = {
    backgroundColor: "#0f2537",
    titleColor: "#94a3b8",
    bodyColor: "#ffffff",
    titleFont: { family: "Inter", size: 11, weight: "500" },
    bodyFont: { family: "Inter", size: 12, weight: "600" },
    padding: 11,
    cornerRadius: 10,
    usePointStyle: true
};

/* ---------- GRÁFICO 1: TRÁFEGO DE REDE (ENTRADA E SAÍDA) ---------- */
let graficoTrafego = null;
let janelaTrafegoAtual = "1h";

function iniciarGraficoTrafego() {
    const canvas = document.getElementById("grafico_trafego_rede");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const degradeEntrada = ctx.createLinearGradient(0, 0, 0, 230);
    degradeEntrada.addColorStop(0, "rgba(13, 132, 178, 0.22)");
    degradeEntrada.addColorStop(1, "rgba(13, 132, 178, 0.0)");

    const degradeSaida = ctx.createLinearGradient(0, 0, 0, 230);
    degradeSaida.addColorStop(0, "rgba(16, 185, 129, 0.16)");
    degradeSaida.addColorStop(1, "rgba(16, 185, 129, 0.0)");

    graficoTrafego = new Chart(canvas, {
        type: "line",
        data: {
            labels: [],
            datasets: [
                {
                    label: "Entrada",
                    data: [],
                    borderColor: "#0d84b2",
                    backgroundColor: degradeEntrada,
                    borderWidth: 2.5,
                    pointRadius: 2,
                    pointHoverRadius: 5,
                    pointHoverBackgroundColor: "#0d84b2",
                    tension: 0.38,
                    fill: true
                },
                {
                    label: "Saída",
                    data: [],
                    borderColor: "#10b981",
                    backgroundColor: degradeSaida,
                    borderWidth: 2,
                    pointRadius: 2,
                    pointHoverRadius: 5,
                    pointHoverBackgroundColor: "#10b981",
                    tension: 0.38,
                    fill: true
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: { mode: "index", intersect: false },
            plugins: {
                legend: { display: false },
                tooltip: {
                    ...TOOLTIP_MODERNO,
                    callbacks: {
                        label: (item) => ` ${item.dataset.label}: ${formatarNumeroBR(item.parsed.y, 2)} Mbps`
                    }
                }
            },
            scales: {
                x: {
                    grid: { display: false },
                    border: { display: false },
                    ticks: {
                        color: "#94a3b8",
                        font: { family: "Inter", size: 11 },
                        maxRotation: 0,
                        autoSkipPadding: 14
                    }
                },
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: "#94a3b8",
                        font: { family: "Inter", size: 11 }
                    },
                    grid: { color: "#f1f5f9" },
                    border: { display: false }
                }
            }
        }
    });

    document.querySelectorAll(".btn-periodo").forEach((btn) => {
        btn.addEventListener("click", () => {
            document.querySelectorAll(".btn-periodo").forEach((b) => b.classList.remove("ativo"));
            btn.classList.add("ativo");

            janelaTrafegoAtual = btn.dataset.janela || "1h";
            if (idMaquinaAtual) {
                carregarTrafegoRede(idMaquinaAtual, janelaTrafegoAtual);
            }
        });
    });
}

function carregarTrafegoRede(idMaquina, janela = "1h") {
    fetch(`/rede/trafego/${idMaquina}/${janela}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" }
    })
        .then(function (resposta) {
            if (!resposta.ok) {
                console.error("Erro ao buscar tráfego de rede:", resposta.status);
                return;
            }

            resposta.json().then(function (dados) {
                if (!graficoTrafego) return;

                graficoTrafego.data.labels = dados.labels;
                graficoTrafego.data.datasets[0].data = dados.entrada;
                graficoTrafego.data.datasets[1].data = dados.saida;
                graficoTrafego.update();

                const elPico = document.getElementById("pico_entrada_valor");
                if (elPico) {
                    elPico.textContent = `${formatarNumeroBR(dados.picoEntradaMbps, 2)} Mbps`;
                }
            });
        })
        .catch(function (erro) {
            console.error("Falha ao carregar tráfego de rede:", erro);
        });
}

/* ---------- GRÁFICO 2: INTEGRIDADE DO LINK (DONUT SCORE) ---------- */
let graficoIntegridade = null;

function iniciarGraficoIntegridade(score = 98) {
    const canvas = document.getElementById("grafico_integridade_link");
    if (!canvas) return;
    if (graficoIntegridade) { graficoIntegridade.destroy(); }

    const textoCentralDonut = {
        id: "textoCentralDonut",
        afterDraw(chart) {
            const { ctx, chartArea } = chart;
            if (!chartArea) return;

            const x = (chartArea.left + chartArea.right) / 2;
            const y = (chartArea.top + chartArea.bottom) / 2;

            ctx.save();
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillStyle = "#0f2537";
            ctx.font = "700 24px Inter";
            ctx.fillText(String(score), x, y - 6);

            ctx.fillStyle = "#94a3b8";
            ctx.font = "500 11px Inter";
            ctx.fillText("de 100", x, y + 13);
            ctx.restore();
        }
    };

    graficoIntegridade = new Chart(canvas, {
        type: "doughnut",
        data: {
            datasets: [{
                data: [score, 100 - score],
                backgroundColor: ["#10b981", "#e2e8f0"],
                borderWidth: 0,
                borderRadius: 20
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: "78%",
            plugins: {
                legend: { display: false },
                tooltip: { enabled: false }
            }
        },
        plugins: [textoCentralDonut]
    });
}

/* ---------- GRÁFICO 3: DISPERSÃO LATÊNCIA VS CARGA (OPÇÃO B) ---------- */
let graficoDispersao = null;

function montarDadosDispersao(tipoEixo) {
    const base = tipoEixo === "pacote" ? dadosDispersaoAtual.pacote : dadosDispersaoAtual.vazao;
    const tituloX = tipoEixo === "pacote" ? "Tamanho do pacote (KB)" : "Vazão simultânea (Mbps)";
    const unidadeX = tipoEixo === "pacote" ? "KB" : "Mbps";

    if (base.length < 2) {
        return {
            pontos: base,
            retaTendencia: [],
            tituloX,
            unidadeX
        };
    }

    const reg = calcularRegressaoLinear(base);
    const xs = base.map((p) => p.x);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);

    const retaTendencia = minX === maxX ? [] : [
        { x: minX, y: Math.max(0, Number((reg.m * minX + reg.b).toFixed(2))) },
        { x: maxX, y: Math.max(0, Number((reg.m * maxX + reg.b).toFixed(2))) }
    ];

    return {
        pontos: base,
        retaTendencia,
        tituloX,
        unidadeX
    };
}

function atualizarVisualDispersao() {
    if (!graficoDispersao) return;

    const novo = montarDadosDispersao(eixoDispersaoAtual);
    graficoDispersao.data.datasets[0].data = novo.pontos;
    graficoDispersao.data.datasets[1].data = novo.retaTendencia;
    graficoDispersao.options.scales.x.title.text = novo.tituloX;
    graficoDispersao._unidadeX = novo.unidadeX;
    graficoDispersao.update();
}

function iniciarGraficoDispersao() {
    const canvas = document.getElementById("grafico_dispersao_latencia");
    if (!canvas) return;

    const inicial = montarDadosDispersao("vazao");

    graficoDispersao = new Chart(canvas, {
        type: "scatter",
        data: {
            datasets: [
                {
                    label: "Leituras registradas",
                    data: inicial.pontos,
                    backgroundColor: "rgba(13, 132, 178, 0.72)",
                    borderColor: "#0d84b2",
                    borderWidth: 1.5,
                    pointRadius: 4.5,
                    pointHoverRadius: 6.5
                },
                {
                    type: "line",
                    label: "Reta de tendência",
                    data: inicial.retaTendencia,
                    borderColor: "#f59e0b",
                    borderDash: [6, 4],
                    borderWidth: 2,
                    pointRadius: 0,
                    pointHoverRadius: 0,
                    fill: false
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: "top",
                    align: "start",
                    labels: {
                        usePointStyle: true,
                        boxWidth: 7,
                        padding: 14,
                        color: "#64748b",
                        font: { family: "Inter", size: 11.5, weight: "500" }
                    }
                },
                tooltip: {
                    ...TOOLTIP_MODERNO,
                    callbacks: {
                        label: (item) => {
                            const unidade = graficoDispersao._unidadeX || "Mbps";
                            return ` Carga: ${formatarNumeroBR(item.parsed.x, 2)} ${unidade}  •  Latência: ${formatarNumeroBR(item.parsed.y, 2)} ms`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    type: "linear",
                    position: "bottom",
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: inicial.tituloX,
                        color: "#64748b",
                        font: { family: "Inter", size: 11.5, weight: "500" }
                    },
                    grid: { color: "#f8fafc" },
                    border: { display: false },
                    ticks: { color: "#94a3b8", font: { family: "Inter", size: 11 } }
                },
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: "Latência medida (ms)",
                        color: "#64748b",
                        font: { family: "Inter", size: 11.5, weight: "500" }
                    },
                    grid: { color: "#f1f5f9" },
                    border: { display: false },
                    ticks: { color: "#94a3b8", font: { family: "Inter", size: 11 } }
                }
            }
        }
    });

    graficoDispersao._unidadeX = inicial.unidadeX;

    document.querySelectorAll(".btn-eixo").forEach((btn) => {
        btn.addEventListener("click", () => {
            document.querySelectorAll(".btn-eixo").forEach((b) => b.classList.remove("ativo"));
            btn.classList.add("ativo");

            eixoDispersaoAtual = btn.dataset.eixo || "vazao";
            atualizarVisualDispersao();
        });
    });
}

function carregarDispersaoRede(idMaquina) {
    fetch(`/rede/dispersao/${idMaquina}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" }
    })
        .then(function (resposta) {
            if (!resposta.ok) {
                console.error("Erro ao buscar dispersão de rede:", resposta.status);
                return;
            }

            resposta.json().then(function (dados) {
                dadosDispersaoAtual = {
                    vazao: dados.vazao || [],
                    pacote: dados.pacote || []
                };

                const elBadge = document.getElementById("badge_sensibilidade");
                if (elBadge) {
                    const sinal = dados.sensibilidade100Mbps >= 0 ? "+" : "";
                    elBadge.textContent = `${sinal}${formatarNumeroBR(dados.sensibilidade100Mbps, 2)} ms / 100 Mbps`;
                }

                const elPico = document.getElementById("pico_latencia_dispersao");
                if (elPico) {
                    elPico.textContent = `Pico: ${formatarNumeroBR(dados.picoLatenciaMs, 1)} ms`;
                }

                atualizarVisualDispersao();
            });
        })
        .catch(function (erro) {
            console.error("Falha ao carregar dispersão de rede:", erro);
        });
}

function carregarEventosRede(idMaquina) {
    const container = document.getElementById("lista_eventos_rede");
    if (!container) return;

    fetch(`/rede/eventos/${idMaquina}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" }
    })
        .then(function (resposta) {
            if (!resposta.ok) {
                console.error("Erro ao buscar eventos de rede:", resposta.status);
                return;
            }

            resposta.json().then(function (eventos) {
                container.innerHTML = "";

                if (!eventos || eventos.length === 0) {
                    container.innerHTML = `
                        <div class="evento-item">
                            <div class="evento-icone ok"><i class="bi bi-check-lg"></i></div>
                            <div class="evento-info">
                                <strong>Sem ocorrências recentes</strong>
                                <span>Nenhum evento registrado para esta estação</span>
                            </div>
                            <span class="evento-tempo">Agora</span>
                        </div>
                    `;
                    return;
                }

                for (let i = 0; i < eventos.length; i++) {
                    const ev = eventos[i];
                    const ehOk = ev.tipo === "ok";
                    const ehCritico = ev.tipo === "critico";

                    const classeIcone = ehOk ? "ok" : "alerta";
                    const estiloExtra = ehCritico ? `style="background:#fee2e2;color:#dc2626;"` : "";
                    const iconeBootstrap = ehOk
                        ? "bi-check-lg"
                        : (ehCritico ? "bi-exclamation-triangle-fill" : "bi-arrow-left-right");

                    container.innerHTML += `
                        <div class="evento-item">
                            <div class="evento-icone ${classeIcone}" ${estiloExtra}>
                                <i class="bi ${iconeBootstrap}"></i>
                            </div>
                            <div class="evento-info">
                                <strong>${ev.titulo}</strong>
                                <span>${ev.descricao}</span>
                            </div>
                            <span class="evento-tempo">${ev.tempo}</span>
                        </div>
                    `;
                }
            });
        })
        .catch(function (erro) {
            console.error("Falha ao carregar eventos de rede:", erro);
        });
}

let idMaquinaAtual = null;
let capacidadeLinkAtualMbps = 1000;

function formatarCapacidade(mbps) {
    const valor = Number(mbps) || 1000;
    return valor >= 1000 ? `${(valor / 1000).toFixed(valor % 1000 === 0 ? 0 : 1)} Gbps` : `${valor} Mbps`;
}

function formatarNumeroBR(valor, casas = 2) {
    return Number(valor).toLocaleString("pt-BR", {
        minimumFractionDigits: casas,
        maximumFractionDigits: casas
    });
}

function carregarResumoRede(idMaquina) {
    fetch(`/rede/resumo/${idMaquina}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" }
    })
        .then(function (resposta) {
            if (!resposta.ok) {
                console.error("Erro ao buscar resumo de rede:", resposta.status);
                return;
            }

            resposta.json().then(function (dados) {
                // 1. KPI: Utilização do link
                const u = dados.utilizacao;
                capacidadeLinkAtualMbps = u.capacidadeMbps || capacidadeLinkAtualMbps;
                const capFmt = formatarCapacidade(capacidadeLinkAtualMbps);

                document.getElementById("kpi_uso_percentual").innerHTML =
                    `${formatarNumeroBR(u.percentual, u.percentual % 1 === 0 ? 0 : 1)}<span class="kpi-simbolo">%</span>`;
                document.getElementById("kpi_uso_mbps").innerHTML =
                    `<strong>${formatarNumeroBR(u.vazaoTotalMbps, 2)} Mbps</strong> de ${capFmt}`;
                document.getElementById("kpi_taxas_dir").innerHTML =
                    `&darr; ${formatarNumeroBR(u.downloadMbps, 2)} &bull; &uarr; ${formatarNumeroBR(u.uploadMbps, 2)} Mbps`;
                document.getElementById("barra_uso_link").style.width = `${Math.min(100, u.percentual)}%`;
                document.getElementById("kpi_capacidade_label").textContent = capFmt;
                document.getElementById("spec_velocidade").textContent = capFmt;

                // 2. KPI: Latência P95
                const lat = dados.latencia;
                document.getElementById("kpi_latencia_p95").innerHTML =
                    `${formatarNumeroBR(lat.p95Ms, lat.p95Ms % 1 === 0 ? 0 : 1)} <span class="kpi-unidade">ms</span>`;

                const elLatStatus = document.getElementById("kpi_latencia_status");
                if (lat.p95Ms <= 50) {
                    elLatStatus.className = "badge-status badge-verde";
                    elLatStatus.innerHTML = `<i class="bi bi-check-circle-fill"></i> Dentro do esperado`;
                } else {
                    elLatStatus.className = "badge-status badge-alerta";
                    elLatStatus.innerHTML = `<i class="bi bi-exclamation-triangle-fill"></i> Pico: ${formatarNumeroBR(lat.picoMs, 0)} ms`;
                }

                // 3. KPI: Perda de pacotes
                const perda = dados.perdaPacotes.percentual;
                document.getElementById("kpi_perda_pacotes").innerHTML =
                    `${formatarNumeroBR(perda, 2)} <span class="kpi-unidade">%</span>`;

                const elPerdaStatus = document.getElementById("kpi_perda_status");
                if (perda < 0.5) {
                    elPerdaStatus.className = "tendencia-ok";
                    elPerdaStatus.innerHTML = `&searr; Estável`;
                } else {
                    elPerdaStatus.className = "badge-status badge-alerta";
                    elPerdaStatus.innerHTML = `Acima da meta`;
                }

                // 4. KPI: Previsão de saturação
                const sat = dados.saturacao;
                const elSatDias = document.getElementById("kpi_saturacao_dias");
                const elSatTaxa = document.getElementById("kpi_saturacao_taxa");
                const elSatR2 = document.getElementById("kpi_saturacao_r2");

                if (sat.diasEstimados !== null) {
                    elSatDias.innerHTML = `${sat.diasEstimados} <span class="kpi-unidade">dias</span>`;
                    elSatTaxa.textContent = `+${formatarNumeroBR(sat.taxaDiariaMbps, 2)} Mbps/dia`;
                    elSatR2.innerHTML = `&nearr; R² ${formatarNumeroBR(sat.r2Percentual, 1)}%`;
                } else {
                    elSatDias.innerHTML = `Estável`;
                    elSatTaxa.textContent = sat.amostrasDias < 2
                        ? "Coletando histórico diário"
                        : `${formatarNumeroBR(sat.taxaDiariaMbps, 2)} Mbps/dia`;
                    elSatR2.innerHTML = `Sem tendência de alta`;
                }

                // 5. Card Lateral: Integridade do link (Donut + Estado)
                const score = dados.integridade.score;
                iniciarGraficoIntegridade(score);

                const elStatusInt = document.getElementById("integridade_status_label");
                const elDescInt = document.getElementById("integridade_descricao");
                const elSpecEstado = document.getElementById("spec_estado");

                if (dados.conectado) {
                    elSpecEstado.className = "spec-valor status-conectado";
                    elSpecEstado.innerHTML = `<span class="ponto-verde"></span> Conectado`;
                } else {
                    elSpecEstado.className = "spec-valor";
                    elSpecEstado.style.color = "#dc2626";
                    elSpecEstado.innerHTML = `<span class="ponto-verde" style="background:#dc2626;"></span> Sem telemetria`;
                }

                if (score >= 85) {
                    elStatusInt.style.color = "#10b981";
                    elStatusInt.innerHTML = `<span class="ponto-verde"></span> Excelente`;
                    elDescInt.textContent = "Conexão estável e dentro dos parâmetros operacionais da ETA.";
                } else if (score >= 60) {
                    elStatusInt.style.color = "#f59e0b";
                    elStatusInt.innerHTML = `<span class="ponto-verde" style="background:#f59e0b;"></span> Atenção`;
                    elDescInt.textContent = "Oscilações detectadas nos indicadores de rede da estação.";
                } else {
                    elStatusInt.style.color = "#dc2626";
                    elStatusInt.innerHTML = `<span class="ponto-verde" style="background:#dc2626;"></span> Crítico`;
                    elDescInt.textContent = "Degradação severa ou interrupção na telemetria do link.";
                }
            });
        })
        .catch(function (erro) {
            console.error("Falha ao carregar resumo de rede:", erro);
        });
}

function carregarMaquinasRede() {
    const idEmpresa = sessionStorage.FK_EMPRESA || sessionStorage.ID_EMPRESA;
    const select = document.getElementById("select_maquina");

    if (!select) return;
    if (!idEmpresa) {
        select.innerHTML = `<option value="">Empresa não identificada na sessão</option>`;
        return;
    }

    fetch(`/rede/maquinas/${idEmpresa}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" }
    })
        .then(function (resposta) {
            if (!resposta.ok) {
                select.innerHTML = `<option value="">Erro ao carregar estações</option>`;
                return;
            }

            resposta.json().then(function (lista) {
                select.innerHTML = "";

                if (lista.length === 0) {
                    const optVazio = document.createElement("option");
                    optVazio.value = "";
                    optVazio.textContent = "Nenhuma máquina ativa encontrada";
                    select.appendChild(optVazio);
                    return;
                }

                for (let i = 0; i < lista.length; i++) {
                    const m = lista[i];
                    const opt = document.createElement("option");
                    opt.value = m.id;
                    opt.dataset.capacidade = m.velocidade_link_mbps;
                    opt.dataset.mac = m.mac_address;
                    opt.textContent = `${m.nome_cco} • ${m.hostname}`;
                    select.appendChild(opt);
                }

                const idSalvo = sessionStorage.ID_MAQUINA;
                const existeNaLista = lista.some((m) => String(m.id) === String(idSalvo));

                if (idSalvo && existeNaLista) {
                    select.value = idSalvo;
                } else {
                    select.selectedIndex = 0;
                    sessionStorage.ID_MAQUINA = select.value;
                }

                aoTrocarMaquina();
            });
        })
        .catch(function (erro) {
            console.error("Falha ao carregar seletor de máquinas:", erro);
        });
}

let intervaloAtualizacao = null;

function atualizarDadosDashboard() {
    if (!idMaquinaAtual) return;

    carregarResumoRede(idMaquinaAtual);
    carregarTrafegoRede(idMaquinaAtual, janelaTrafegoAtual);
    carregarDispersaoRede(idMaquinaAtual);
    carregarEventosRede(idMaquinaAtual);
}

function aoTrocarMaquina() {
    const select = document.getElementById("select_maquina");
    if (!select || !select.value) return;

    const opcaoSelecionada = select.options[select.selectedIndex];
    idMaquinaAtual = Number(select.value);
    capacidadeLinkAtualMbps = Number(opcaoSelecionada.dataset.capacidade) || 1000;

    sessionStorage.ID_MAQUINA = idMaquinaAtual;

    const capFormatada = formatarCapacidade(capacidadeLinkAtualMbps);
    const elCapLabel = document.getElementById("kpi_capacidade_label");
    const elSpecVel = document.getElementById("spec_velocidade");
    const elSpecIface = document.getElementById("spec_interface");

    if (elCapLabel) elCapLabel.textContent = capFormatada;
    if (elSpecVel) elSpecVel.textContent = capFormatada;
    if (elSpecIface && opcaoSelecionada.dataset.mac) {
        elSpecIface.textContent = opcaoSelecionada.dataset.mac;
    }

    // Carrega imediatamente ao abrir ou trocar de máquina
    atualizarDadosDashboard();

    // Reinicia o ciclo de atualização automática a cada 10 segundos
if (intervaloAtualizacao) {
        clearInterval(intervaloAtualizacao);
    }

    intervaloAtualizacao = setInterval(function () {
        if (!document.hidden) {
            atualizarDadosDashboard();
        }
    }, 10000);
}
document.addEventListener("DOMContentLoaded", function () {
    iniciarGraficoTrafego();
    iniciarGraficoIntegridade(98);
    iniciarGraficoDispersao();

    const select = document.getElementById("select_maquina");
    if (select) {
        select.addEventListener("change", aoTrocarMaquina);
    }

    carregarMaquinasRede();
});