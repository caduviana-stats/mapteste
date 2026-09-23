/* Etapa 05-territorios-cas: lógica preservada do mapa original. Consulte README.md para atualização dos dados. */

/* ============================================================
   08.1 — TERRITÓRIOS DAS 10 CAS
   MALHA OFICIAL DE BAIRROS DA PREFEITURA DO RIO
   + AGRUPAMENTO CONFORME A PLANILHA DO PROJETO

=============================================================== */

(function () {

  if (window.__TERRITORIOS_CAS_OFICIAL_V1__) {
    console.warn("Territórios CAS já carregados.");
    return;
  }

  window.__TERRITORIOS_CAS_OFICIAL_V1__ = true;


  /* ============================================================
     1. AGUARDA O MAPA PRINCIPAL EXISTIR
  ============================================================ */

  function iniciarTerritoriosCAS() {

    if (
      typeof L === "undefined" ||
      typeof map === "undefined"
    ) {
      setTimeout(iniciarTerritoriosCAS, 300);
      return;
    }


    /* ==========================================================
       2. REMOVE EVENTUAIS CAMADAS DOS TESTES ANTERIORES
    ========================================================== */

    [
      "camadaTerritoriosCAS",
      "casAreaGroup",
      "grupoTerritoriosCAS",
      "camadaGeoCAS"
    ].forEach(function (nome) {

      try {

        const camada = window[nome];

        if (
          camada &&
          typeof map.hasLayer === "function" &&
          map.hasLayer(camada)
        ) {
          map.removeLayer(camada);
        }

      } catch (e) {}

    });


    /* ==========================================================
       3. CORES DAS CAS
       Inspiradas no mapa físico da SMAS
    ========================================================== */

    const CORES_CAS = {

      "1ª CAS":  "#F2DF3A",

      "2ª CAS":  "#62C6C2",

      "3ª CAS":  "#A8CD45",

      "4ª CAS":  "#E6786E",

      "5ª CAS":  "#D6A600",

      "6ª CAS":  "#B487C0",

      "7ª CAS":  "#765184",

      "8ª CAS":  "#E28B45",

      "9ª CAS":  "#B8D83D",

      "10ª CAS": "#4F9F69"

    };


    /* ==========================================================
       4. PANE PRÓPRIO

       mapa-base = abaixo
       territórios = meio
       equipamentos = acima
    ========================================================== */

    if (!map.getPane("territoriosCASPane")) {
      map.createPane("territoriosCASPane");
    }

    const pane = map.getPane("territoriosCASPane");

    pane.style.zIndex = 260;
    pane.style.pointerEvents = "none";


    /* ==========================================================
       5. NORMALIZAÇÃO DE NOMES
    ========================================================== */

    function normalizar(valor) {

      return String(valor || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[–—]/g, "-")
        .replace(/\s+/g, " ")
        .trim()
        .toUpperCase();

    }


    /* ==========================================================
       6. DISTRIBUIÇÃO BAIRRO -> CAS

       BASE:
       planilha

       Os casos definidos posteriormente prevalecem.
    ========================================================== */

    const BAIRROS_CAS = {


      /* ================= 1ª CAS ================= */

      "1ª CAS": [

        "Benfica",
        "Caju",
        "Catumbi",
        "Centro",
        "Cidade Nova",
        "Estácio",
        "Gamboa",
        "Lapa",
        "Mangueira",
        "Paquetá",
        "Rio Comprido",
        "Santa Teresa",
        "Santo Cristo",
        "São Cristóvão",
        "Saúde",
        "Vasco da Gama"

      ],


      /* ================= 2ª CAS ================= */

      "2ª CAS": [

        "Alto da Boa Vista",
        "Andaraí",
        "Botafogo",
        "Catete",
        "Copacabana",
        "Cosme Velho",
        "Flamengo",
        "Gávea",
        "Glória",
        "Grajaú",
        "Horto",
        "Humaitá",
        "Ipanema",
        "Jardim Botânico",
        "Lagoa",
        "Laranjeiras",
        "Leblon",
        "Leme",
        "Maracanã",
        "Praça da Bandeira",
        "Rocinha",
        "São Conrado",
        "Tijuca",
        "Urca",
        "Vidigal",
        "Vila Isabel"

      ],


      /* ================= 3ª CAS ================= */

      "3ª CAS": [

        "Abolição",
        "Água Santa",
        "Cachambi",
        "Del Castilho",
        "Encantado",
        "Engenho da Rainha",
        "Engenho de Dentro",
        "Engenho Novo",
        "Higienópolis",

        /* decisões do projeto */
        "Inhaúma",
        "Tomás Coelho",

        "Jacaré",
        "Jacarezinho",
        "Lins de Vasconcelos",
        "Maria da Graça",
        "Méier",
        "Piedade",
        "Pilares",
        "Riachuelo",
        "Rocha",
        "Sampaio",
        "São Francisco Xavier",
        "Todos os Santos"

      ],


      /* ================= 4ª CAS ================= */

      "4ª CAS": [

        "Bancários",
        "Bonsucesso",
        "Brás de Pina",
        "Cacuia",
        "Cidade Universitária",
        "Cocotá",
        "Complexo do Alemão",
        "Cordovil",

        /* Freguesia da Ilha é tratada
           separadamente mais abaixo */

        "Galeão",
        "Jardim América",
        "Jardim Carioca",
        "Jardim Guanabara",
        "Manguinhos",
        "Maré",
        "Moneró",
        "Olaria",
        "Parada de Lucas",

        /* decisões do projeto */
        "Pavuna",
        "Vila da Penha",

        "Penha",
        "Penha Circular",
        "Pitangueiras",
        "Portuguesa",
        "Praia da Bandeira",
        "Ramos",
        "Ribeira",
        "Tauá",
        "Vigário Geral",
        "Zumbi"

      ],


      /* ================= 5ª CAS ================= */

      "5ª CAS": [

        "Bento Ribeiro",
        "Campinho",
        "Cascadura",
        "Cavalcanti",
        "Coelho Neto",
        "Engenheiro Leal",
        "Guadalupe",
        "Honório Gurgel",
        "Madureira",
        "Marechal Hermes",

        /* decisão do projeto */
        "Mariópolis",

        "Oswaldo Cruz",
        "Parque Anchieta",
        "Quintino Bocaiúva",
        "Ricardo de Albuquerque",
        "Rocha Miranda",
        "Turiaçu",
        "Vaz Lobo"

      ],


      /* ================= 6ª CAS ================= */

      "6ª CAS": [

        "Acari",

        /* decisão do projeto */
        "Anchieta",

        "Barros Filho",
        "Colégio",
        "Costa Barros",
        "Irajá",
        "Parque Colúmbia",
        "Vicente de Carvalho",
        "Vila Kosmos",
        "Vista Alegre"

      ],


      /* ================= 7ª CAS ================= */

      "7ª CAS": [

        "Anil",
        "Barra da Tijuca",
        "Camorim",
        "Cidade de Deus",
        "Colônia",
        "Curicica",

        /* Freguesia de Jacarepaguá é
           tratada separadamente */

        "Gardênia Azul",
        "Grumari",
        "Itanhangá",
        "Jacarepaguá",
        "Joá",
        "Pechincha",
        "Praça Seca",
        "Recreio dos Bandeirantes",
        "Tanque",
        "Taquara",
        "Vargem Grande",
        "Vargem Pequena",
        "Vila Valqueire"

      ],


      /* ================= 8ª CAS ================= */

      "8ª CAS": [

        "Bangu",
        "Campo dos Afonsos",
        "Deodoro",
        "Gericinó",
        "Jabour",
        "Jardim Sulacap",
        "Magalhães Bastos",
        "Padre Miguel",
        "Realengo",

        /* decisão do projeto */
        "Santíssimo",

        "Senador Camará",
        "Vila Militar"

      ],


      /* ================= 9ª CAS ================= */

      "9ª CAS": [

        "Campo Grande",
        "Cosmos",
        "Inhoaíba",
        "Senador Vasconcelos"

      ],


      /* ================= 10ª CAS ================= */

      "10ª CAS": [

        "Barra de Guaratiba",
        "Guaratiba",
        "Ilha de Guaratiba",
        "Paciência",
        "Pedra de Guaratiba",
        "Santa Cruz",
        "Sepetiba"

      ]

    };


    /* ==========================================================
       7. CRIA ÍNDICE NORMALIZADO
    ========================================================== */

    const INDICE = {};

    Object.keys(BAIRROS_CAS).forEach(function (cas) {

      BAIRROS_CAS[cas].forEach(function (bairro) {

        INDICE[normalizar(bairro)] = cas;

      });

    });


    /* ==========================================================
       8. REGRAS PRIORITÁRIAS

       Essas regras prevalecem sobre qualquer outra associação.
    ========================================================== */

    const AJUSTES_PRIORITARIOS = {

      "INHAUMA":       "3ª CAS",
      "TOMAS COELHO":  "3ª CAS",

      "PAVUNA":        "4ª CAS",
      "VILA DA PENHA": "4ª CAS",

      "MARIOPOLIS":    "5ª CAS",

      "ANCHIETA":      "6ª CAS",

      "SANTISSIMO":    "8ª CAS"

    };


    /* ==========================================================
       9. IDENTIFICA CAS DO BAIRRO

       O campo regiao_adm resolve a existência de duas
       Freguesias:
       - Ilha do Governador -> 4ª
       - Jacarepaguá -> 7ª
    ========================================================== */

    function identificarCAS(feature) {

      const p = feature.properties || {};

      const bairro = normalizar(p.nome);

      const ra = normalizar(p.regiao_adm);


      /* ajustes definidos pelo projeto */

      if (AJUSTES_PRIORITARIOS[bairro]) {

        return AJUSTES_PRIORITARIOS[bairro];

      }


      /* FREGUESIA */

      if (bairro === "FREGUESIA") {

        if (
          ra.includes("ILHA") ||
          ra.includes("GOVERNADOR")
        ) {

          return "4ª CAS";

        }

        return "7ª CAS";

      }


      /* grafias eventualmente diferentes */

      if (bairro === "PARQUE COLUMBIA") {
        return "6ª CAS";
      }


      if (bairro === "VICENTE DE CARVALHO") {
        return "6ª CAS";
      }


      if (
        bairro === "CAMPO DOS AFONSO" ||
        bairro === "CAMPO DOS AFONSOS"
      ) {
        return "8ª CAS";
      }


      if (
        bairro === "SENADOR CAMARA" ||
        bairro === "SENADOR CAMARA"
      ) {
        return "8ª CAS";
      }


      return INDICE[bairro] || null;

    }


    /* ==========================================================
       10. CARREGA TURF

       Turf será usado apenas para unir os bairros pertencentes
       à mesma CAS, eliminando as linhas internas entre bairros.
    ========================================================== */

    function carregarTurf() {

      return new Promise(function (resolve, reject) {

        if (window.turf) {
          resolve();
          return;
        }

        const script = document.createElement("script");

        script.src =
          "https://cdn.jsdelivr.net/npm/@turf/turf@7/turf.min.js";

        script.onload = resolve;

        script.onerror = function () {
          reject(
            new Error("Não foi possível carregar Turf.js.")
          );
        };

        document.head.appendChild(script);

      });

    }


    /* ==========================================================
       11. ENDEREÇO DA MALHA OFICIAL DOS BAIRROS

       Prefeitura do Rio / Instituto Pereira Passos

       outSR=4326:
       entrega longitude/latitude compatível com Leaflet.
    ========================================================== */

    const URL_BAIRROS =
      "https://pgeo3.rio.rj.gov.br/arcgis/rest/services/" +
      "Cartografia/Limites_administrativos/FeatureServer/4/query" +
      "?where=1%3D1" +
      "&outFields=nome%2Cregiao_adm%2Ccodbairro%2Ccodra" +
      "&returnGeometry=true" +
      "&outSR=4326" +
      "&f=geojson";


    /* ==========================================================
       12. INDICADOR DE CARREGAMENTO
    ========================================================== */

    const aviso = document.createElement("div");

    aviso.id = "statusTerritoriosCAS";

    aviso.style.cssText = [
      "position:absolute",
      "right:16px",
      "bottom:58px",
      "z-index:1800",
      "background:rgba(255,255,255,.96)",
      "border:1px solid #e5e7eb",
      "border-radius:999px",
      "padding:7px 11px",
      "box-shadow:0 5px 16px rgba(15,23,42,.10)",
      "font-size:11px",
      "color:#475569",
      "font-family:Inter,system-ui,sans-serif"
    ].join(";");

    aviso.textContent =
      "Carregando territórios das CAS…";

    document.body.appendChild(aviso);


    /* ==========================================================
       13. FUNÇÃO PARA UNIR POLÍGONOS DE UMA CAS
    ========================================================== */

    function unirFeatures(features, cas) {

      if (!features.length) {
        return null;
      }


      /* somente um bairro */

      if (features.length === 1) {

        const unico =
          JSON.parse(JSON.stringify(features[0]));

        unico.properties = {
          cas: cas
        };

        return unico;

      }


      /* Turf 7 */

      try {

        const fc =
          turf.featureCollection(features);

        const unido =
          turf.union(fc);

        if (unido) {

          unido.properties = {
            cas: cas
          };

          return unido;

        }

      } catch (erro) {

        console.warn(
          "União direta falhou em " + cas,
          erro
        );

      }


      /* fallback:
         tenta união progressiva */

      try {

        let acumulado = features[0];

        for (
          let i = 1;
          i < features.length;
          i++
        ) {

          try {

            const tentativa =
              turf.union(
                turf.featureCollection([
                  acumulado,
                  features[i]
                ])
              );

            if (tentativa) {
              acumulado = tentativa;
            }

          } catch (e) {

            /*
              Se uma ilha ou geometria separada causar
              problema, seguimos e depois usamos os bairros
              originais como fallback.
            */

          }

        }

        acumulado.properties = {
          cas: cas
        };

        return acumulado;

      } catch (erro) {

        return null;

      }

    }


    /* ==========================================================
       14. EXECUÇÃO
    ========================================================== */

    Promise
      .all([

        carregarTurf(),

        fetch(URL_BAIRROS)
          .then(function (resposta) {

            if (!resposta.ok) {

              throw new Error(
                "Erro HTTP " + resposta.status
              );

            }

            return resposta.json();

          })

      ])

      .then(function (resultado) {

        const geojson = resultado[1];


        if (
          !geojson ||
          !Array.isArray(geojson.features)
        ) {

          throw new Error(
            "A Prefeitura não retornou um GeoJSON válido."
          );

        }


        /* ======================================================
           15. AGRUPA BAIRROS POR CAS
        ====================================================== */

        const grupos = {

          "1ª CAS": [],
          "2ª CAS": [],
          "3ª CAS": [],
          "4ª CAS": [],
          "5ª CAS": [],
          "6ª CAS": [],
          "7ª CAS": [],
          "8ª CAS": [],
          "9ª CAS": [],
          "10ª CAS": []

        };


        const naoClassificados = [];


        geojson.features.forEach(function (feature) {

          const cas = identificarCAS(feature);

          if (cas) {

            feature.properties.cas_smas = cas;

            grupos[cas].push(feature);

          } else {

            naoClassificados.push({
              bairro:
                feature.properties &&
                feature.properties.nome,

              regiao:
                feature.properties &&
                feature.properties.regiao_adm
            });

          }

        });


        /* ======================================================
           16. DISSOLVE / UNIÃO

           Produz um polígono ou multipolígono para cada CAS.
        ====================================================== */

        const territorios = [];


        Object.keys(grupos).forEach(function (cas) {

          const unido =
            unirFeatures(
              grupos[cas],
              cas
            );

          if (unido) {

            territorios.push(unido);

          }

        });


        const resultadoCAS = {

          type: "FeatureCollection",

          features: territorios

        };


        /*
          Mantemos uma cópia global.

          Isso permite, inclusive, exportar depois
          o resultado para territorios-cas.geojson.
        */

        window.GEOJSON_TERRITORIOS_CAS =
          resultadoCAS;


        /* ======================================================
           17. CRIA A CAMADA LEAFLET
        ====================================================== */

        const camada =
          L.geoJSON(
            resultadoCAS,
            {

              pane: "territoriosCASPane",

              interactive: false,

              style: function (feature) {

                const cas =
                  feature.properties.cas;

                return {

                  color: "#475569",

                  weight: 1.15,

                  opacity: .90,

                  fillColor:
                    CORES_CAS[cas],

                  /*
                    Opacidade baixa para o CartoDB continuar
                    completamente legível.
                  */

                  fillOpacity: .36

                };

              }

            }
          );


        const grupo =
          L.layerGroup([
            camada
          ]);


        grupo.addTo(map);


        window.territoriosCASGroup =
          grupo;

        window.territoriosCASLayer =
          camada;


        /* ======================================================
           18. NÃO ALTERA O ZOOM

           Nenhum fitBounds / setView é executado.
        ====================================================== */


        /* ======================================================
           19. CAS ATUALMENTE SELECIONADA
        ====================================================== */

        function obterCASAtiva() {

          const btn =
            document.querySelector(
              ".cas-btn.active"
            );

          return btn
            ? btn.textContent.trim()
            : "TODAS";

        }


        /* ======================================================
           20. DESTAQUE AO FILTRAR POR CAS
        ====================================================== */

        function atualizarTerritorios() {

          const ativa =
            obterCASAtiva();


          camada.eachLayer(
            function (layer) {

              const cas =
                layer.feature.properties.cas;


              /* TODAS */

              if (ativa === "TODAS") {

                layer.setStyle({

                  color: "#475569",

                  weight: 1.15,

                  opacity: .90,

                  fillColor:
                    CORES_CAS[cas],

                  fillOpacity: .36

                });

              }


              /* CAS selecionada */

              else if (cas === ativa) {

                layer.setStyle({

                  color: "#334155",

                  weight: 2.2,

                  opacity: .9,

                  fillColor:
                    CORES_CAS[cas],

                  fillOpacity: .52

                });

              }


              /* demais CAS */

              else {

                layer.setStyle({

                  color: "#94a3b8",

                  weight: .5,

                  opacity: .15,

                  fillColor:
                    CORES_CAS[cas],

                  fillOpacity: .035

                });

              }

            }
          );

        }


        window.atualizarTerritoriosCAS =
          atualizarTerritorios;


        /* ======================================================
           21. INTEGRA COM OS BOTÕES "FILTRAR POR CAS"

           Não substitui seu onclick atual.
           Apenas acrescenta o destaque territorial.
        ====================================================== */

        document
          .querySelectorAll(".cas-btn")
          .forEach(function (btn) {

            btn.addEventListener(
              "click",
              function () {

                setTimeout(
                  atualizarTerritorios,
                  20
                );

              }
            );

          });


        /* ======================================================
           22. CHECKBOX "TERRITÓRIOS DAS CAS"

           Não recebe data-type para não interferir com
           o applyFilters() dos equipamentos.
        ====================================================== */

        const secaoCamadas =
          document.querySelector(
            ".sidebar .section"
          );


        if (
          secaoCamadas &&
          !document.getElementById(
            "toggleTerritoriosCASReal"
          )
        ) {

          const linha =
            document.createElement("div");

          linha.className = "check";

          linha.innerHTML =

            '<label>' +

              '<input ' +
                'type="checkbox" ' +
                'id="toggleTerritoriosCASReal" ' +
                'checked' +
              '>' +

              '<span>' +

                '<i class="dot" ' +
                'style="' +
                  'background:linear-gradient(' +
                    '135deg,' +
                    '#F2DF3A,' +
                    '#765184,' +
                    '#4F9F69' +
                  ');' +
                  'border:1px solid #94a3b8;' +
                '">' +
                '</i> ' +

                'Territórios das CAS' +

              '</span>' +

            '</label>';


          secaoCamadas.appendChild(
            linha
          );


          document
            .getElementById(
              "toggleTerritoriosCASReal"
            )
            .addEventListener(
              "change",
              function () {

                if (this.checked) {

                  if (!map.hasLayer(grupo)) {

                    grupo.addTo(map);

                  }

                  atualizarTerritorios();

                }

                else {

                  if (map.hasLayer(grupo)) {

                    map.removeLayer(grupo);

                  }

                }

              }
            );

        }


        /* ======================================================
           23. PRIMEIRA ATUALIZAÇÃO
        ====================================================== */

        atualizarTerritorios();


        /* ======================================================
           24. DIAGNÓSTICO

           Caso algum bairro oficial da Prefeitura não tenha
           correspondência na planilha, ele será listado aqui.
        ====================================================== */

        console.group(
          "Territórios CAS — diagnóstico"
        );


        Object.keys(grupos).forEach(function (cas) {

          console.log(
            cas + ":",
            grupos[cas].map(
              function (f) {
                return f.properties.nome;
              }
            )
          );

        });


        if (naoClassificados.length) {

          console.warn(
            "Bairros oficiais ainda não classificados:",
            naoClassificados
          );

        } else {

          console.log(
            "Todos os bairros foram classificados."
          );

        }


        console.log(
          "GeoJSON final disponível em:",
          "window.GEOJSON_TERRITORIOS_CAS"
        );


        console.groupEnd();


        /* ======================================================
           25. STATUS
        ====================================================== */

        aviso.textContent =
          territorios.length +
          " territórios CAS carregados";


        setTimeout(function () {
          aviso.remove();
        }, 2200);

      })


      .catch(function (erro) {

        console.error(
          "Erro ao carregar territórios das CAS:",
          erro
        );


        aviso.textContent =
          "Erro ao carregar territórios das CAS";


        aviso.style.color =
          "#b91c1c";


        setTimeout(function () {
          aviso.remove();
        }, 6000);

      });

  }


  /* ============================================================
     26. EXECUTA
  ============================================================ */

  if (document.readyState === "loading") {

    document.addEventListener(
      "DOMContentLoaded",
      iniciarTerritoriosCAS
    );

  } else {

    iniciarTerritoriosCAS();

  }

})();
