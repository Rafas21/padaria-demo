/*
 * Comportamento do site. Lê tudo de window.DADOS (js/dados.js).
 * Não guarda nada: sem cookies, sem localStorage, sem analytics.
 *
 * Teste de horário: abra a página com ?agora=2026-11-05T21:00
 * (hora de Brasília) para simular outro momento.
 */
(function () {
  "use strict";

  var D = window.DADOS;
  if (!D) return;

  var FUSO = "America/Sao_Paulo";
  var DIAS = ["domingo", "segunda-feira", "terça-feira", "quarta-feira", "quinta-feira", "sexta-feira", "sábado"];
  var DIAS_TABELA = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
  var MESES = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
  var SCHEMA_DIAS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  var $ = function (sel) { return document.querySelector(sel); };
  var $$ = function (sel) { return Array.prototype.slice.call(document.querySelectorAll(sel)); };

  /* ---------- tempo ---------- */

  function paraMinutos(hhmm) {
    var p = hhmm.split(":");
    return Number(p[0]) * 60 + Number(p[1]);
  }

  // "05:30" -> "5h30", "20:00" -> "20h"
  function horaCurta(hhmm) {
    var p = hhmm.split(":");
    var h = String(Number(p[0]));
    return p[1] === "00" ? h + "h" : h + "h" + p[1];
  }

  function doisDigitos(n) { return (n < 10 ? "0" : "") + n; }

  // Data de calendário + minutos do dia, sempre no horário de Brasília.
  function agora() {
    var teste = new URLSearchParams(location.search).get("agora");
    var m = teste && /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(teste);
    var a, mes, d, h, mi;
    if (m) {
      a = +m[1]; mes = +m[2]; d = +m[3]; h = +m[4]; mi = +m[5];
    } else {
      var partes = {};
      new Intl.DateTimeFormat("en-US", {
        timeZone: FUSO, year: "numeric", month: "numeric", day: "numeric",
        hour: "numeric", minute: "numeric", hourCycle: "h23"
      }).formatToParts(new Date()).forEach(function (x) { partes[x.type] = x.value; });
      a = +partes.year; mes = +partes.month; d = +partes.day; h = +partes.hour % 24; mi = +partes.minute;
    }
    return {
      ano: a, mes: mes, dia: d,
      semana: new Date(Date.UTC(a, mes - 1, d)).getUTCDay(),
      minutos: h * 60 + mi,
      simulado: !!m
    };
  }

  // Soma dias a uma data de calendário (sem depender do fuso do aparelho).
  function somarDias(ag, n) {
    var dt = new Date(Date.UTC(ag.ano, ag.mes - 1, ag.dia + n));
    return { ano: dt.getUTCFullYear(), mes: dt.getUTCMonth() + 1, dia: dt.getUTCDate(), semana: dt.getUTCDay() };
  }
  function isoData(x) { return x.ano + "-" + doisDigitos(x.mes) + "-" + doisDigitos(x.dia); }

  function nomeDoDia(semanaHoje, semanaAlvo, distancia) {
    if (distancia === 0) return "hoje";
    if (distancia === 1) return "amanhã";
    return DIAS[semanaAlvo];
  }

  /* ---------- status aberto/fechado ---------- */

  function calcularStatus(ag) {
    var hoje = D.horarios[ag.semana];
    if (hoje && ag.minutos >= paraMinutos(hoje.abre) && ag.minutos < paraMinutos(hoje.fecha)) {
      return { aberto: true, texto: "Aberto agora · fecha às " + horaCurta(hoje.fecha) };
    }
    if (hoje && ag.minutos < paraMinutos(hoje.abre)) {
      return { aberto: false, texto: "Fechado · abre hoje às " + horaCurta(hoje.abre) };
    }
    for (var i = 1; i <= 7; i++) {
      var s = (ag.semana + i) % 7;
      if (D.horarios[s]) {
        return { aberto: false, texto: "Fechado · abre " + nomeDoDia(ag.semana, s, i) + " às " + horaCurta(D.horarios[s].abre) };
      }
    }
    return { aberto: false, texto: "Fechado" };
  }

  function renderStatus(ag) {
    var st = calcularStatus(ag);
    var el = $("#status");
    el.classList.toggle("status--aberto", st.aberto);
    el.classList.toggle("status--fechado", !st.aberto);
    el.querySelector(".status__texto").textContent = st.texto;
  }

  /* ---------- fornadas ---------- */

  // Só as fornadas que caem dentro do horário de funcionamento do dia.
  function fornadasDoDia(semana) {
    var h = D.horarios[semana];
    if (!h) return [];
    var abre = paraMinutos(h.abre), fecha = paraMinutos(h.fecha);
    return D.fornadas.filter(function (f) {
      var m = paraMinutos(f);
      return m >= abre && m < fecha;
    });
  }

  function rotuloFornada(hhmm) {
    var h = Number(hhmm.split(":")[0]);
    if (h < 10) return "Fornada da manhã";
    if (h < 14) return "Fornada do almoço";
    return "Fornada da tarde";
  }

  function listaHumana(itens) {
    if (itens.length <= 1) return itens.join("");
    return itens.slice(0, -1).join(", ") + " e " + itens[itens.length - 1];
  }

  function renderFornadas(ag) {
    var hoje = fornadasDoDia(ag.semana);
    var lista = $("#linha-fornadas");
    var nota = $("#fornadas-nota");
    var proximaMarcada = false;

    $("#fornadas-dia").textContent =
      DIAS[ag.semana].charAt(0).toUpperCase() + DIAS[ag.semana].slice(1) + ", " +
      ag.dia + " de " + MESES[ag.mes - 1] + " · pão francês";

    lista.innerHTML = "";
    hoje.forEach(function (f) {
      var min = paraMinutos(f);
      var li = document.createElement("li");
      li.className = "linha__item";

      var hora = document.createElement("span");
      hora.className = "linha__hora";
      hora.textContent = horaCurta(f);

      var rotulo = document.createElement("span");
      rotulo.className = "linha__rotulo";
      rotulo.textContent = rotuloFornada(f);

      var estado = document.createElement("span");
      estado.className = "linha__estado";

      li.appendChild(hora);
      li.appendChild(rotulo);

      if (ag.minutos >= min) {
        li.classList.add("linha__item--passada");
        estado.textContent = ag.minutos - min < 30 ? "saiu agora há pouco" : "já saiu";
        li.appendChild(estado);
      } else if (!proximaMarcada) {
        proximaMarcada = true;
        li.classList.add("linha__item--proxima");
        li.setAttribute("aria-current", "time");
        var selo = document.createElement("span");
        selo.className = "selo";
        selo.textContent = "próxima: " + horaCurta(f);
        li.appendChild(selo);
        var falta = min - ag.minutos;
        var fh = Math.floor(falta / 60), fm = falta % 60;
        estado.textContent = "sai daqui a " + (fh ? fh + "h" + (fm ? doisDigitos(fm) : "") : fm + " min");
        li.appendChild(estado);
      }
      lista.appendChild(li);
    });

    // Notas abaixo da linha do tempo
    var linhas = [];
    var hj = D.horarios[ag.semana];
    if (!hj) {
      linhas.push("Hoje a padaria não abre.");
    } else if (hoje.length < D.fornadas.length && ag.minutos < paraMinutos(hj.fecha)) {
      var fora = D.fornadas.filter(function (f) { return hoje.indexOf(f) === -1; }).map(horaCurta);
      linhas.push("Hoje a padaria fecha às " + horaCurta(hj.fecha) + ", então não tem a fornada das " + listaHumana(fora) + ".");
    }
    if (!proximaMarcada) {
      for (var i = 1; i <= 7; i++) {
        var s = (ag.semana + i) % 7;
        var lista2 = fornadasDoDia(s);
        if (lista2.length) {
          var quando = nomeDoDia(ag.semana, s, i);
          linhas.unshift("<strong>Primeira fornada " + quando + " às " + horaCurta(lista2[0]) + "</strong>");
          break;
        }
      }
    }
    nota.innerHTML = linhas.join("<br>");
    nota.hidden = linhas.length === 0;
  }

  /* ---------- conteúdo fixo vindo dos dados ---------- */

  function enderecoTexto() {
    var e = D.endereco;
    return e.logradouro + " — " + e.bairro + ", " + e.cidade + " – " + e.uf;
  }

  function telefoneLink() {
    return "tel:+55" + D.telefone.replace(/\D/g, "");
  }

  function preencherTextos() {
    var titulo = "Pão francês quentinho às " + listaHumana(D.fornadas.map(horaCurta));
    var campos = {
      nome: D.nome,
      aviso: D.aviso,
      "aviso-rodape": D.aviso,
      titulo: titulo,
      apoio: D.apoio,
      endereco: enderecoTexto(),
      telefone: D.telefone
    };
    $$("[data-campo]").forEach(function (el) {
      var v = campos[el.getAttribute("data-campo")];
      if (v === undefined) return;
      if (v === "") { el.hidden = true; return; }
      el.textContent = v;
    });
    $$('[data-link="telefone"]').forEach(function (a) { a.href = telefoneLink(); });
    $(".botao--ligar").setAttribute("aria-label", "Ligar para " + D.nome + ": " + D.telefone);

    if (D.instagram) {
      var user = D.instagram.replace(/^@/, "");
      $("#insta-link").href = "https://www.instagram.com/" + encodeURIComponent(user) + "/";
      $("#insta-link").textContent = "@" + user;
      $("#insta-wrap").hidden = false;
    }

    var q = encodeURIComponent(D.consultaMapa);
    $("#link-mapa").href = "https://www.google.com/maps/search/?api=1&query=" + q;
    $("#mapa").src = "https://www.google.com/maps?q=" + q + "&output=embed";

    $("#nota-precos").hidden = !D.precosIlustrativos;
    var cred = $("#credito-link");
    cred.textContent = D.credito.texto;
    cred.href = D.credito.link;
  }

  function renderCardapio() {
    var alvo = $("#lista-cardapio");
    alvo.innerHTML = "";
    D.cardapio.forEach(function (grupo, gi) {
      var div = document.createElement("div");
      div.className = "cardapio__grupo";
      var h3 = document.createElement("h3");
      h3.id = "cat-" + gi;
      h3.textContent = grupo.categoria;
      var ul = document.createElement("ul");
      ul.setAttribute("aria-labelledby", h3.id);
      grupo.itens.forEach(function (it) {
        var li = document.createElement("li");
        li.className = "prato";
        li.innerHTML =
          '<span class="prato__nome"></span>' +
          (it.detalhe ? '<span class="prato__detalhe"></span>' : "") +
          '<span class="prato__pontos" aria-hidden="true"></span>' +
          '<span class="prato__preco"></span>';
        li.querySelector(".prato__nome").textContent = it.nome;
        if (it.detalhe) li.querySelector(".prato__detalhe").textContent = it.detalhe;
        li.querySelector(".prato__preco").textContent = "R$ " + it.preco;
        ul.appendChild(li);
      });
      div.appendChild(h3);
      div.appendChild(ul);
      alvo.appendChild(div);
    });
  }

  function renderHorarios(ag) {
    var corpo = $("#tabela-horarios");
    corpo.innerHTML = "";
    [1, 2, 3, 4, 5, 6, 0].forEach(function (s) {
      var h = D.horarios[s];
      var tr = document.createElement("tr");
      var th = document.createElement("th");
      th.scope = "row";
      th.textContent = DIAS_TABELA[s];
      var td = document.createElement("td");
      td.textContent = h ? horaCurta(h.abre) + " – " + horaCurta(h.fecha) : "Fechado";
      if (s === ag.semana) {
        tr.className = "hoje";
        var marca = document.createElement("span");
        marca.className = "marca-hoje";
        marca.textContent = "hoje";
        th.appendChild(marca);
      }
      tr.appendChild(th);
      tr.appendChild(td);
      corpo.appendChild(tr);
    });
  }

  /* ---------- JSON-LD schema.org Bakery ---------- */

  function gerarJsonLd() {
    // Agrupa dias com o mesmo horário
    var grupos = {};
    Object.keys(D.horarios).forEach(function (k) {
      var h = D.horarios[k];
      if (!h) return;
      var chave = h.abre + "-" + h.fecha;
      (grupos[chave] = grupos[chave] || { opens: h.abre, closes: h.fecha, dias: [] }).dias.push(SCHEMA_DIAS[k]);
    });
    var url = location.protocol.indexOf("http") === 0 ? location.origin + location.pathname : undefined;
    var e = D.endereco;
    var dados = {
      "@context": "https://schema.org",
      "@type": "Bakery",
      name: D.nome,
      telephone: "+55 " + D.telefone,
      address: {
        "@type": "PostalAddress",
        streetAddress: e.logradouro,
        addressLocality: e.cidade,
        addressRegion: e.uf,
        addressCountry: "BR"
      },
      areaServed: e.bairro + ", " + e.cidade,
      hasMap: "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(D.consultaMapa),
      openingHoursSpecification: Object.keys(grupos).map(function (k) {
        return { "@type": "OpeningHoursSpecification", dayOfWeek: grupos[k].dias, opens: grupos[k].opens, closes: grupos[k].closes };
      })
    };
    if (e.cep) dados.address.postalCode = e.cep;
    if (url) { dados.url = url; dados.image = new URL("img/pao-frances-1600.webp", url).href; }
    if (D.instagram) dados.sameAs = ["https://www.instagram.com/" + D.instagram.replace(/^@/, "") + "/"];

    var s = document.createElement("script");
    s.type = "application/ld+json";
    s.textContent = JSON.stringify(dados);
    document.head.appendChild(s);
  }

  /* ---------- formulário de encomenda ---------- */

  function formatarDataBR(iso) {
    var p = iso.split("-");
    var semana = new Date(Date.UTC(+p[0], +p[1] - 1, +p[2])).getUTCDay();
    return p[2] + "/" + p[1] + "/" + p[0] + " (" + DIAS[semana] + ")";
  }

  function configurarFormulario(ag) {
    var form = $("#form-encomenda");
    var sel = $("#f-item");
    D.encomendas.itens.forEach(function (it) {
      var o = document.createElement("option");
      o.value = it; o.textContent = it;
      sel.appendChild(o);
    });

    var n = D.encomendas.antecedenciaMinimaDias;
    var minData = isoData(somarDias(ag, n));
    var campoData = $("#f-data");
    campoData.min = minData;
    $("#d-data").textContent = n === 1 ? "A partir de amanhã" : "A partir de " + formatarDataBR(minData);
    $("#prazo-encomenda").textContent = "Pedidos com pelo menos " + n + (n === 1 ? " dia" : " dias") + " de antecedência.";

    function erro(campo, idErro, msg) {
      $(idErro).textContent = msg;
      if (msg) campo.setAttribute("aria-invalid", "true");
      else campo.removeAttribute("aria-invalid");
      return !msg;
    }

    function validar() {
      var f = form.elements;
      var problemas = [];

      if (!erro(f.produto, "#e-item", f.produto.value ? "" : "Escolha o que você quer encomendar.")) problemas.push(f.produto);

      var qtd = f.quantidade.value.trim();
      var msgQtd = "";
      if (!qtd && f.quantidade.validity.badInput) msgQtd = "A quantidade precisa ser um número inteiro, a partir de 1.";
      else if (!qtd) msgQtd = "Informe a quantidade.";
      else if (!/^\d+$/.test(qtd) || +qtd < 1) msgQtd = "A quantidade precisa ser um número inteiro, a partir de 1.";
      else if (+qtd > 999) msgQtd = "Para mais de 999 unidades, fale direto com a padaria pelo telefone.";
      if (!erro(f.quantidade, "#e-qtd", msgQtd)) problemas.push(f.quantidade);

      var data = f.data.value;
      var msgData = "";
      if (!data) msgData = "Escolha o dia em que você quer a encomenda.";
      else if (data < minData) msgData = "Precisamos de pelo menos " + n + (n === 1 ? " dia" : " dias") + " para preparar. Escolha a partir de " + formatarDataBR(minData) + ".";
      else {
        var p = data.split("-");
        var semana = new Date(Date.UTC(+p[0], +p[1] - 1, +p[2])).getUTCDay();
        if (!D.horarios[semana]) msgData = "A padaria não abre " + DIAS[semana] + ". Escolha outro dia.";
      }
      if (!erro(f.data, "#e-data", msgData)) problemas.push(f.data);

      var nome = f.nome.value.trim();
      if (!erro(f.nome, "#e-nome", nome.length >= 2 ? "" : "Escreva seu nome para a padaria saber de quem é o pedido.")) problemas.push(f.nome);

      return problemas;
    }

    function montarMensagem() {
      var f = form.elements;
      var linhas = [
        "Olá, " + D.nome + "! Quero fazer uma encomenda:",
        "",
        "Item: " + f.produto.value,
        "Quantidade: " + f.quantidade.value.trim(),
        "Para o dia: " + formatarDataBR(f.data.value),
        "Nome: " + f.nome.value.trim()
      ];
      var obs = f.observacoes.value.trim();
      if (obs) linhas.push("Observações: " + obs);
      return linhas.join("\n");
    }

    // Limpa o erro do campo assim que a pessoa corrige
    form.addEventListener("input", function (ev) {
      var alvo = ev.target;
      if (alvo.getAttribute("aria-invalid") === "true") {
        alvo.removeAttribute("aria-invalid");
        var idErro = (alvo.getAttribute("aria-describedby") || "").split(" ").filter(function (x) { return x.indexOf("e-") === 0; })[0];
        if (idErro) document.getElementById(idErro).textContent = "";
      }
    });

    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      var problemas = validar();
      if (problemas.length) { problemas[0].focus(); return; }
      var url = "https://wa.me/" + D.whatsapp.replace(/\D/g, "") + "?text=" + encodeURIComponent(montarMensagem());
      var janela = window.open(url, "_blank", "noopener");
      if (!janela) location.href = url;
    });
  }

  /* ---------- início ---------- */

  var ag = agora();
  preencherTextos();
  renderCardapio();
  renderHorarios(ag);
  renderStatus(ag);
  renderFornadas(ag);
  configurarFormulario(ag);
  gerarJsonLd();

  if (ag.simulado) {
    var aviso = $(".aviso");
    aviso.hidden = false;
    aviso.textContent = (D.aviso ? D.aviso + " · " : "") + "simulando " + doisDigitos(ag.dia) + "/" + doisDigitos(ag.mes) + " às " + doisDigitos(Math.floor(ag.minutos / 60)) + ":" + doisDigitos(ag.minutos % 60);
  } else {
    // Atualiza status e fornadas a cada minuto (sem animação; só troca o texto)
    setInterval(function () {
      var novo = agora();
      renderStatus(novo);
      renderFornadas(novo);
      if (novo.dia !== ag.dia) { renderHorarios(novo); ag = novo; }
    }, 60000);
  }
})();
