# Mapa da Rede Socioassistencial — SMAS-Rio

Versão organizada do mapa interativo, com a planilha como fonte principal dos equipamentos. O navegador lê o arquivo `data/equipamentos.js`; esse arquivo é gerado a partir de `data/mapeamento_smas.xlsx`.

## Estrutura do projeto

```text
mapa_smas_refatorado/
├── index.html                 # Interface e ordem de carregamento
├── css/
│   └── mapa.css               # Estilos e regras para dispositivos móveis
├── data/
│   ├── mapeamento_smas.xlsx   # Base que deve ser atualizada
│   └── equipamentos.js       # Dados derivados; gerados pelo script
├── js/
│   ├── 01-mapa-principal.js
│   ├── 02-camadas-complementares.js
│   ├── 03-normalizacao-filtros.js
│   ├── 04-mobile.js
│   ├── 05-territorios-cas.js
│   ├── 06-ajustes-territoriais.js
│   ├── 07-ajuste-sexta-cas.js
│   └── 08-acesso.js
└── scripts/
    └── gerar_dados.py          # Converte e valida a planilha
```

Os números no começo dos arquivos JavaScript indicam a ordem de carregamento. Os comentários no `index.html` e no início de cada arquivo mostram a etapa correspondente. Os polígonos das CAS e os ajustes territoriais continuam em arquivos próprios.

## Como atualizar os equipamentos

1. Abra `data/mapeamento_smas.xlsx` e edite a aba **Equipamentos**.
2. Mantenha os nomes das colunas e preencha, para cada ponto, `tipo`, `nome`, `latitude_aproximada` e `longitude_aproximada`.
3. Salve a planilha.
4. Na pasta raiz do projeto, gere novamente os dados do mapa:

   ```bash
   python -m pip install -r requirements.txt
   python scripts/gerar_dados.py
   ```

5. Confira a mensagem com o total de registros gerados e teste o mapa em um servidor local ou no GitHub Pages.
6. Envie para o GitHub a planilha atualizada e o arquivo `data/equipamentos.js` regenerado.

O script interrompe a geração e aponta a linha quando encontra campos obrigatórios ausentes, coordenadas inválidas ou valores fora do intervalo permitido. Os tipos `CADRio`, `CONTUTELAR` e `CENTROPOP` são convertidos para as chaves usadas pelos filtros do mapa.

> **Atenção:** editar apenas `data/equipamentos.js` não é suficiente. Na próxima geração, ele será substituído pela planilha.

## Conteúdo migrado

A planilha recebida continha 136 linhas de equipamentos. O mapa atual também exibia 20 agências do INSS ausentes da planilha. Esses 20 registros foram acrescentados à cópia da planilha incluída aqui, com a fonte marcada como **Mapa atual (complemento de migração)**. A base resultante tem 156 pontos e preserva também os demais registros que já estavam na planilha.

## Executar localmente

Abra a pasta pelo VS Code e inicie um servidor estático (por exemplo, a extensão Live Server). A página depende do Leaflet, das fontes externas do mapa e dos tiles cartográficos, portanto precisa de conexão à internet para exibir o mapa-base. Acesso por `file://` pode bloquear recursos do navegador.

## O que alterar em cada caso

- **Endereço, coordenadas, nome, tipo ou abrangência de equipamento:** planilha e geração de `equipamentos.js`.
- **Cores, marcadores, filtros ou detalhes exibidos:** arquivos `js/01` a `js/03`.
- **Aparência:** `css/mapa.css`.
- **Polígonos e distribuição territorial das CAS:** `js/05` a `js/07`.
- **Tela de senha:** `js/08-acesso.js`.
