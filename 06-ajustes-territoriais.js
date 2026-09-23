/* Etapa 06-ajustes-territoriais: lógica preservada do mapa original. Consulte README.md para atualização dos dados. */

(function(){

  if(window.__CAS_CORRECAO_GEOMETRICA_V1__){
    return;
  }

  window.__CAS_CORRECAO_GEOMETRICA_V1__ = true;


  /* ============================================================
     1. AGUARDA A CAMADA PRINCIPAL ESTAR PRONTA
  ============================================================ */

  function aguardarCamada(){

    if(
      typeof L === "undefined" ||
      typeof map === "undefined" ||
      typeof turf === "undefined" ||
      !window.GEOJSON_TERRITORIOS_CAS ||
      !window.territoriosCASGroup
    ){

      setTimeout(
        aguardarCamada,
        300
      );

      return;

    }


    executarCorrecao();

  }


  /* ============================================================
     2. CORES — AS MESMAS DO SCRIPT PRINCIPAL
  ============================================================ */

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


  /* ============================================================
     3. PONTOS INTERNOS DOS 5 BAIRROS

     formato:
     longitude, latitude

     O nome aqui serve SOMENTE para diagnóstico.
     A localização do polígono é espacial.
  ============================================================ */

  const CORRECOES = [

    {
      nome: "São Cristóvão",

      cas: "1ª CAS",

      lon: -43.22539,

      lat: -22.90033
    },


    {
      nome: "Oswaldo Cruz",

      cas: "5ª CAS",

      lon: -43.35000,

      lat: -22.87056
    },


    {
      nome: "Freguesia (Jacarepaguá)",

      cas: "7ª CAS",

      lon: -43.33308,

      lat: -22.92234
    },


    {
      nome: "Barra Olímpica",

      cas: "7ª CAS",

      lon: -43.38672,

      lat: -22.97135
    },


    {
      nome: "Vila Kennedy",

      cas: "8ª CAS",

      lon: -43.48833,

      lat: -22.86056
    }

  ];


  /* ============================================================
     4. SERVIÇO OFICIAL DOS BAIRROS
  ============================================================ */

  const BASE_URL =

    "https://pgeo3.rio.rj.gov.br/" +

    "arcgis/rest/services/" +

    "Cartografia/Limites_administrativos/" +

    "FeatureServer/4/query";


  /* ============================================================
     5. CONSULTA ESPACIAL

     Em vez de procurar:

     nome = "São Cristóvão"

     perguntamos:

     "qual polígono contém este ponto?"

     Isto elimina definitivamente os problemas de nomenclatura.
  ============================================================ */

  function buscarPoligono(item){

    const params =
      new URLSearchParams();


    params.set(
      "geometry",
      item.lon + "," + item.lat
    );


    params.set(
      "geometryType",
      "esriGeometryPoint"
    );


    params.set(
      "inSR",
      "4326"
    );


    params.set(
      "spatialRel",
      "esriSpatialRelIntersects"
    );


    params.set(
      "outFields",
      "*"
    );


    params.set(
      "returnGeometry",
      "true"
    );


    params.set(
      "outSR",
      "4326"
    );


    params.set(
      "f",
      "geojson"
    );


    const url =
      BASE_URL +
      "?" +
      params.toString();


    return fetch(url)

      .then(function(response){

        if(!response.ok){

          throw new Error(
            "HTTP " +
            response.status +
            " — " +
            item.nome
          );

        }


        return response.json();

      })


      .then(function(data){

        if(
          !data ||
          !Array.isArray(data.features) ||
          data.features.length === 0
        ){

          throw new Error(
            "Nenhum polígono encontrado para " +
            item.nome
          );

        }


        /*
          Como o ponto está dentro do bairro,
          pegamos a primeira geometria retornada.
        */

        const feature =
          JSON.parse(
            JSON.stringify(
              data.features[0]
            )
          );


        feature.properties =
          Object.assign(
            {},
            feature.properties,
            {

              cas_destino:
                item.cas,

              correcao_nome:
                item.nome

            }
          );


        return {

          item: item,

          feature: feature

        };

      });

  }


  /* ============================================================
     6. FUNÇÃO DE UNIÃO

     Agora uniremos:

     CAS já pronta
          +
     UM bairro

      ============================================================ */

  function unirNaCAS(
    casFeature,
    bairroFeature,
    cas
  ){

    try{

      const resultado =
        turf.union(

          turf.featureCollection([

            casFeature,

            bairroFeature

          ])

        );


      if(!resultado){

        throw new Error(
          "Turf retornou geometria vazia."
        );

      }


      resultado.properties = {

        cas: cas

      };


      return resultado;

    }


    catch(erro){

      console.error(
        "Falha ao integrar geometria em " +
        cas,
        erro
      );


      /*
        Se houver falha real, NÃO desenhamos
        um patch estranho por cima.

        Mantemos a geometria anterior.
      */

      return casFeature;

    }

  }


  /* ============================================================
     7. EXECUÇÃO
  ============================================================ */

  function executarCorrecao(){


    Promise.all(

      CORRECOES.map(
        buscarPoligono
      )

    )


    .then(function(resultados){


      /* ========================================================
         8. CLONA A COLEÇÃO QUE JÁ ESTÁ FUNCIONANDO
      ======================================================== */

      const corrigido =
        JSON.parse(
          JSON.stringify(
            window.GEOJSON_TERRITORIOS_CAS
          )
        );


      /* ========================================================
         9. LOCALIZA A FEATURE DE CADA CAS
      ======================================================== */

      function indiceDaCAS(cas){

        return corrigido.features.findIndex(
          function(feature){

            return (
              feature.properties &&
              feature.properties.cas === cas
            );

          }
        );

      }


      /* ========================================================
         10. INTEGRA CADA BAIRRO À SUA CAS
      ======================================================== */

      resultados.forEach(
        function(resultado){

          const item =
            resultado.item;


          const bairro =
            resultado.feature;


          const indice =
            indiceDaCAS(
              item.cas
            );


          if(indice === -1){

            console.error(
              "CAS não encontrada:",
              item.cas
            );

            return;

          }


          const casAtual =
            corrigido.features[
              indice
            ];


          const casNova =
            unirNaCAS(

              casAtual,

              bairro,

              item.cas

            );


          corrigido.features[
            indice
          ] = casNova;


          console.log(

            "Integrado:",

            item.nome,

            "→",

            item.cas,

            "| bairro encontrado na base:",

            bairro.properties &&
            bairro.properties.nome

          );

        }
      );


      /* ========================================================
         11. REMOVE A CAMADA TERRITORIAL ANTIGA
      ======================================================== */

      try{

        if(
          window.territoriosCASGroup &&
          map.hasLayer(
            window.territoriosCASGroup
          )
        ){

          map.removeLayer(
            window.territoriosCASGroup
          );

        }

      }
      catch(e){}


      /* ========================================================
         12. CRIA A NOVA CAMADA

         Agora os bairros fazem PARTE da geometria da CAS.

      ======================================================== */

      const camadaCorrigida =
        L.geoJSON(
          corrigido,
          {

            pane:
              "territoriosCASPane",

            interactive:
              false,


            style:
              function(feature){

                const cas =
                  feature.properties.cas;


                return {

                  color:
                    "#475569",

                  weight:
                    1.15,

                  opacity:
                    .62,

                  fillColor:
                    CORES_CAS[cas],

                  fillOpacity:
                    .20

                };

              }

          }
        );


      const grupoCorrigido =
        L.layerGroup([

          camadaCorrigida

        ]);


      grupoCorrigido.addTo(
        map
      );


      /* ========================================================
         13. SUBSTITUI AS REFERÊNCIAS GLOBAIS

         A partir daqui, esta passa a ser a camada oficial
         utilizada pelo mapa.
      ======================================================== */

      window.GEOJSON_TERRITORIOS_CAS =
        corrigido;


      window.territoriosCASLayer =
        camadaCorrigida;


      window.territoriosCASGroup =
        grupoCorrigido;


      /* ========================================================
         14. FILTRO POR CAS
      ======================================================== */

      function obterCASAtiva(){

        const ativo =
          document.querySelector(
            ".cas-btn.active"
          );


        return ativo
          ? ativo.textContent.trim()
          : "TODAS";

      }


      function atualizarCorrigido(){

        const ativa =
          obterCASAtiva();


        camadaCorrigida.eachLayer(
          function(layer){

            const cas =
              layer
                .feature
                .properties
                .cas;


            /* TODAS */

            if(
              ativa === "TODAS"
            ){

              layer.setStyle({

                color:
                  "#475569",

                weight:
                  1.15,

                opacity:
                  .62,

                fillColor:
                  CORES_CAS[cas],

                fillOpacity:
                  .20

              });

            }


            /* CAS SELECIONADA */

            else if(
              ativa === cas
            ){

              layer.setStyle({

                color:
                  "#334155",

                weight:
                  2.2,

                opacity:
                  .9,

                fillColor:
                  CORES_CAS[cas],

                fillOpacity:
                  .34

              });

            }


            /* DEMAIS */

            else{

              layer.setStyle({

                color:
                  "#94a3b8",

                weight:
                  .5,

                opacity:
                  .15,

                fillColor:
                  CORES_CAS[cas],

                fillOpacity:
                  .035

              });

            }

          }
        );

      }


      window.atualizarTerritoriosCAS =
        atualizarCorrigido;


      /* ========================================================
         15. BOTÕES CAS

         Acrescentamos apenas a atualização da nova camada.
      ======================================================== */

      document
        .querySelectorAll(
          ".cas-btn"
        )
        .forEach(
          function(btn){

            btn.addEventListener(
              "click",
              function(){

                setTimeout(
                  atualizarCorrigido,
                  25
                );

              }
            );

          }
        );


      /* ========================================================
         16. CORRIGE O CHECKBOX

         Clonamos o checkbox para remover os listeners antigos
         e ligamos somente a camada corrigida.
      ======================================================== */

      const checkboxAntigo =
        document.getElementById(
          "toggleTerritoriosCASReal"
        );


      if(checkboxAntigo){

        const checkboxNovo =
          checkboxAntigo.cloneNode(
            true
          );


        checkboxAntigo
          .parentNode
          .replaceChild(

            checkboxNovo,

            checkboxAntigo

          );


        checkboxNovo.addEventListener(
          "change",
          function(){


            if(this.checked){

              if(
                !map.hasLayer(
                  grupoCorrigido
                )
              ){

                grupoCorrigido.addTo(
                  map
                );

              }


              atualizarCorrigido();

            }


            else{

              if(
                map.hasLayer(
                  grupoCorrigido
                )
              ){

                map.removeLayer(
                  grupoCorrigido
                );

              }

            }

          }
        );

      }


      /* ========================================================
         17. ESTADO INICIAL
      ======================================================== */

      atualizarCorrigido();


      /* ========================================================
         18. DIAGNÓSTICO
      ======================================================== */

      console.group(
        "CORREÇÃO GEOMÉTRICA DAS CAS"
      );


      resultados.forEach(
        function(resultado){

          console.log(

            resultado.item.nome,

            "→",

            resultado.item.cas,

            "| polígono identificado:",

            resultado.feature
              .properties &&
            resultado.feature
              .properties.nome

          );

        }
      );


      console.log(

        "Total de territórios finais:",

        corrigido.features.length

      );


      console.log(

        "GeoJSON corrigido:",

        corrigido

      );


      console.groupEnd();

    })


    .catch(function(erro){

      console.error(

        "ERRO NA CORREÇÃO GEOMÉTRICA DAS CAS:",

        erro

      );

    });

  }


  /* ============================================================
     19. INÍCIO
  ============================================================ */

  if(
    document.readyState ===
    "loading"
  ){

    document.addEventListener(
      "DOMContentLoaded",
      aguardarCamada
    );

  }

  else{

    aguardarCamada();

  }

})();
