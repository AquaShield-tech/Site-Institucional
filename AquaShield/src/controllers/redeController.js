var redeModel = require("../models/redeModel");

function listarMaquinas(req, res) {
    var idEmpresa = req.params.idEmpresa;

    if (idEmpresa == undefined) {
        res.status(400).send("Seu idEmpresa está undefined!");
        return;
    }

    redeModel.listarMaquinas(idEmpresa)
        .then(function (resultado) {
            res.status(200).json(resultado);
        })
        .catch(function (erro) {
            console.log(erro);
            console.log("\nHouve um erro ao listar as máquinas de rede! Erro: ", erro.sqlMessage);
            res.status(500).json(erro.sqlMessage);
        });
}

function calcularRegressaoSimples(valoresY) {
    var n = valoresY.length;
    if (n < 2) return { m: 0, b: n === 1 ? valoresY[0] : 0, r2: 0 };

    var somaX = 0, somaY = 0, somaXY = 0, somaX2 = 0;
    for (var i = 0; i < n; i++) {
        somaX += i;
        somaY += valoresY[i];
        somaXY += i * valoresY[i];
        somaX2 += i * i;
    }

    var denom = (n * somaX2) - (somaX * somaX);
    var m = denom !== 0 ? ((n * somaXY) - (somaX * somaY)) / denom : 0;
    var b = (somaY - m * somaX) / n;

    var mediaY = somaY / n;
    var ssTot = 0, ssRes = 0;
    for (var j = 0; j < n; j++) {
        var prev = m * j + b;
        ssTot += Math.pow(valoresY[j] - mediaY, 2);
        ssRes += Math.pow(valoresY[j] - prev, 2);
    }

    var r2 = ssTot !== 0 ? Math.max(0, Math.min(1, 1 - (ssRes / ssTot))) : 0;
    return { m: m, b: b, r2: r2 };
}

function obterResumoRede(req, res) {
    var idMaquina = req.params.idMaquina;

    if (idMaquina == undefined) {
        res.status(400).send("Seu idMaquina está undefined!");
        return;
    }

    Promise.all([
        redeModel.buscarUltimasLeiturasResumo(idMaquina),
        redeModel.buscarLatenciasRecentes(idMaquina),
        redeModel.buscarPicosDiariosBanda(idMaquina),
        redeModel.buscarCapacidadeCadastradaRede(idMaquina)
    ])
        .then(function (resultados) {
            var ultimas = resultados[0];
            var latencias = resultados[1];
            var picosDiarios = resultados[2];
            var cadastroRede = resultados[3][0];

            var mapa = {};
            var menorAtrasoSeg = null;

            for (var i = 0; i < ultimas.length; i++) {
                var row = ultimas[i];
                mapa[row.unidade_medida] = Number(row.valor);
                var atraso = Number(row.segundos_atras);
                if (menorAtrasoSeg === null || atraso < menorAtrasoSeg) {
                    menorAtrasoSeg = atraso;
                }
            }

            var capacidadeCadastrada = cadastroRede && cadastroRede.capacidade_cadastrada_mbps
                ? Number(cadastroRede.capacidade_cadastrada_mbps)
                : 0;

            var velocidadeNegociadaPlaca = mapa["Mbps (velocidade link)"] || 1000;
            var capacidadeMbps = capacidadeCadastrada > 0
                ? capacidadeCadastrada
                : velocidadeNegociadaPlaca;

            var downloadMbps = mapa["Mbps (download)"] || 0;
            var uploadMbps = mapa["Mbps (upload)"] || 0;
            var vazaoTotalMbps = Number((downloadMbps + uploadMbps).toFixed(2));
            var perdaPacotesPct = mapa["% (perda pacotes)"] || 0;
            var ultimaLatenciaMs = mapa["ms (latencia)"] || 0;

            var percentualUso = capacidadeMbps > 0
                ? Math.min(100, Number(((vazaoTotalMbps / capacidadeMbps) * 100).toFixed(1)))
                : 0;

            // Latência P95 e Pico (valores já vêm ordenados ASC do SQL)
            var latenciaP95 = ultimaLatenciaMs;
            var latenciaPico = ultimaLatenciaMs;

            if (latencias.length > 0) {
                var idxP95 = Math.max(0, Math.ceil(latencias.length * 0.95) - 1);
                latenciaP95 = Number(latencias[idxP95].valor);
                latenciaPico = Number(latencias[latencias.length - 1].valor);
            }

            // Regressão Linear para Previsão de Saturação
            var seriePicos = picosDiarios.map(function (p) { return Number(p.pico_mbps); });
            var reg = calcularRegressaoSimples(seriePicos);
            var taxaDiariaMbps = Number(reg.m.toFixed(2));
            var r2Percentual = Number((reg.r2 * 100).toFixed(1));

            var diasParaSaturacao = null;
            if (seriePicos.length >= 2 && reg.m > 0.05) {
                var ultimoValor = seriePicos[seriePicos.length - 1];
                var restanteMbps = Math.max(0, capacidadeMbps - ultimoValor);
                var diasCalculados = Math.ceil(restanteMbps / reg.m);
                diasParaSaturacao = diasCalculados <= 365 ? diasCalculados : 365;
            }

            // Conectividade e Score de Integridade (0 a 100)
            var conectado = menorAtrasoSeg !== null && menorAtrasoSeg <= 60;
            var score = 100;

            if (!conectado) score -= 45;
            if (perdaPacotesPct > 0.5) score -= Math.min(25, Math.round(perdaPacotesPct * 10));
            if (latenciaP95 > 50) score -= Math.min(20, Math.round((latenciaP95 - 50) * 0.4));
            if (percentualUso > 80) score -= Math.min(15, Math.round((percentualUso - 80) * 0.75));
            score = Math.max(0, Math.min(100, score));

            res.status(200).json({
                conectado: conectado,
                semDados: ultimas.length === 0,
                utilizacao: {
                    percentual: percentualUso,
                    vazaoTotalMbps: vazaoTotalMbps,
                    downloadMbps: Number(downloadMbps.toFixed(2)),
                    uploadMbps: Number(uploadMbps.toFixed(2)),
                    capacidadeMbps: capacidadeMbps
                },
                latencia: {
                    p95Ms: Number(latenciaP95.toFixed(1)),
                    picoMs: Number(latenciaPico.toFixed(1))
                },
                perdaPacotes: {
                    percentual: Number(perdaPacotesPct.toFixed(2))
                },
                saturacao: {
                    diasEstimados: diasParaSaturacao,
                    taxaDiariaMbps: taxaDiariaMbps,
                    r2Percentual: r2Percentual,
                    amostrasDias: seriePicos.length
                },
                integridade: {
                    score: score
                }
            });
        })
        .catch(function (erro) {
            console.log(erro);
            console.log("\nHouve um erro ao obter resumo de rede! Erro: ", erro.sqlMessage);
            res.status(500).json(erro.sqlMessage);
        });
}

function obterTrafegoRede(req, res) {
    var idMaquina = req.params.idMaquina;
    var janela = req.params.janela || "1h";

    if (idMaquina == undefined) {
        res.status(400).send("Seu idMaquina está undefined!");
        return;
    }

    var configuracaoJanela = {
        "1h": { horas: 1, bucketSegundos: 60 },
        "6h": { horas: 6, bucketSegundos: 300 },
        "24h": { horas: 24, bucketSegundos: 900 }
    };

    var config = configuracaoJanela[janela] || configuracaoJanela["1h"];

    redeModel.buscarTrafegoPorJanela(idMaquina, config.horas, config.bucketSegundos)
        .then(function (linhas) {
            var labels = [];
            var entrada = [];
            var saida = [];
            var picoEntradaMbps = 0;

            for (var i = 0; i < linhas.length; i++) {
                var valEntrada = Number(linhas[i].entrada_mbps) || 0;
                var valSaida = Number(linhas[i].saida_mbps) || 0;

                labels.push(linhas[i].horario);
                entrada.push(valEntrada);
                saida.push(valSaida);

                if (valEntrada > picoEntradaMbps) {
                    picoEntradaMbps = valEntrada;
                }
            }

            res.status(200).json({
                janela: janela,
                labels: labels,
                entrada: entrada,
                saida: saida,
                picoEntradaMbps: Number(picoEntradaMbps.toFixed(2))
            });
        })
        .catch(function (erro) {
            console.log(erro);
            console.log("\nHouve um erro ao buscar tráfego de rede! Erro: ", erro.sqlMessage);
            res.status(500).json(erro.sqlMessage);
        });
}

function calcularInclinacaoXY(pontos) {
    var n = pontos.length;
    if (n < 2) return 0;

    var somaX = 0, somaY = 0, somaXY = 0, somaX2 = 0;
    for (var i = 0; i < n; i++) {
        somaX += pontos[i].x;
        somaY += pontos[i].y;
        somaXY += pontos[i].x * pontos[i].y;
        somaX2 += pontos[i].x * pontos[i].x;
    }

    var denom = (n * somaX2) - (somaX * somaX);
    return denom !== 0 ? ((n * somaXY) - (somaX * somaY)) / denom : 0;
}

function obterDispersaoRede(req, res) {
    var idMaquina = req.params.idMaquina;

    if (idMaquina == undefined) {
        res.status(400).send("Seu idMaquina está undefined!");
        return;
    }

    redeModel.buscarAmostrasDispersao(idMaquina)
        .then(function (linhas) {
            var vazao = [];
            var pacote = [];
            var picoLatenciaMs = 0;

            for (var i = linhas.length - 1; i >= 0; i--) {
                var lat = Number(linhas[i].latencia_ms) || 0;
                var vz = Number(linhas[i].vazao_mbps) || 0;
                var pkt = Number(linhas[i].pacote_kb) || 0;

                vazao.push({ x: vz, y: lat });
                pacote.push({ x: pkt, y: lat });

                if (lat > picoLatenciaMs) {
                    picoLatenciaMs = lat;
                }
            }

            var inclinacao = calcularInclinacaoXY(vazao);
            var sensibilidade100Mbps = Number((inclinacao * 100).toFixed(2));

            res.status(200).json({
                vazao: vazao,
                pacote: pacote,
                sensibilidade100Mbps: sensibilidade100Mbps,
                picoLatenciaMs: Number(picoLatenciaMs.toFixed(1))
            });
        })
        .catch(function (erro) {
            console.log(erro);
            console.log("\nHouve um erro ao buscar dispersão de rede! Erro: ", erro.sqlMessage);
            res.status(500).json(erro.sqlMessage);
        });
}

function formatarTempoRelativo(minutos) {
    if (minutos === null || minutos === undefined || isNaN(minutos)) return "Recente";
    var min = Math.max(0, Number(minutos));

    if (min < 1) return "Agora";
    if (min < 60) return "Há " + min + " min";
    if (min < 1440) return "Há " + Math.floor(min / 60) + " h";
    return "Há " + Math.floor(min / 1440) + " d";
}

function obterEventosRede(req, res) {
    var idMaquina = req.params.idMaquina;

    if (idMaquina == undefined) {
        res.status(400).send("Seu idMaquina está undefined!");
        return;
    }

    Promise.all([
        redeModel.buscarEventosRede(idMaquina),
        redeModel.buscarUltimaVerificacaoRede(idMaquina)
    ])
        .then(function (resultados) {
            var alertas = resultados[0];
            var verificacao = resultados[1][0];
            var eventos = [];

            for (var i = 0; i < alertas.length; i++) {
                var a = alertas[i];
                var unidade = (a.unidade_medida || "").toLowerCase();
                var valor = Number(a.valor_medido).toFixed(2).replace(".", ",");
                var limite = Number(a.valor_limite).toFixed(2).replace(".", ",");
                var ehCritico = a.nivel === "critico";

                var titulo = ehCritico ? "Alerta crítico de rede" : "Atenção na rede";
                var descricao = "Valor de " + valor + " (limite: " + limite + ")";

                if (unidade.indexOf("latencia") !== -1) {
                    titulo = ehCritico ? "Latência crítica detectada" : "Latência elevada";
                    descricao = "Pico de " + valor + " ms (limite: " + limite + " ms)";
                } else if (unidade.indexOf("download") !== -1 || unidade.indexOf("upload") !== -1) {
                    titulo = ehCritico ? "Saturação de tráfego" : "Tráfego elevado";
                    descricao = "Vazão de " + valor + " Mbps (limite: " + limite + " Mbps)";
                } else if (unidade.indexOf("perda") !== -1) {
                    titulo = "Perda de pacotes detectada";
                    descricao = "Taxa de " + valor + "% acima da meta";
                }

                eventos.push({
                    tipo: ehCritico ? "critico" : "alerta",
                    titulo: titulo,
                    descricao: descricao,
                    tempo: formatarTempoRelativo(a.minutos_atras)
                });
            }

            // Completa com status operacional caso não haja alertas ou existam menos de 3 registros
            if (verificacao && verificacao.ultima_coleta && eventos.length < 3) {
                var tempoUltima = formatarTempoRelativo(verificacao.minutos_atras);
                var ativa = Number(verificacao.minutos_atras) <= 5;

                eventos.unshift({
                    tipo: ativa ? "ok" : "alerta",
                    titulo: ativa ? "Link estável" : "Telemetria aguardando envio",
                    descricao: ativa
                        ? "Conectividade normalizada e dentro dos parâmetros"
                        : "Última leitura recebida " + tempoUltima.toLowerCase(),
                    tempo: tempoUltima
                });
            }

            if (eventos.length < 3) {
                eventos.push({
                    tipo: "ok",
                    titulo: "Verificação concluída",
                    descricao: "Monitoramento contínuo ativo nesta estação",
                    tempo: verificacao && verificacao.ultima_coleta
                        ? formatarTempoRelativo(verificacao.minutos_atras)
                        : "Agora"
                });
            }

            res.status(200).json(eventos.slice(0, 3));
        })
        .catch(function (erro) {
            console.log(erro);
            console.log("\nHouve um erro ao buscar eventos de rede! Erro: ", erro.sqlMessage);
            res.status(500).json(erro.sqlMessage);
        });
}
module.exports = {
    listarMaquinas,
    obterResumoRede,
    obterTrafegoRede,
    obterDispersaoRede,
    obterEventosRede
};