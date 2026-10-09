const dados = { cpu: [], ram: [], disco: [], rede: [] };
const graficos = {};

const cores = {
    cpu: "#19a99a",
    ram: "#277bd3",
    disco: "#f19a18",
    rede: "#6244c7"
};

const faixas = {
    cpu: [10, 95],
    ram: [20, 95],
    disco: [10, 90],
    rede: [5, 100]
};

const PONTOS = 12;       
const LIMITE_ALERTA = 70;
const LIMITE_CRITICO = 90;

function gerarNumero(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function gerarHistorico(nome) {
    const [min, max] = faixas[nome];
    return Array.from({ length: PONTOS }, () => gerarNumero(min, max));
}

function hexParaRgba(hex, alpha) {
    const n = parseInt(hex.slice(1), 16);
    return `rgba(${n >> 16}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
}

function rotulosTempo() {
    
    return dados.cpu.map((_, i, arr) => `${(arr.length - 1 - i) * 5}s atrás`);
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
            labels: rotulosTempo(),
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
    grafico.data.labels = rotulosTempo();
    grafico.data.datasets[0].data = dados[nome];
    grafico.update();
}

function classeNivel(valor) {
    if (valor > LIMITE_CRITICO) return "critico";
    if (valor > LIMITE_ALERTA) return "alerta";
    return "normal";
}

function atualizarStatus(nome, valor) {
    const elemento = document.getElementById(`status-${nome}`);
    if (!elemento) return;

    const nivel = classeNivel(valor);
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
        const atual = dados[nome][dados[nome].length - 1];
        if (atual > LIMITE_ALERTA) alertas++;
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
    const valor = dados[nome][dados[nome].length - 1];
    atualizarValor(nome, valor);
    atualizarStatus(nome, valor);
    atualizarGrafico(nome);
}

function atualizarDados() {
    Object.keys(dados).forEach(nome => {
        const [min, max] = faixas[nome];
        dados[nome].push(gerarNumero(min, max));

        if (dados[nome].length > PONTOS) dados[nome].shift();

        atualizarTudo(nome);
    });

    atualizarKpis();
}

function iniciarDashboard() {
    Object.keys(dados).forEach(nome => {
        dados[nome] = gerarHistorico(nome);
        criarGrafico(nome);
        atualizarTudo(nome);
    });

    atualizarKpis();
    setInterval(atualizarDados, 5000);
}

window.addEventListener("load", function () {
    if (typeof Chart === "undefined") {
        console.error("Chart.js não foi carregado.");
        alert("Erro: Chart.js não foi carregado. Verifique sua conexão com a internet.");
        return;
    }
    iniciarDashboard();
});