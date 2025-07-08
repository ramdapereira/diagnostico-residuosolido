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
            data.features.forEach(f => {
                if (f.properties && f.properties.REGIONAL) {
                    valorSet.add(f.properties.REGIONAL);
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
            aterroLayer = L.geoJSON(data, {
                style: {
                    color: '#4F4F4F',
                    weight: 1,
                    fillColor: '#8B008B',
                    fillOpacity: 0.85
                },
                onEachFeature: function(feature, layer) {
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
            data.features.forEach(f => {
                if (f.properties && f.properties.DESTINACAO) {
                    valorSet.add(f.properties.DESTINACAO);
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
                        if (feature.properties.DESTINACAO) {
                            popup += `<strong>DESTINACAO:</strong> ${feature.properties.DESTINACAO}`;
                        }
                    }
                    layer.bindPopup(popup);
                }
            }); // Não adiciona ao mapa aqui
            window.destCategorias = valoresUnicos;
            window.destCores = corPorValor;
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
            ettLayer = L.geoJSON(data, {
                style: {
                    color: '#FF1493',
                    weight: 1,
                    fillColor: '#FF69B4',
                    fillOpacity: 0.85
                },
                onEachFeature: function(feature, layer) {
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
            }); // Não adiciona ao mapa aqui
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
            pradsLayer = L.geoJSON(data, {
                style: {
                    color: '#FFD700',
                    weight: 1,
                    fillColor: '#FFFACD',
                    fillOpacity: 0.85
                },
                onEachFeature: function(feature, layer) {
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
            }); // Não adiciona ao mapa aqui
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
            ugirsuLayer = L.geoJSON(data, {
                style: {
                    color: '#00CED1',
                    weight: 1,
                    fillColor: '#AFEEEE',
                    fillOpacity: 0.85
                },
                onEachFeature: function(feature, layer) {
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
            }); // Não adiciona ao mapa aqui
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
            cooperativasLayer = L.geoJSON(data, {
                pointToLayer: function(feature, latlng) {
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
                html += `<div class='legend-item'><span class='legend-color' style='background:${window.pbRegionaisCores[reg]};'></span>${reg}</div>`;
            }
        }
    } else if (type === 'destinacao') {
        html += '<div class="legend-subtitle">Destinação dos Resíduos</div>';
        if (window.destCategorias && window.destCategorias.length) {
            for (const cat of window.destCategorias) {
                html += `<div class='legend-item'><span class='legend-color' style='background:${window.destCores[cat]};'></span>${cat}</div>`;
            }
        }
    } else if (type === 'aterro') {
        html += '<div class="legend-subtitle">Municípios com Aterro Sanitário</div>';
        html += `<div class='legend-item'><span class='legend-color' style='background:#8B008B;'></span>Aterro</div>`;
    } else if (type === 'ett') {
        html += '<div class="legend-subtitle">Municípios com ETT</div>';
        html += `<div class='legend-item'><span class='legend-color' style='background:#FF69B4;'></span>ETT</div>`;
    } else if (type === 'prads') {
        html += '<div class="legend-subtitle">Municípios com PRADS</div>';
        html += `<div class='legend-item'><span class='legend-color' style='background:#FFFACD;'></span>PRADS</div>`;
    } else if (type === 'ugirsu') {
        html += '<div class="legend-subtitle">Municípios com UGIRSU</div>';
        html += `<div class='legend-item'><span class='legend-color' style='background:#AFEEEE;'></span>UGIRSU</div>`;
    } else if (type === 'cooperativas') {
        html += '<div class="legend-subtitle">Cooperativas de Catadores</div>';
        html += `<div class='legend-item'><span class='legend-color' style='background:#FFFF00;'></span>Cooperativa</div>`;
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
        if (destinacaoLayer) {
            if (destinacaoToggle.checked) {
                map.addLayer(destinacaoLayer);
                showLegend('destinacao');
            } else {
                map.removeLayer(destinacaoLayer);
                hideLegend();
            }
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

// Inicializar o mapa quando a página carregar
document.addEventListener('DOMContentLoaded', function() {
    initMap();
    
    // Adicionar funcionalidades responsivas
    setupResponsiveFeatures();
    
    console.log('WebGIS inicializado com 3 camadas de basemaps e camada pb.geojson!');
    console.log('Basemaps disponíveis:');
    console.log('- OpenStreetMap (padrão)');
    console.log('- Imagem de Satélite (Esri)');
    console.log('- Mapa Topográfico (OpenTopoMap)');
});

// Função para configurar funcionalidades responsivas
function setupResponsiveFeatures() {
    // Fechar sidebar ao redimensionar para desktop
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768) {
            document.getElementById('sidebar').classList.remove('active');
        }
    });
    
    // Melhorar experiência de touch em mobile
    if ('ontouchstart' in window) {
        // Aumentar área de toque para elementos interativos
        const touchElements = document.querySelectorAll('.layer-fab, .home-btn, .sidebar-toggle, .basemap-btn');
        touchElements.forEach(element => {
            element.style.minHeight = '44px';
            element.style.minWidth = '44px';
        });
        
        // Adicionar feedback visual para toque
        touchElements.forEach(element => {
            element.addEventListener('touchstart', function() {
                this.style.transform = 'scale(0.95)';
            });
            
            element.addEventListener('touchend', function() {
                this.style.transform = 'scale(1)';
            });
        });
    }
    
    // Melhorar acessibilidade
    document.addEventListener('keydown', function(e) {
        // ESC para fechar sidebar em mobile
        if (e.key === 'Escape' && window.innerWidth <= 768) {
            document.getElementById('sidebar').classList.remove('active');
        }
        
        // Enter para buscar no campo de geolocalização
        if (e.key === 'Enter' && document.activeElement.id === 'geolocate-input') {
            document.getElementById('geolocate-btn').click();
        }
    });
    
    // Melhorar performance em dispositivos móveis
    if (window.innerWidth <= 768) {
        // Reduzir animações em mobile para melhor performance
        document.body.style.setProperty('--transition-duration', '0.2s');
        
        // Otimizar para touch
        const map = document.getElementById('map');
        if (map) {
            map.style.touchAction = 'manipulation';
        }
    }
} 