Mapa da Rede Socioassistencial do Rio de Janeiro

Este repositório reúne o mapa interativo da rede socioassistencial do município do Rio de Janeiro. A página apresenta as CAS, CRAS, CREAS, unidades de acolhimento, serviços complementares e agências do INSS, com busca, filtros por tipo e CAS e painel com informações de cada unidade.

Os dados cadastrais e as coordenadas dos equipamentos ficam em um arquivo CSV dentro da pasta dados/. O index.html carrega esse arquivo ao iniciar e converte cada linha em um ponto do mapa. Os limites territoriais das dez CAS e os ajustes específicos continuam documentados nas seções correspondentes do código.

Estrutura do repositório

mapeamento_smas/
├── dados/
│   └── mapeamento_smas.csv
├── Readme.md
└── index.html

Atualizar os dados dos equipamentos

Abra dados/mapeamento_smas.csv no Excel, LibreOffice Calc ou Google Sheets.

Atualize as linhas dos equipamentos ou acrescente novas linhas.

Mantenha os campos em uma única linha cada, sem quebras de linha dentro das células. Preserve os nomes e a ordem das colunas existentes. Os campos necessários para marcar um ponto são nome, tipo, latitude_aproximada e longitude_aproximada.

Salve ou exporte o arquivo como CSV UTF-8 separado por vírgulas, mantendo o nome mapeamento_smas.csv e a pasta dados/.

Confira se latitude e longitude estão preenchidas como números decimais e se os novos registros aparecem no mapa.

Envie o CSV atualizado e, se necessário, o index.html para o GitHub.

O código reconhece os tipos CADRio, CONTUTELAR e CENTROPOP e os ajusta aos nomes utilizados pelos filtros do mapa. Outros tipos devem ser escritos de forma consistente com os filtros e cores definidos no início da etapa 04 do index.html.

Se o navegador continuar mostrando uma versão antiga do arquivo após a atualização, altere o número de versão em DATA_URL, na etapa 04 do index.html (por exemplo, de ?v=1 para ?v=2).

Organização do código

O index.html está dividido em etapas numeradas para orientar futuras alterações:

01–03: metadados, aparência e interface do mapa;

04: endereço do CSV, leitura e validação dos dados, marcadores, busca e filtros;

05–06: camadas complementares e normalização dos filtros;

07: adaptação para celulares;

08–09: territórios das CAS e ajustes de abrangência;

10: carregamento inicial e controle de acesso.

Para atualizar nomes, endereços, tipos e coordenadas, edite o CSV. Use o código para alterar a apresentação, as regras de filtragem e os territórios.

Abrir o mapa para testar

Como a página carrega o CSV com fetch(), teste o projeto por um servidor local, como a extensão Live Server do VS Code, ou pelo GitHub Pages. Abrir o index.html diretamente como arquivo local (file://) pode bloquear o carregamento dos dados.

Dados incluídos

A base contém 156 pontos. A cópia da planilha inicial tinha 136 registros; os 20 pontos de agências do INSS que já apareciam no mapa foram incluídos no CSV para que a migração para a nova estrutura preserve as camadas existentes. A coluna fonte ajuda a identificar essa complementação.
