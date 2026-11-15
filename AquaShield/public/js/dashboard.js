const dados = { cpu: [], ram: [], disco: [], rede: [] };
const horarios = { cpu: [], ram: [], disco: [], rede: [] };
const limites = { cpu: 75, ram: 75, disco: 90, rede: 90 };
const graficos = {};

const cores = {
    cpu: "#19a99a",
    ram: "#4c2cdd",
    disco: "#00d9ff",
    rede: "#8c00ff"
};

const PONTOS = 12;
const LIMITE_CRITICO = 90;

function hexParaRgba(hex, alpha) {
    const n = parseInt(hex.slice(1), 16);
    return `rgba(${n >> 16}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
}

function rotulosTempo(nome) {
    return horarios[nome];
}

function criarGrafico(nome) {
    const canvas = document.getElementById(`grafico-${nome}`);
    if (!canvas) {
        console.error(`Canvas grafico-${nome} não encontrado.`);
        return;
    }

    const ctx = canvas.getContext("2d");
    const degrade = ctx.createLinearGradient(0, 0, 0, 160);
    degrade.addColorStop(0, hexParaRgba(cores[nome], 0.35));
    degrade.addColorStop(1, hexParaRgba(cores[nome], 0));

    graficos[nome] = new Chart(canvas, {
        type: "line",
        data: {
            labels: rotulosTempo(nome),
            datasets: [{
                data: dados[nome],
                borderColor: cores[nome],
                backgroundColor: degrade,
                borderWidth: 2.5,
                pointRadius: 0,
                pointHoverRadius: 5,
                pointHoverBackgroundColor: cores[nome],
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: { duration: 400 },
            interaction: { intersect: false, mode: "index" },
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: "#073442",
                    padding: 8,
                    displayColors: false,
                    callbacks: { label: (item) => `${item.parsed.y}%` }
                }
            },
            scales: {
                x: { display: false },
                y: {
                    min: 0,
                    max: 100,
                    ticks: {
                        stepSize: 25,
                        font: { size: 10 },
                        color: "#8294a2",
                        callback: (v) => `${v}%`
                    },
                    grid: { color: "#eef2f4" },
                    border: { display: false }
                }
            }
        }
    });
}

function atualizarGrafico(nome) {
    const grafico = graficos[nome];
    if (!grafico) return;

    grafico.data.labels = rotulosTempo(nome);
    grafico.data.datasets[0].data = dados[nome];
    // Se houver apenas 1 ponto no banco, exibe o marcador para não parecer vazio
    grafico.data.datasets[0].pointRadius = dados[nome].length === 1 ? 4 : 0;
    grafico.update();
}

function classeNivel(nome, valor) {
    const limiteAlerta = limites[nome] || 75;
    if (valor >= LIMITE_CRITICO) return "critico";
    if (valor >= limiteAlerta) return "alerta";
    return "normal";
}

function atualizarStatus(nome, valor) {
    const elemento = document.getElementById(`status-${nome}`);
    if (!elemento) return;

    const nivel = classeNivel(nome, valor);
    const textos = { normal: "Normal", alerta: "Atenção", critico: "Crítico" };

    elemento.classList.remove("alerta", "critico");
    if (nivel !== "normal") elemento.classList.add(nivel);
    elemento.innerHTML = `<span></span>${textos[nivel]}`;

    const card = elemento.closest(".dashboard-componente");
    if (card) {
        card.classList.remove("nivel-alerta", "nivel-critico");
        if (nivel !== "normal") card.classList.add(`nivel-${nivel}`);
    }
}

function atualizarValor(nome, valor) {
    const elemento = document.getElementById(`${nome}-valor`);
    if (elemento) elemento.textContent = `${valor}%`;
}

function atualizarKpis() {
    let alertas = 0;

    Object.keys(dados).forEach(nome => {
        const lista = dados[nome];
        const atual = lista.length > 0 ? lista[lista.length - 1] : 0;
        if (classeNivel(nome, atual) !== "normal") {
            alertas++;
        }
    });

    const elAlerta = document.getElementById("componentes-alerta");
    const elTotal = document.getElementById("componentes-monitorados");

    if (elAlerta) {
        elAlerta.textContent = alertas;
        elAlerta.classList.toggle("tem-alerta", alertas > 0);
    }
    if (elTotal) elTotal.textContent = Object.keys(dados).length;
}

function atualizarTudo(nome) {
    const lista = dados[nome];
    const valor = lista.length > 0 ? lista[lista.length - 1] : 0;
    atualizarValor(nome, valor);
    atualizarStatus(nome, valor);
    atualizarGrafico(nome);
}

function mapearComponente(tipoBanco) {
    const tipo = String(tipoBanco).toLowerCase();
    if (tipo.includes("cpu")) return "cpu";
    if (tipo.includes("ram")) return "ram";
    if (tipo.includes("disco") || tipo.includes("armazenamento")) return "disco";
    if (tipo.includes("rede")) return "rede";
    return null;
}

function buscarDadosTempoReal() {
    const idMaquina = sessionStorage.ID_MAQUINA;

    if (!idMaquina) {
        window.location = "maquinas.html";
        return;
    }

    fetch(`/maquina/tempo-real/${idMaquina}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        }
    })
        .then(function (resposta) {
            if (resposta.ok) {
                resposta.json().then(function (lista) {
                    const novosDados = { cpu: [], ram: [], disco: [], rede: [] };
                    const novosHorarios = { cpu: [], ram: [], disco: [], rede: [] };

                    // do mais recente para o mais antigo
                    for (let i = 0; i < lista.length; i++) {
                        const item = lista[i];
                        const chave = mapearComponente(item.componente);

                        if (chave && novosDados[chave].length < PONTOS) {
                            novosDados[chave].push(Number(item.valor) || 0);
                            novosHorarios[chave].push(item.horario);

                            // Pega o limite da leitura mais recente de cada componente
                            if (novosDados[chave].length === 1 && item.limite_alerta != null) {
                                limites[chave] = Number(item.limite_alerta);
                            }
                        }
                    }

                    // gráfico da esquerda (antigo) para a direita (recente)
                    Object.keys(dados).forEach(nome => {
                        dados[nome] = novosDados[nome].reverse();
                        horarios[nome] = novosHorarios[nome].reverse();
                        atualizarTudo(nome);
                    });

                    atualizarKpis();
                });
            } else {
                console.error("Erro ao buscar dados em tempo real:", resposta.status);
            }
        })
        .catch(function (erro) {
            console.error("Erro na requisição de tempo real:", erro);
        });
}

function iniciarDashboard() {
    const idMaquina = sessionStorage.ID_MAQUINA;
    const hostname = sessionStorage.HOSTNAME_MAQUINA;

    if (!idMaquina) {
        alert("Selecione uma máquina primeiro.");
        window.location = "maquinas.html";
        return;
    }

    const titulo = document.getElementById("titulo_maquina");
    if (titulo && hostname) {
        titulo.textContent = `Monitoramento em tempo real — ${hostname}`;
    }

    Object.keys(dados).forEach(nome => {
        criarGrafico(nome);
    });

    buscarDadosTempoReal();
    setInterval(buscarDadosTempoReal, 5000);
}

window.addEventListener("load", function () {
    if (typeof Chart === "undefined") {
        console.error("Chart.js não foi carregado.");
        alert("Erro: Chart.js não foi carregado. Verifique sua conexão com a internet.");
        return;
    }
    iniciarDashboard();
});