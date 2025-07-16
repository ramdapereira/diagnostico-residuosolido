// Inicialização do mapa
let map;
let currentBasemap = 'satellite';
let pbLayer = null;
let aterroLayer = null;
let destinacaoLayer = null;
let ettLayer = null;
let pradsLayer = null;
let ugirsuLayer = null;
let cooperativasLayer = null;

// Definição dos 3 basemaps
const basemaps = {
    osm: L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
    }),
    satellite: L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: '© Esri — Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
        maxZoom: 19
    }),
    terrain: L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenTopoMap contributors',
        maxZoom: 17
    })
};

// Função para inicializar o mapa
function initMap() {
    // Centralizar na Paraíba
    map = L.map('map', {
        center: [-7.2399, -36.7819], // Centro aproximado da Paraíba
        zoom: 8,
        layers: [basemaps.satellite]
    });

    // Adicionar controle de escala
    L.control.scale().addTo(map);
    
    // Carregar camada pb.geojson
    loadPBGeoJSON();
    loadAterroGeoJSON();
    loadDestinacaoGeoJSON();
    loadETTGeoJSON();
    loadPRADSGeoJSON();
    loadUGIRSUGeoJSON();
    loadCooperativasGeoJSON();
    
    // Configurar eventos dos basemaps
    setupSimpleBasemapControls();
    setupLayerToggles();

    // Ativar o botão correto ao carregar
    setActiveBasemapBtn('satellite');
}

// Função para carregar pb.geojson
function loadPBGeoJSON() {
    fetch('dados/pb.geojson')
        .then(response => response.json())
        .then(data => {
            // 1. Identificar valores únicos da coluna REGIONAL
            const cores = [
                '#1b9e77', // verde
                '#d95f02', // laranja
                '#7570b3', // roxo
                '#e7298a', // magenta
                '#66a61e', // verde oliva
                '#e6ab02', // amarelo mostarda
                '#a6761d', // marrom claro
                '#666666', // cinza
                '#1f78b4', // azul
                '#b15928'  // marrom escuro
            ];
            const valorSet = new Set();
            const countPorRegional = {};
            data.features.forEach(f => {
                if (f.properties && f.properties.REGIONAL) {
                    valorSet.add(f.properties.REGIONAL);
                    countPorRegional[f.properties.REGIONAL] = (countPorRegional[f.properties.REGIONAL] || 0) + 1;
                }
            });
            const valoresUnicos = Array.from(valorSet);
            // 2. Mapear valor => cor
            const corPorValor = {};
            valoresUnicos.forEach((valor, idx) => {
                corPorValor[valor] = cores[idx % cores.length];
            });
            // 3. Criar camada com estilo categórico
            pbLayer = L.geoJSON(data, {
                style: function(feature) {
                    const valor = feature.properties && feature.properties.REGIONAL;
                    return {
                        color: '#4F4F4F',
                        weight: 1,
                        fillColor: corPorValor[valor] || '#bdbdbd',
                        fillOpacity: 0.85
                    };
                },
                onEachFeature: function(feature, layer) {
                    let popup = '';
                    if (feature.properties) {
                        if (feature.properties.NM_MUN) {
                            popup += `<strong>NM_MUN:</strong> ${feature.properties.NM_MUN}<br/>`;
                        }
                        if (feature.properties.REGIONAL) {
                            popup += `<strong>REGIONAL:</strong> ${feature.properties.REGIONAL}`;
                        }
                    }
                    layer.bindPopup(popup);
                }
            }).addTo(map);
            window.pbRegionais = valoresUnicos;
            window.pbRegionaisCores = corPorValor;
            window.pbRegionaisCount = countPorRegional;
        })
        .catch(err => {
            console.error('Erro ao carregar pb.geojson:', err);
        });
}

// Função para carregar municipios-aterro.geojson
function loadAterroGeoJSON() {
    fetch('dados/municipios-aterro.geojson')
        .then(response => response.json())
        .then(data => {
            let count = 0;
            aterroLayer = L.geoJSON(data, {
                style: {
                    color: '#4F4F4F',
                    weight: 1,
                    fillColor: '#8B008B',
                    fillOpacity: 0.85
                },
                onEachFeature: function(feature, layer) {
                    count++;
                    let popup = '';
                    if (feature.properties) {
                        if (feature.properties.NM_MUN) {
                            popup += `<strong>NM_MUN:</strong> ${feature.properties.NM_MUN}<br/>`;
                        }
                        if (feature.properties.ATERRO) {
                            popup += `<strong>ATERRO:</strong> ${feature.properties.ATERRO}`;
                        }
                    }
                    layer.bindPopup(popup);
                }
            });
            window.aterroCount = count;
        })
        .catch(err => {
            console.error('Erro ao carregar municipios-aterro.geojson:', err);
        });
}

// Função para carregar municipios-destinacao.geojson
function loadDestinacaoGeoJSON() {
    fetch('dados/municipios-destinacao.geojson')
        .then(response => response.json())
        .then(data => {
            // 1. Identificar valores únicos
            const cores = [
                '#1b9e77', // verde
                '#d95f02', // laranja
                '#7570b3', // roxo
                '#e7298a', // magenta
                '#66a61e', // verde oliva
                '#e6ab02', // amarelo mostarda
                '#a6761d', // marrom claro
                '#666666', // cinza
                '#1f78b4', // azul
                '#b15928'  // marrom escuro
            ];
            const valorSet = new Set();
            const countPorDestinacao = {};
            data.features.forEach(f => {
                if (f.properties && f.properties.DESTINACAO) {
                    valorSet.add(f.properties.DESTINACAO);
                    countPorDestinacao[f.properties.DESTINACAO] = (countPorDestinacao[f.properties.DESTINACAO] || 0) + 1;
                }
            });
            const valoresUnicos = Array.from(valorSet);
            // 2. Mapear valor => cor
            const corPorValor = {};
            valoresUnicos.forEach((valor, idx) => {
                corPorValor[valor] = cores[idx % cores.length];
            });
            // 3. Criar camada com estilo categórico
            destinacaoLayer = L.geoJSON(data, {
                style: function(feature) {
                    const valor = feature.properties && feature.properties.DESTINACAO;
                    let style = {
                        color: '#4F4F4F',
                        weight: 1,
                        fillColor: corPorValor[valor] || '#bdbdbd',
                        fillOpacity: 0.85
                    };
                    // Estilos específicos para as categorias especiais
                    if (valor === 'A S de Guarabira') {
                        style.color = '#FF4500';
                        style.weight = 2;
                        style.fillOpacity = 0.9;
                    } else if (valor === 'A S Coremas') {
                        style.color = '#8A2BE2';
                        style.weight = 2;
                        style.fillOpacity = 0.9;
                    }
                    return style;
                },
                onEachFeature: function(feature, layer) {
                    let popup = '';
                    if (feature.properties) {
                        if (feature.properties.NM_MUN) {
                            popup += `<strong>NM_MUN:</strong> ${feature.properties.NM_MUN}<br/>`;
                        }
                        if (feature.properties.DESTINACAO) {
                            popup += `<strong>DESTINACAO:</strong> ${feature.properties.DESTINACAO}`;
                        }
                    }
                    layer.bindPopup(popup);
                }
            });
            window.destCategorias = valoresUnicos;
            window.destCores = corPorValor;
            window.destCount = countPorDestinacao;
            window.destData = data;

            // Popular o filtro de categorias
            const filtro = document.getElementById('filtro-destinacao');
            if (filtro) {
                // Limpa opções antigas (exceto 'Todos')
                filtro.innerHTML = '<option value="todos">Todos</option>';
                valoresUnicos.forEach(cat => {
                    const opt = document.createElement('option');
                    opt.value = cat;
                    opt.textContent = cat;
                    filtro.appendChild(opt);
                });
            }

            // Camada base (todas as feições)
            window.destinacaoLayerFull = L.geoJSON(data, {
                style: function(feature) {
                    const valor = feature.properties && feature.properties.DESTINACAO;
                    let style = {
                        color: '#4F4F4F',
                        weight: 1,
                        fillColor: corPorValor[valor] || '#bdbdbd',
                        fillOpacity: 0.85
                    };
                    if (valor === 'A S de Guarabira') {
                        style.color = '#FF4500';
                        style.weight = 2;
                        style.fillOpacity = 0.9;
                    } else if (valor === 'A S Coremas') {
                        style.color = '#8A2BE2';
                        style.weight = 2;
                        style.fillOpacity = 0.9;
                    }
                    return style;
                },
                onEachFeature: function(feature, layer) {
                    let popup = '';
                    if (feature.properties) {
                        if (feature.properties.NM_MUN) {
                            popup += `<strong>NM_MUN:</strong> ${feature.properties.NM_MUN}<br/>`;
                        }
                        if (feature.properties.DESTINACAO) {
                            popup += `<strong>DESTINACAO:</strong> ${feature.properties.DESTINACAO}`;
                        }
                    }
                    layer.bindPopup(popup);
                }
            });
            // Camadas filtradas por categoria
            window.destinacaoLayersByCat = {};
            valoresUnicos.forEach(cat => {
                const features = data.features.filter(f => f.properties.DESTINACAO === cat);
                window.destinacaoLayersByCat[cat] = L.geoJSON({type: 'FeatureCollection', features}, {
                    style: function(feature) {
                        const valor = feature.properties && feature.properties.DESTINACAO;
                        let style = {
                            color: '#4F4F4F',
                            weight: 1,
                            fillColor: corPorValor[valor] || '#bdbdbd',
                            fillOpacity: 0.85
                        };
                        if (valor === 'A S de Guarabira') {
                            style.color = '#FF4500';
                            style.weight = 2;
                            style.fillOpacity = 0.9;
                        } else if (valor === 'A S Coremas') {
                            style.color = '#8A2BE2';
                            style.weight = 2;
                            style.fillOpacity = 0.9;
                        }
                        return style;
                    },
                    onEachFeature: function(feature, layer) {
                        let popup = '';
                        if (feature.properties) {
                            if (feature.properties.NM_MUN) {
                                popup += `<strong>NM_MUN:</strong> ${feature.properties.NM_MUN}<br/>`;
                            }
                            if (feature.properties.DESTINACAO) {
                                popup += `<strong>DESTINACAO:</strong> ${feature.properties.DESTINACAO}`;
                            }
                        }
                        layer.bindPopup(popup);
                    }
                });
            });
        })
        .catch(err => {
            console.error('Erro ao carregar municipios-destinacao.geojson:', err);
        });
}

// Função para carregar municipios-ett.geojson
function loadETTGeoJSON() {
    fetch('dados/municipios-ett.geojson')
        .then(response => response.json())
        .then(data => {
            let count = 0;
            ettLayer = L.geoJSON(data, {
                style: {
                    color: '#FF1493',
                    weight: 1,
                    fillColor: '#FF69B4',
                    fillOpacity: 0.85
                },
                onEachFeature: function(feature, layer) {
                    count++;
                    let popup = '';
                    if (feature.properties) {
                        if (feature.properties.NM_MUN) {
                            popup += `<strong>NM_MUN:</strong> ${feature.properties.NM_MUN}<br/>`;
                        }
                        if (feature.properties.ETT) {
                            popup += `<strong>ETT:</strong> ${feature.properties.ETT}`;
                        }
                    }
                    layer.bindPopup(popup);
                }
            });
            window.ettCount = count;
        })
        .catch(err => {
            console.error('Erro ao carregar municipios-ett.geojson:', err);
        });
}

// Função para carregar municipios-prads.geojson
function loadPRADSGeoJSON() {
    fetch('dados/municipios-prads.geojson')
        .then(response => response.json())
        .then(data => {
            let count = 0;
            pradsLayer = L.geoJSON(data, {
                style: {
                    color: '#FFD700',
                    weight: 1,
                    fillColor: '#FFFACD',
                    fillOpacity: 0.85
                },
                onEachFeature: function(feature, layer) {
                    count++;
                    let popup = '';
                    if (feature.properties) {
                        if (feature.properties.NM_MUN) {
                            popup += `<strong>NM_MUN:</strong> ${feature.properties.NM_MUN}<br/>`;
                        }
                        if (feature.properties.PRADS) {
                            popup += `<strong>PRADS:</strong> ${feature.properties.PRADS}`;
                        }
                    }
                    layer.bindPopup(popup);
                }
            });
            window.pradsCount = count;
        })
        .catch(err => {
            console.error('Erro ao carregar municipios-prads.geojson:', err);
        });
}

// Função para carregar municipios-ugirsu.geojson
function loadUGIRSUGeoJSON() {
    fetch('dados/municipios-ugirsu.geojson')
        .then(response => response.json())
        .then(data => {
            let count = 0;
            ugirsuLayer = L.geoJSON(data, {
                style: {
                    color: '#00CED1',
                    weight: 1,
                    fillColor: '#AFEEEE',
                    fillOpacity: 0.85
                },
                onEachFeature: function(feature, layer) {
                    count++;
                    let popup = '';
                    if (feature.properties) {
                        if (feature.properties.NM_MUN) {
                            popup += `<strong>NM_MUN:</strong> ${feature.properties.NM_MUN}<br/>`;
                        }
                        if (feature.properties.UGIRSU) {
                            popup += `<strong>UGIRSU:</strong> ${feature.properties.UGIRSU}`;
                        }
                    }
                    layer.bindPopup(popup);
                }
            });
            window.ugirsuCount = count;
        })
        .catch(err => {
            console.error('Erro ao carregar municipios-ugirsu.geojson:', err);
        });
}

// Função para carregar cooperativas.geojson
function loadCooperativasGeoJSON() {
    fetch('dados/cooperativas.geojson')
        .then(response => response.json())
        .then(data => {
            let count = 0;
            cooperativasLayer = L.geoJSON(data, {
                pointToLayer: function(feature, latlng) {
                    count++;
                    return L.circleMarker(latlng, {
                        radius: 3,
                        fillColor: '#FFFF00',
                        color: '#E6E600',
                        weight: 1.5,
                        opacity: 1,
                        fillOpacity: 0.8
                    });
                },
                onEachFeature: function(feature, layer) {
                    let popup = '';
                    if (feature.properties) {
                        if (feature.properties.Município) {
                            popup += `<strong>Município:</strong> ${feature.properties.Município}`;
                        }
                    }
                    layer.bindPopup(popup);
                }
            });
            window.cooperativasCount = count;
        })
        .catch(err => {
            console.error('Erro ao carregar cooperativas.geojson:', err);
        });
}

// Função para marcar o botão ativo no menu
function setActiveBasemapBtn(basemapType) {
    document.querySelectorAll('.basemap-btn').forEach(btn => {
        if (btn.getAttribute('data-basemap') === basemapType) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

// Função para configurar controles simples de basemap
function setupSimpleBasemapControls() {
    document.querySelectorAll('.basemap-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const basemapType = this.getAttribute('data-basemap');
            if (currentBasemap === basemapType) return;
            // Trocar o basemap
            map.removeLayer(basemaps[currentBasemap]);
            map.addLayer(basemaps[basemapType]);
            currentBasemap = basemapType;
            setActiveBasemapBtn(basemapType);
        });
    });
}

// Função para mostrar legenda
function showLegend(type) {
    const legend = document.getElementById('legend-container');
    let html = '<div class="legend-title">Legenda</div>';
    if (type === 'pb') {
        html += '<div class="legend-subtitle">Regional</div>';
        // Usar as mesmas cores e categorias da camada Paraíba
        if (window.pbRegionais && window.pbRegionais.length) {
            for (const reg of window.pbRegionais) {
                const count = window.pbRegionaisCount && window.pbRegionaisCount[reg] ? window.pbRegionaisCount[reg] : 0;
                html += `<div class='legend-item'><span class='legend-color' style='background:${window.pbRegionaisCores[reg]};'></span><span class='legend-label'>${reg}</span><span class='legend-count'>( ${count} )</span></div>`;
            }
        }
    } else if (type === 'destinacao') {
        html += '<div class="legend-subtitle">Destinação dos Resíduos</div>';
        if (window.destCategorias && window.destCategorias.length) {
            for (const cat of window.destCategorias) {
                const count = window.destCount && window.destCount[cat] ? window.destCount[cat] : 0;
                html += `<div class='legend-item'><span class='legend-color' style='background:${window.destCores[cat]};'></span><span class='legend-label'>${cat}</span><span class='legend-count'>( ${count} )</span></div>`;
            }
        }
    } else if (type === 'aterro') {
        html += '<div class="legend-subtitle">Municípios com Aterro Sanitário</div>';
        const count = window.aterroCount || 0;
        html += `<div class='legend-item'><span class='legend-color' style='background:#8B008B;'></span>Aterro <span style='color:#888;font-size:13px;'>( ${count} )</span></div>`;
    } else if (type === 'ett') {
        html += '<div class="legend-subtitle">Municípios com ETT</div>';
        const count = window.ettCount || 0;
        html += `<div class='legend-item'><span class='legend-color' style='background:#FF69B4;'></span>ETT <span style='color:#888;font-size:13px;'>( ${count} )</span></div>`;
    } else if (type === 'prads') {
        html += '<div class="legend-subtitle">Municípios com PRADS</div>';
        const count = window.pradsCount || 0;
        html += `<div class='legend-item'><span class='legend-color' style='background:#FFFACD;'></span>PRADS <span style='color:#888;font-size:13px;'>( ${count} )</span></div>`;
    } else if (type === 'ugirsu') {
        html += '<div class="legend-subtitle">Municípios com UGIRSU</div>';
        const count = window.ugirsuCount || 0;
        html += `<div class='legend-item'><span class='legend-color' style='background:#AFEEEE;'></span>UGIRSU <span style='color:#888;font-size:13px;'>( ${count} )</span></div>`;
    } else if (type === 'cooperativas') {
        html += '<div class="legend-subtitle">Iniciativas de Coleta Seletiva</div>';
        const count = window.cooperativasCount || 0;
        html += `<div class='legend-item'><span class='legend-color' style='background:#FFFF00;'></span>Iniciativas <span style='color:#888;font-size:13px;'>( ${count} )</span></div>`;
    }
    legend.innerHTML = html;
    legend.style.display = 'block';
}

// Função para esconder legenda
function hideLegend() {
    const legend = document.getElementById('legend-container');
    legend.style.display = 'none';
    legend.innerHTML = '';
}

// Função para ativar/desativar camadas via checkbox
function setupLayerToggles() {
    const pbToggle = document.getElementById('toggle-pb');
    const aterroToggle = document.getElementById('toggle-aterro');
    const destinacaoToggle = document.getElementById('toggle-destinacao');
    const ettToggle = document.getElementById('toggle-ett');
    const pradsToggle = document.getElementById('toggle-prads');
    const ugirsuToggle = document.getElementById('toggle-ugirsu');
    const cooperativasToggle = document.getElementById('toggle-cooperativas');
    pbToggle.addEventListener('change', function() {
        if (pbLayer) {
            if (pbToggle.checked) {
                map.addLayer(pbLayer);
                showLegend('pb');
            } else {
                map.removeLayer(pbLayer);
                hideLegend();
            }
        }
    });
    aterroToggle.addEventListener('change', function() {
        if (aterroLayer) {
            if (aterroToggle.checked) {
                map.addLayer(aterroLayer);
                showLegend('aterro');
            } else {
                map.removeLayer(aterroLayer);
                hideLegend();
            }
        }
    });
    destinacaoToggle.addEventListener('change', function() {
        // Sempre remover todas as camadas ao ativar/desativar
        if (window.destinacaoLayerFull) map.removeLayer(window.destinacaoLayerFull);
        if (window.destinacaoLayersByCat) {
            Object.values(window.destinacaoLayersByCat).forEach(l => map.removeLayer(l));
        }
        if (destinacaoToggle.checked) {
            filtro.disabled = false;
            // Não adiciona nenhuma camada automaticamente
            hideLegend();
        } else {
            filtro.disabled = true;
            hideLegend();
        }
    });
    ettToggle.addEventListener('change', function() {
        if (ettLayer) {
            if (ettToggle.checked) {
                map.addLayer(ettLayer);
                showLegend('ett');
            } else {
                map.removeLayer(ettLayer);
                hideLegend();
            }
        }
    });
    pradsToggle.addEventListener('change', function() {
        if (pradsLayer) {
            if (pradsToggle.checked) {
                map.addLayer(pradsLayer);
                showLegend('prads');
            } else {
                map.removeLayer(pradsLayer);
                hideLegend();
            }
        }
    });
    ugirsuToggle.addEventListener('change', function() {
        if (ugirsuLayer) {
            if (ugirsuToggle.checked) {
                map.addLayer(ugirsuLayer);
                showLegend('ugirsu');
            } else {
                map.removeLayer(ugirsuLayer);
                hideLegend();
            }
        }
    });
    cooperativasToggle.addEventListener('change', function() {
        if (cooperativasLayer) {
            if (cooperativasToggle.checked) {
                map.addLayer(cooperativasLayer);
                showLegend('cooperativas');
            } else {
                map.removeLayer(cooperativasLayer);
                hideLegend();
            }
        }
    });
    // Exibir legenda da Paraíba ao iniciar
    if (pbToggle.checked) showLegend('pb');
}

// Atualizar exibição da camada de destinação conforme filtro
function setupFiltroDestinacao() {
    const filtro = document.getElementById('filtro-destinacao');
    const destinacaoToggle = document.getElementById('toggle-destinacao');
    if (!filtro || !destinacaoToggle) return;
    filtro.addEventListener('change', function() {
        if (!destinacaoToggle.checked) return;
        // Remove todas as camadas SEMPRE antes de adicionar a correta
        if (window.destinacaoLayerFull) map.removeLayer(window.destinacaoLayerFull);
        if (window.destinacaoLayersByCat) {
            Object.values(window.destinacaoLayersByCat).forEach(l => map.removeLayer(l));
        }
        // Adiciona apenas a camada selecionada
        if (filtro.value === 'todos') {
            if (window.destinacaoLayerFull) map.addLayer(window.destinacaoLayerFull);
            showLegend('destinacao');
        } else if (filtro.value && window.destinacaoLayersByCat && window.destinacaoLayersByCat[filtro.value]) {
            map.addLayer(window.destinacaoLayersByCat[filtro.value]);
            showLegend('destinacao');
        }
    });
    destinacaoToggle.addEventListener('change', function() {
        // Sempre remover todas as camadas ao ativar/desativar
        if (window.destinacaoLayerFull) map.removeLayer(window.destinacaoLayerFull);
        if (window.destinacaoLayersByCat) {
            Object.values(window.destinacaoLayersByCat).forEach(l => map.removeLayer(l));
        }
        if (destinacaoToggle.checked) {
            filtro.disabled = false;
            // Não adiciona nenhuma camada automaticamente
            hideLegend();
        } else {
            filtro.disabled = true;
            hideLegend();
        }
    });
    // Inicialmente, se a camada estiver ativa, mostrar tudo
    if (destinacaoToggle.checked) {
        filtro.disabled = false;
        filtro.value = 'todos';
        filtro.dispatchEvent(new Event('change'));
    } else {
        filtro.disabled = true;
    }
}

// Função utilitária para obter camadas ativas
function getCamadasAtivas() {
    const camadas = [];
    if (document.getElementById('toggle-pb').checked) camadas.push('Paraíba');
    if (document.getElementById('toggle-aterro').checked) camadas.push('Municípios com Aterro Sanitário');
    if (document.getElementById('toggle-destinacao').checked) camadas.push('Destinação dos Resíduos Sólidos');
    if (document.getElementById('toggle-ett').checked) camadas.push('Municípios com ETT');
    if (document.getElementById('toggle-prads').checked) camadas.push('Municípios com PRADS');
    if (document.getElementById('toggle-ugirsu').checked) camadas.push('Municípios com UGIRSU');
    if (document.getElementById('toggle-cooperativas').checked) camadas.push('Iniciativas de Coleta Seletiva');
    return camadas;
}

// Função utilitária para obter filtro de destinação
function getFiltroDestinacao() {
    const filtro = document.getElementById('filtro-destinacao');
    if (filtro && filtro.value && filtro.value !== 'todos') return filtro.value;
    return 'Todos';
}

// Função utilitária para obter legenda visível
function getLegendaHTML() {
    const legend = document.getElementById('legend-container');
    return legend && legend.style.display !== 'none' ? legend.innerHTML : '';
}

// Função utilitária para obter lista de feições filtradas (destinação)
function getFeicoesFiltradas() {
    const filtro = document.getElementById('filtro-destinacao');
    if (!filtro || !window.destData) return [];
    if (filtro.value === 'todos') return [];
    return window.destData.features.filter(f => f.properties && f.properties.DESTINACAO === filtro.value);
}

// Função para gerar o relatório em PDF
function gerarRelatorioPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
    let y = 12;
    // Título
    doc.setFontSize(18);
    doc.text('Relatório WebGIS - Diagnóstico dos Resíduos Sólidos na Paraíba', 12, y);
    y += 10;
    // Data/hora
    doc.setFontSize(11);
    doc.text('Data/Hora: ' + new Date().toLocaleString('pt-BR'), 12, y);
    y += 8;
    // Camadas ativas
    doc.setFontSize(13);
    doc.text('Camadas Ativas:', 12, y);
    y += 7;
    doc.setFontSize(11);
    getCamadasAtivas().forEach(camada => {
        doc.text('- ' + camada, 16, y);
        y += 6;
    });
    y += 2;
    // Filtro de destinação
    if (document.getElementById('toggle-destinacao').checked) {
        doc.setFontSize(13);
        doc.text('Filtro de Destinação:', 12, y);
        y += 7;
        doc.setFontSize(11);
        doc.text('Selecionado: ' + getFiltroDestinacao(), 16, y);
        y += 8;
    }
    // Legenda
    const legendaHTML = getLegendaHTML();
    if (legendaHTML) {
        doc.setFontSize(13);
        doc.text('Legenda:', 12, y);
        y += 7;
        // Renderizar legenda com simbologia
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = legendaHTML;
        const items = tempDiv.querySelectorAll('.legend-item');
        items.forEach(item => {
            const colorEl = item.querySelector('.legend-color');
            const labelEl = item.querySelector('.legend-label');
            const countEl = item.querySelector('.legend-count');
            // Cor
            let color = '#bdbdbd';
            if (colorEl) {
                const style = colorEl.getAttribute('style');
                const match = style && style.match(/background:([^;]+)/);
                if (match) color = match[1].trim();
            }
            // Desenhar quadradinho
            doc.setFillColor(color);
            doc.rect(16, y - 4, 5, 5, 'F');
            // Texto
            doc.setFontSize(11);
            let txt = labelEl ? labelEl.textContent.trim() : item.textContent.trim();
            let count = countEl ? countEl.textContent.trim() : '';
            doc.text(txt, 23, y);
            if (count) doc.text(count, 23 + doc.getTextWidth(txt) + 2, y);
            y += 6;
        });
        y += 2;
    }
    // Lista de feições filtradas (opcional)
    const feicoes = getFeicoesFiltradas();
    if (feicoes.length > 0) {
        doc.setFontSize(13);
        doc.text('Municípios filtrados:', 12, y);
        y += 7;
        doc.setFontSize(10);
        feicoes.forEach(f => {
            const nome = f.properties && f.properties.NM_MUN ? f.properties.NM_MUN : '-';
            doc.text('- ' + nome, 16, y);
            y += 5;
            if (y > 270) { doc.addPage(); y = 12; }
        });
        y += 2;
    }
    // Captura do mapa
    doc.setFontSize(13);
    doc.text('Imagem do Mapa:', 12, y);
    y += 5;
    html2canvas(document.getElementById('map')).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        const pageWidth = doc.internal.pageSize.getWidth() - 24;
        const imgProps = doc.getImageProperties(imgData);
        const imgHeight = (imgProps.height * pageWidth) / imgProps.width;
        // Centralizar a imagem
        const x = 12 + (pageWidth - (imgProps.width * (pageWidth / imgProps.width))) / 2;
        doc.addImage(imgData, 'PNG', x, y, pageWidth, imgHeight > 120 ? 120 : imgHeight);
        doc.save('relatorio-webgis.pdf');
    });
}

// Evento do botão
if (document.getElementById('btn-relatorio')) {
    document.getElementById('btn-relatorio').onclick = gerarRelatorioPDF;
}

// Inicializar o mapa quando a página carregar
document.addEventListener('DOMContentLoaded', function() {
    initMap();
    
    console.log('WebGIS inicializado com 3 camadas de basemaps e camada pb.geojson!');
    console.log('Basemaps disponíveis:');
    console.log('- OpenStreetMap (padrão)');
    console.log('- Imagem de Satélite (Esri)');
    console.log('- Mapa Topográfico (OpenTopoMap)');
    setupFiltroDestinacao();
}); 