# WebGIS - Diagnóstico dos Resíduos Sólidos na Paraíba

Este projeto é um WebGIS desenvolvido pela SubGerência de Geoprocessamento para apoiar a Gestão dos Resíduos Sólidos no Estado da Paraíba.

## 🗺️ Funcionalidades

- **Múltiplos Basemaps**: OpenStreetMap, Imagem de Satélite e Mapa Topográfico
- **Camadas Temáticas**:
  - Paraíba (Regional)
  - Municípios com Aterro Sanitário
  - Destinação dos Resíduos Sólidos
  - Municípios com ETT
  - Municípios com PRADS
  - Municípios com UGIRSU
- **Legendas Dinâmicas**: Aparecem automaticamente ao ativar camadas
- **Geolocalização**: Busca por coordenadas ou nome de município
- **Interface Responsiva**: Sidebar informativa com dados institucionais

## 🛠️ Tecnologias Utilizadas

- **Leaflet.js**: Biblioteca para mapas interativos
- **HTML5/CSS3**: Interface e estilização
- **JavaScript**: Lógica de interação e controle de camadas
- **GeoJSON**: Dados geográficos dos municípios da Paraíba

## 📁 Estrutura do Projeto

```
webmaps-cursor/
├── index.html          # Página principal
├── script.js           # Lógica JavaScript
├── README.md           # Documentação
└── dados/              # Dados GeoJSON
    ├── pb.geojson
    ├── municipios-aterro.geojson
    ├── municipios-destinacao.geojson
    ├── municipios-ett.geojson
    ├── municipios-prads.geojson
    └── municipios-ugirsu.geojson
```

## 🚀 Como Usar

1. Clone o repositório
2. Abra o arquivo `index.html` em um navegador web
3. Utilize os controles na sidebar para ativar/desativar camadas
4. Use o campo de geolocalização para buscar locais específicos

## 👥 Equipe Técnica

- **Gerência Executiva de Mudanças e Adaptação Climática**
- **Gerência Executiva de Resíduos Sólidos**
- **SubGerência de Geoprocessamento**

## 📄 Licença

Este projeto foi desenvolvido para uso institucional da Paraíba.

---

**Desenvolvido e Elaborado por:** SubGerência de Geoprocessamento 