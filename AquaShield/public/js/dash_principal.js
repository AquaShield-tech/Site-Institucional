const COR_CRITICO = '#dc2626';
const COR_ALERTA = '#f59e0b';

function aleatorio(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function gerarSerie(qtd, min, max) {
    return Array.from({ length: qtd }, () => aleatorio(min, max));
}

function doisDigitos(n) {
    return String(n).padStart(2, '0');
}

/* ---------- Dados ---------- */

const labels30 = [];
for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    labels30.push(doisDigitos(d.getDate()) + '/' + doisDigitos(d.getMonth() + 1));
}
const critico30 = gerarSerie(30, 2, 18);
const alerta30 = gerarSerie(30, 8, 40);

// Últimas 24 horas
const labels24 = [];
for (let i = 23; i >= 0; i--) {
    const d = new Date();
    d.setHours(d.getHours() - i);
    labels24.push(doisDigitos(d.getHours()) + 'h');
}
const critico24 = gerarSerie(24, 0, 5);
const alerta24 = gerarSerie(24, 1, 12);

const periodos = {
    '24h': { labels: labels24, critico: critico24, alerta: alerta24, eixoX: 'Hora' },
    '7d': { labels: labels30.slice(-7), critico: critico30.slice(-7), alerta: alerta30.slice(-7), eixoX: 'Dia' },
    '30d': { labels: labels30, critico: critico30, alerta: alerta30, eixoX: 'Dia' }
};

/* ---------- KPIs ---------- */

function preencherKpi(idValor, min, max) {
    document.getElementById(idValor).textContent = aleatorio(min, max);
}

preencherKpi('kpi_cpu', 3, 40);
preencherKpi('kpi_ram', 3, 40);
preencherKpi('kpi_disco', 10, 40);
preencherKpi('kpi_desc', 1, 12);

/* ---------- Gráfico de linha ---------- */

const inicial = periodos['7d'];

const espacoLegenda = {
    id: 'espacoLegenda',
    beforeInit: function (chart) {
        const fitOriginal = chart.legend.fit;
        chart.legend.fit = function () {
            fitOriginal.bind(chart.legend)();
            this.height += 14; // maior = mais espaço
        };
    }
};

const graficoLinha = new Chart(document.getElementById('grafico_linha'), {
    type: 'line',
    data: {
        labels: inicial.labels,
        datasets: [
            {
                label: 'Crítico',
                data: inicial.critico,
                borderColor: COR_CRITICO,
                backgroundColor: 'rgba(220, 38, 38, 0.10)',
                fill: true,
                tension: 0.4,
                borderWidth: 2.5,
                pointRadius: 3,
                pointHoverRadius: 5
            },
            {
                label: 'Alerta',
                data: inicial.alerta,
                borderColor: COR_ALERTA,
                backgroundColor: 'rgba(245, 158, 11, 0.12)',
                fill: true,
                tension: 0.4,
                borderWidth: 2.5,
                pointRadius: 3,
                pointHoverRadius: 5
            }
        ]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
            legend: {
                position: 'top',
                align: 'start',
                labels: { usePointStyle: true, boxWidth: 8, font: { family: 'Inter', size: 12 } }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                title: { display: true, text: 'Quantidade de alertas', font: { family: 'Inter', size: 12 } },
                grid: { color: '#eef2f4' },
                ticks: { precision: 0, font: { family: 'Inter', size: 11 } }
            },
            x: {
                title: { display: true, text: inicial.eixoX, font: { family: 'Inter', size: 12 } },
                grid: { display: false },
                ticks: { font: { family: 'Inter', size: 11 }, maxRotation: 0, autoSkipPadding: 12 }
            }
        }
    },
    plugins: [espacoLegenda]
});

function trocarPeriodo(chave) {
    const p = periodos[chave];
    graficoLinha.data.labels = p.labels;
    graficoLinha.data.datasets[0].data = p.critico;
    graficoLinha.data.datasets[1].data = p.alerta;
    graficoLinha.options.scales.x.title.text = p.eixoX;
    const raio = p.labels.length > 24 ? 2 : 3;
    graficoLinha.data.datasets.forEach(function (ds) { ds.pointRadius = raio; });
    graficoLinha.update();
}

document.querySelectorAll('.btn-periodo').forEach(function (btn) {
    btn.addEventListener('click', function () {
        document.querySelectorAll('.btn-periodo').forEach(function (b) { b.classList.remove('ativo'); });
        btn.classList.add('ativo');
        trocarPeriodo(btn.dataset.periodo);
    });
});

/* ---------- Gráfico de donut (soma dos 30 dias) ---------- */

const somaCritico = critico30.reduce(function (a, b) { return a + b; }, 0);
const somaAlerta = alerta30.reduce(function (a, b) { return a + b; }, 0);
const totalAvisos = somaCritico + somaAlerta;

const textoCentro = {
    id: 'textoCentro',
    afterDraw: function (chart) {
        const area = chart.chartArea;
        const ctx = chart.ctx;
        const x = (area.left + area.right) / 2;
        const y = (area.top + area.bottom) / 2;

        ctx.save();
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#112d40';
        ctx.font = '600 28px Inter';
        ctx.fillText(totalAvisos, x, y - 8);
        ctx.fillStyle = '#6f8392';
        ctx.font = '400 12px Inter';
        ctx.fillText('avisos', x, y + 16);
        ctx.restore();
    }
};

new Chart(document.getElementById('grafico_donut'), {
    type: 'doughnut',
    data: {
        labels: ['Crítico', 'Alerta'],
        datasets: [{
            data: [somaCritico, somaAlerta],
            backgroundColor: [COR_CRITICO, COR_ALERTA],
            borderWidth: 2,
            borderColor: '#ffffff'
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '68%',
        plugins: {
            legend: {
                position: 'bottom',
                labels: { usePointStyle: true, boxWidth: 8, font: { family: 'Inter', size: 12 } }
            }
        }
    },
    plugins: [textoCentro]
});