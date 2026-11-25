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

/* ---------- DADOS DEMONSTRATIVOS POR JANELA ---------- */
const seriesTrafego = {
    "1h": {
        labels: ["19:24", "19:39", "19:54", "20:09", "20:24", "20:39", "20:54", "21:09", "21:24"],
        entrada: [655, 785, 760, 640, 725, 824, 735, 630, 648],
        saida: [195, 255, 210, 215, 200, 265, 210, 185, 210],
        pico: "824 Mbps"
    },
    "6h": {
        labels: ["15:30", "16:15", "17:00", "17:45", "18:30", "19:15", "20:00", "20:45", "21:30"],
        entrada: [490, 560, 680, 740, 810, 790, 695, 760, 720],
        saida: [140, 170, 195, 220, 245, 230, 205, 225, 210],
        pico: "810 Mbps"
    },
    "24h": {
        labels: ["00h", "03h", "06h", "09h", "12h", "15h", "18h", "21h"],
        entrada: [310, 280, 420, 690, 780, 846, 795, 720],
        saida: [95, 88, 130, 205, 230, 260, 240, 210],
        pico: "846 Mbps"
    }
};

const amostrasVazaoLatencia = [
    { x: 110, y: 10 }, { x: 145, y: 11 }, { x: 180, y: 12 }, { x: 215, y: 14 },
    { x: 250, y: 13 }, { x: 290, y: 15 }, { x: 320, y: 16 }, { x: 365, y: 17 },
    { x: 400, y: 18 }, { x: 430, y: 17 }, { x: 475, y: 19 }, { x: 510, y: 20 },
    { x: 550, y: 21 }, { x: 590, y: 23 }, { x: 630, y: 22 }, { x: 675, y: 25 },
    { x: 710, y: 26 }, { x: 720, y: 25 }, { x: 760, y: 28 }, { x: 810, y: 31 },
    { x: 860, y: 35 }, { x: 910, y: 68 }, { x: 945, y: 118 }, { x: 970, y: 142 }
];

const amostrasPacoteLatencia = [
    { x: 64, y: 9 },   { x: 128, y: 11 }, { x: 256, y: 12 }, { x: 384, y: 14 },
    { x: 512, y: 16 }, { x: 640, y: 18 }, { x: 768, y: 20 }, { x: 896, y: 22 },
    { x: 1024, y: 25 }, { x: 1150, y: 29 }, { x: 1280, y: 34 }, { x: 1400, y: 74 },
    { x: 1460, y: 115 }, { x: 1500, y: 142 }
];

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

    const inicial = seriesTrafego["1h"];

    graficoTrafego = new Chart(canvas, {
        type: "line",
        data: {
            labels: inicial.labels,
            datasets: [
                {
                    label: "Entrada",
                    data: inicial.entrada,
                    borderColor: "#0d84b2",
                    backgroundColor: degradeEntrada,
                    borderWidth: 2.5,
                    pointRadius: 0,
                    pointHoverRadius: 5,
                    pointHoverBackgroundColor: "#0d84b2",
                    tension: 0.42,
                    fill: true
                },
                {
                    label: "Saída",
                    data: inicial.saida,
                    borderColor: "#10b981",
                    backgroundColor: degradeSaida,
                    borderWidth: 2,
                    pointRadius: 0,
                    pointHoverRadius: 5,
                    pointHoverBackgroundColor: "#10b981",
                    tension: 0.42,
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
                        label: (item) => ` ${item.dataset.label}: ${item.parsed.y} Mbps`
                    }
                }
            },
            scales: {
                x: {
                    grid: { display: false },
                    border: { display: false },
                    ticks: { color: "#94a3b8", font: { family: "Inter", size: 11 } }
                },
                y: {
                    min: 0,
                    max: 1000,
                    ticks: {
                        stepSize: 200,
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

            const serie = seriesTrafego[btn.dataset.janela];
            if (!serie) return;

            graficoTrafego.data.labels = serie.labels;
            graficoTrafego.data.datasets[0].data = serie.entrada;
            graficoTrafego.data.datasets[1].data = serie.saida;
            graficoTrafego.update();

            const elPico = document.getElementById("pico_entrada_valor");
            if (elPico) elPico.textContent = serie.pico;
        });
    });
}

/* ---------- GRÁFICO 2: INTEGRIDADE DO LINK (DONUT SCORE) ---------- */
let graficoIntegridade = null;

function iniciarGraficoIntegridade(score = 98) {
    const canvas = document.getElementById("grafico_integridade_link");
    if (!canvas) return;

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
    const base = tipoEixo === "pacote" ? amostrasPacoteLatencia : amostrasVazaoLatencia;
    const reg = calcularRegressaoLinear(base);

    const xs = base.map((p) => p.x);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);

    const retaTendencia = [
        { x: minX, y: Number((reg.m * minX + reg.b).toFixed(2)) },
        { x: maxX, y: Number((reg.m * maxX + reg.b).toFixed(2)) }
    ];

    return {
        pontos: base,
        retaTendencia,
        tituloX: tipoEixo === "pacote" ? "Tamanho do pacote (KB)" : "Vazão simultânea (Mbps)",
        unidadeX: tipoEixo === "pacote" ? "KB" : "Mbps"
    };
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
                            return ` Carga: ${item.parsed.x} ${unidade}  •  Latência: ${item.parsed.y} ms`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    type: "linear",
                    position: "bottom",
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

            const novo = montarDadosDispersao(btn.dataset.eixo);
            graficoDispersao.data.datasets[0].data = novo.pontos;
            graficoDispersao.data.datasets[1].data = novo.retaTendencia;
            graficoDispersao.options.scales.x.title.text = novo.tituloX;
            graficoDispersao._unidadeX = novo.unidadeX;
            graficoDispersao.update();
        });
    });
}

window.addEventListener("load", () => {
    iniciarGraficoTrafego();
    iniciarGraficoIntegridade(98);
    iniciarGraficoDispersao();
});