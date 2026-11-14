function carregarUsuario() {
    var fkCargo = sessionStorage.FK_CARGO;
    var nomeUsuario = sessionStorage.NOME_USUARIO;

    // Sem login: volta para a tela inicial
    if (!fkCargo || !nomeUsuario) {
        window.location.replace("index.html");
        return;
    }

    var elementUsuario = document.getElementById("b_usuario");
    var elementCargo = document.getElementById("b_cargo");

    if (elementUsuario) {
        elementUsuario.innerHTML = nomeUsuario;
    }

    if (elementCargo) {
        if (fkCargo == "1") {
            elementCargo.innerHTML = "Gestor";
        } else if (fkCargo == "2") {
            elementCargo.innerHTML = "Analista";
        } else if (fkCargo == "3") {
            elementCargo.innerHTML = "Operador";
        }
    }
}

function deslogar() {
    sessionStorage.clear();
    alert("Sessão encerrada com sucesso.");
    window.location = "index.html";
}

carregarUsuario();


const COR_CRITICO = '#dc2626';
const COR_ALERTA = '#f59e0b';

function doisDigitos(n) {
    return String(n).padStart(2, '0');
}

/* Estrutura dos eixos */

function gerarEixos() {
    const labels30 = [];
    for (let i = 29; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        labels30.push(doisDigitos(d.getDate()) + '/' + doisDigitos(d.getMonth() + 1));
    }

    const labels24 = [];
    for (let i = 23; i >= 0; i--) {
        const d = new Date();
        d.setHours(d.getHours() - i);
        labels24.push(doisDigitos(d.getHours()) + 'h');
    }

    return { labels24, labels30 };
}

function montarSerie(labelsBase, registrosBanco) {
    const mapa = {};
    for (let i = 0; i < registrosBanco.length; i++) {
        const item = registrosBanco[i];
        mapa[item.label] = {
            critico: Number(item.critico) || 0,
            alerta: Number(item.alerta) || 0
        };
    }

    const critico = [];
    const alerta = [];

    for (let i = 0; i < labelsBase.length; i++) {
        const lbl = labelsBase[i];
        if (mapa[lbl]) {
            critico.push(mapa[lbl].critico);
            alerta.push(mapa[lbl].alerta);
        } else {
            critico.push(0);
            alerta.push(0);
        }
    }

    return { critico, alerta };
}

let periodoAtual = '7d';
const eixos = gerarEixos();

const periodos = {
    '24h': { labels: eixos.labels24, critico: Array(24).fill(0), alerta: Array(24).fill(0), eixoX: 'Hora' },
    '7d': { labels: eixos.labels30.slice(-7), critico: Array(7).fill(0), alerta: Array(7).fill(0), eixoX: 'Dia' },
    '30d': { labels: eixos.labels30, critico: Array(30).fill(0), alerta: Array(30).fill(0), eixoX: 'Dia' }
};

/* ---------- Inicialização dos Gráficos ---------- */

const inicial = periodos['7d'];

const espacoLegenda = {
    id: 'espacoLegenda',
    beforeInit: function (chart) {
        const fitOriginal = chart.legend.fit;
        chart.legend.fit = function () {
            fitOriginal.bind(chart.legend)();
            this.height += 14;
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
    periodoAtual = chave;
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

const textoCentro = {
    id: 'textoCentro',
    afterDraw: function (chart) {
        const dados = chart.data.datasets[0].data;
        const totalAvisos = dados.reduce(function (a, b) { return a + Number(b || 0); }, 0);

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

const graficoDonut = new Chart(document.getElementById('grafico_donut'), {
    type: 'doughnut',
    data: {
        labels: ['Crítico', 'Alerta'],
        datasets: [{
            data: [0, 0],
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

/* KPIs */

function atualizarKpis() {
    var idEmpresa = sessionStorage.FK_EMPRESA;

    if (!idEmpresa) {
        console.warn("FK_EMPRESA não encontrada no sessionStorage.");
        return;
    }

    fetch(`/visaoGeral/kpis/${idEmpresa}`, {
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
                    document.getElementById("kpi_cpu").textContent = dados.cpu_sobrecarga;
                    document.getElementById("kpi_ram").textContent = dados.ram_sobrecarga;
                    document.getElementById("kpi_disco").textContent = dados.discos_criticos;
                    document.getElementById("kpi_desc").textContent = dados.maquinas_desconectadas;
                });
            } else {
                console.error("Erro na resposta da API de KPIs:", resposta.status);
            }
        })
        .catch(function (erro) {
            console.error("Erro ao buscar KPIs:", erro);
        });
}

/* Gráficos */

function atualizarGraficos() {
    var idEmpresa = sessionStorage.FK_EMPRESA;

    if (!idEmpresa) {
        return;
    }

    const eixosAtuais = gerarEixos();

    // ultimas 24 horas
    fetch(`/visaoGeral/grafico24h/${idEmpresa}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" }
    })
        .then(function (resposta) {
            if (resposta.ok) {
                resposta.json().then(function (dados24h) {
                    const serie24 = montarSerie(eixosAtuais.labels24, dados24h);
                    periodos['24h'] = {
                        labels: eixosAtuais.labels24,
                        critico: serie24.critico,
                        alerta: serie24.alerta,
                        eixoX: 'Hora'
                    };

                    if (periodoAtual === '24h') {
                        trocarPeriodo('24h');
                    }
                });
            }
        })
        .catch(function (erro) {
            console.error("Erro ao buscar gráfico de 24h:", erro);
        });

    // ultimos 30 dias
    fetch(`/visaoGeral/grafico30d/${idEmpresa}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" }
    })
        .then(function (resposta) {
            if (resposta.ok) {
                resposta.json().then(function (dados30d) {
                    const serie30 = montarSerie(eixosAtuais.labels30, dados30d);

                    periodos['7d'] = {
                        labels: eixosAtuais.labels30.slice(-7),
                        critico: serie30.critico.slice(-7),
                        alerta: serie30.alerta.slice(-7),
                        eixoX: 'Dia'
                    };

                    periodos['30d'] = {
                        labels: eixosAtuais.labels30,
                        critico: serie30.critico,
                        alerta: serie30.alerta,
                        eixoX: 'Dia'
                    };

                    if (periodoAtual === '7d' || periodoAtual === '30d') {
                        trocarPeriodo(periodoAtual);
                    }

                    // Donut soma dos 30 dias
                    const somaCritico = serie30.critico.reduce(function (a, b) { return a + b; }, 0);
                    const somaAlerta = serie30.alerta.reduce(function (a, b) { return a + b; }, 0);

                    graficoDonut.data.datasets[0].data = [somaCritico, somaAlerta];
                    graficoDonut.update();
                });
            }
        })
        .catch(function (erro) {
            console.error("Erro ao buscar gráfico de 30d:", erro);
        });
}


/* Historico */

function atualizarHistorico() {
    var idEmpresa = sessionStorage.FK_EMPRESA;

    if (!idEmpresa) {
        return;
    }

    fetch(`/visaoGeral/historico/${idEmpresa}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        }
    })
        .then(function (resposta) {
            if (resposta.ok) {
                resposta.json().then(function (lista) {
                    var tbody = document.getElementById("tbody_historico");
                    if (!tbody) return;

                    if (lista.length === 0) {
                        tbody.innerHTML = `
                            <tr>
                                <td colspan="6" style="text-align: center; color: #6f8392;">
                                    Nenhuma ocorrência registrada.
                                </td>
                            </tr>
                        `;
                        return;
                    }

                    var html = "";
                    for (var i = 0; i < lista.length; i++) {
                        var item = lista[i];
                        var classeTag = item.nivel === "Crítico" ? "tag-critico" : "tag-alerta";

                        html += `
                            <tr>
                                <td>${item.data_hora}</td>
                                <td>${item.maquina}</td>
                                <td>${item.componente}</td>
                                <td>${item.ocorrencia}</td>
                                <td><span class="tag ${classeTag}">${item.nivel}</span></td>
                                <td>${item.status}</td>
                            </tr>
                        `;
                    }

                    tbody.innerHTML = html;
                });
            } else {
                console.error("Erro na resposta da API de histórico:", resposta.status);
            }
        })
        .catch(function (erro) {
            console.error("Erro ao buscar histórico:", erro);
        });
}

atualizarKpis();
atualizarGraficos();
atualizarHistorico();

setInterval(atualizarKpis, 15000);
setInterval(atualizarGraficos, 60000);
setInterval(atualizarHistorico,30000)