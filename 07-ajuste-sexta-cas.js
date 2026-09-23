/* Etapa 07-ajuste-sexta-cas: lógica preservada do mapa original. Consulte README.md para atualização dos dados. */

/* ============================================================
   09.2 — AJUSTE GEOMÉTRICO DA 6ª CAS

   Pavuna
   Costa Barros
   Barros Filho
   Anchieta

   Este script:
   1. encontra os polígonos oficiais desses 4 bairros;
   2. remove cada polígono de qualquer outra CAS;
   3. incorpora todos à 6ª CAS;
   4. substitui a camada territorial existente.

  =============================================================== */

(function(){

  if (window.__CORRECAO_REAL_6CAS_V1__) return;
  window.__CORRECAO_REAL_6CAS_V1__ = true;


  function aguardar(){

    if (
      typeof L === "undefined" ||
      typeof map === "undefined" ||
      typeof turf === "undefined" ||
      !window.GEOJSON_TERRITORIOS_CAS
    ){
      setTimeout(aguardar, 300);
      return;
    }

    corrigir();
  }


  const CORES_CAS = {
    "1ª CAS":"#F2DF3A",
    "2ª CAS":"#62C6C2",
    "3ª CAS":"#A8CD45",
    "4ª CAS":"#E6786E",
    "5ª CAS":"#D6A600",
    "6ª CAS":"#B487C0",
    "7ª CAS":"#765184",
    "8ª CAS":"#E28B45",
    "9ª CAS":"#B8D83D",
    "10ª CAS":"#4F9F69"
  };


  function normalizar(v){
    return String(v || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g,"")
      .replace(/\s+/g," ")
      .trim()
      .toUpperCase();
  }


  const ALVOS = new Set([
    "PAVUNA",
    "COSTA BARROS",
    "BARROS FILHO",
    "ANCHIETA"
  ]);


  const URL =
    "https://pgeo3.rio.rj.gov.br/arcgis/rest/services/" +
    "Cartografia/Limites_administrativos/FeatureServer/4/query" +
    "?where=1%3D1" +
    "&outFields=*" +
    "&returnGeometry=true" +
    "&outSR=4326" +
    "&f=geojson";


  function corrigir(){

    fetch(URL)

      .then(function(r){

        if (!r.ok){
          throw new Error("HTTP " + r.status);
        }

        return r.json();

      })

      .then(function(malha){

        /* =====================================================
           1. LOCALIZA OS 4 BAIRROS OFICIAIS
        ===================================================== */

        const bairros = malha.features.filter(function(f){

          const nome = normalizar(
            f.properties && f.properties.nome
          );

          return ALVOS.has(nome);

        });


        console.log(
          "Bairros encontrados para a 6ª CAS:",
          bairros.map(f => f.properties.nome)
        );


        if (bairros.length !== 4){

          console.warn(
            "Esperávamos 4 bairros, mas foram encontrados:",
            bairros.length
          );

        }


        /* =====================================================
           2. CLONA O GEOJSON FINAL ATUAL
        ===================================================== */

        const corrigido = JSON.parse(
          JSON.stringify(
            window.GEOJSON_TERRITORIOS_CAS
          )
        );


        /* =====================================================
           3. LOCALIZA A 6ª CAS
        ===================================================== */

        let indice6 = corrigido.features.findIndex(function(f){

          return (
            f.properties &&
            f.properties.cas === "6ª CAS"
          );

        });


        if (indice6 === -1){

          throw new Error(
            "6ª CAS não encontrada no GeoJSON atual."
          );

        }


        /* =====================================================
           4. PARA CADA BAIRRO:

           - SUBTRAI DE TODAS AS OUTRAS CAS
           - UNE À 6ª CAS
        ===================================================== */

        bairros.forEach(function(bairro){

          /* -----------------------------------------------
             REMOVE O BAIRRO DAS OUTRAS 9 CAS
          ----------------------------------------------- */

          corrigido.features.forEach(function(feature, i){

            if (i === indice6) return;

            try{

              const resultado =
                turf.difference(
                  turf.featureCollection([
                    feature,
                    bairro
                  ])
                );


              if (resultado){

                resultado.properties = {
                  cas: feature.properties.cas
                };

                corrigido.features[i] = resultado;

              }

            }

            catch(e){

              console.warn(
                "Não foi necessário/possível subtrair",
                bairro.properties.nome,
                "de",
                feature.properties.cas
              );

            }

          });


          /* -----------------------------------------------
             ADICIONA À 6ª CAS
          ----------------------------------------------- */

          try{

            const atual6 =
              corrigido.features[indice6];


            const unido =
              turf.union(
                turf.featureCollection([
                  atual6,
                  bairro
                ])
              );


            if (unido){

              unido.properties = {
                cas: "6ª CAS"
              };

              corrigido.features[indice6] =
                unido;

            }

          }

          catch(e){

            console.error(
              "Erro ao integrar",
              bairro.properties.nome,
              "à 6ª CAS:",
              e
            );

          }

        });


        /* =====================================================
           5. REMOVE CAMADAS/PATCHES TERRITORIAIS ANTIGOS
        ===================================================== */

        [
          "territoriosCASGroup",
          "patch6CAS",
          "patchBuracosCAS",
          "patchFillCAS",
          "camadaPatchCASBuracos",
          "camadaCorrecaoCAS",
          "correcoesTerritoriaisCAS"
        ].forEach(function(nome){

          try{

            const l = window[nome];

            if (
              l &&
              map.hasLayer(l)
            ){
              map.removeLayer(l);
            }

          }
          catch(e){}

        });


        /* =====================================================
           6. CRIA NOVA CAMADA TERRITORIAL
        ===================================================== */

        const novaCamada =
          L.geoJSON(
            corrigido,
            {

              pane:"territoriosCASPane",

              interactive:false,

              style:function(feature){

                const cas =
                  feature.properties.cas;

                return {
                  color:"#475569",
                  weight:1.15,
                  opacity:.90,
                  fillColor:CORES_CAS[cas],
                  fillOpacity:.36
                };

              }

            }
          );


        const novoGrupo =
          L.layerGroup([
            novaCamada
          ]);


        novoGrupo.addTo(map);


        /* =====================================================
           7. SUBSTITUI AS VARIÁVEIS GLOBAIS
        ===================================================== */

        window.GEOJSON_TERRITORIOS_CAS =
          corrigido;

        window.territoriosCASLayer =
          novaCamada;

        window.territoriosCASGroup =
          novoGrupo;


        /* =====================================================
           8. FILTRO POR CAS
        ===================================================== */

        function getCASAtiva(){

          const btn =
            document.querySelector(
              ".cas-btn.active"
            );

          return btn
            ? btn.textContent.trim()
            : "TODAS";

        }


        function atualizar(){

          const ativa =
            getCASAtiva();


          novaCamada.eachLayer(function(layer){

            const cas =
              layer.feature.properties.cas;


            if (ativa === "TODAS"){

              layer.setStyle({
                color:"#475569",
                weight:1.15,
                opacity:.90,
                fillColor:CORES_CAS[cas],
                fillOpacity:.36
              });

            }


            else if (ativa === cas){

              layer.setStyle({
                color:"#334155",
                weight:2.2,
                opacity:.9,
                fillColor:CORES_CAS[cas],
                fillOpacity:.52
              });

            }


            else{

              layer.setStyle({
                color:"#94a3b8",
                weight:.5,
                opacity:.15,
                fillColor:CORES_CAS[cas],
                fillOpacity:.035
              });

            }

          });

        }


        window.atualizarTerritoriosCAS =
          atualizar;


        document
          .querySelectorAll(".cas-btn")
          .forEach(function(btn){

            btn.addEventListener(
              "click",
              function(){

                setTimeout(
                  atualizar,
                  20
                );

              }
            );

          });


        /* =====================================================
           9. CHECKBOX TERRITÓRIOS DAS CAS
        ===================================================== */

        const check =
          document.getElementById(
            "toggleTerritoriosCASReal"
          );


        if (check){

          check.addEventListener(
            "change",
            function(){

              if (this.checked){

                if (
                  !map.hasLayer(novoGrupo)
                ){
                  novoGrupo.addTo(map);
                }

                atualizar();

              }

              else{

                if (
                  map.hasLayer(novoGrupo)
                ){
                  map.removeLayer(novoGrupo);
                }

              }

            }
          );

        }


        atualizar();


        console.log(
          "CORREÇÃO 6ª CAS CONCLUÍDA:",
          [
            "Pavuna",
            "Costa Barros",
            "Barros Filho",
            "Anchieta"
          ]
        );

      })


      .catch(function(erro){

        console.error(
          "Erro na correção real da 6ª CAS:",
          erro
        );

      });

  }


  if (
    document.readyState === "loading"
  ){

    document.addEventListener(
      "DOMContentLoaded",
      aguardar
    );

  }

  else{

    aguardar();

  }

})();
