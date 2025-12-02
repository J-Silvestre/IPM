// === MAPA ===

// Inicializar mapa (sem setView fixo)
const map = L.map('map');

// Camada base
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '© OpenStreetMap'
}).addTo(map);

// Estado do mapa
let currentLayer = null;
let selectedArea = null;
let lastSelectedLayer = null;
let architectPin = null;
let architectTarget = null;

const aruWarning = document.getElementById('aruWarning');
const distanceWarning = document.getElementById('distanceWarning');
const concelhoSelect = document.getElementById('concelho');
const beneficiosBtn = document.getElementById('beneficiosBtn');

// =====================================
// ICONES E PINS
// =====================================

const userIcon = L.icon({
  iconUrl:
    'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="%23007bff"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z"/></svg>',
  iconSize: [36, 36],
  iconAnchor: [18, 36]
});

const architectIcon = L.icon({
  iconUrl:
    'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="%23e74c3c"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z"/></svg>',
  iconSize: [36, 36],
  iconAnchor: [18, 36]
});

// posição inicial do pin do utilizador
const userPin = L.marker([38.724235912881454, -9.13568400222701], {
  icon: userIcon,
  draggable: true
}).addTo(map);

if (aruWarning) aruWarning.style.display = 'none';

// quando o pin é largado -> verificar ARU e distância
userPin.on('dragend', (e) => {
  const pos = e.target.getLatLng();

  // verificar se está dentro de uma ARU
  let inside = false;

  if (currentLayer) {
    try {
      const result = leafletPip.pointInLayer([pos.lng, pos.lat], currentLayer);
      inside = result && result.length > 0;
    } catch {
      inside = false;
    }
  }

  // mostrar ou esconder aviso
  if (aruWarning) {
    aruWarning.style.display = inside ? 'block' : 'none';
  }

  // gerir estado do botão Benefícios consoante o pin está dentro/fora da ARU
  if (inside) {
    if (beneficiosBtn) beneficiosBtn.classList.add('active');
    // marca seleção vinda do pin
    selectedArea = 'pin-inside-aru';
  } else {
    // se a seleção atual veio do pin, limpar e desativar botão
    if (selectedArea === 'pin-inside-aru') {
      selectedArea = null;
      if (beneficiosBtn) beneficiosBtn.classList.remove('active');
    }
  }

  updateDistanceWarning();
});
// =====================================

// =====================================
// ARQUITETO (PIN VERMELHO)
// =====================================

function haversineDistance(lat1, lng1, lat2, lng2) {
  const toRad = (deg) => (deg * Math.PI) / 180;
  const R = 6371; // km
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(a)));
}

function updateDistanceWarning() {
  if (!distanceWarning) return;
  if (!architectTarget) {
    distanceWarning.style.display = 'none';
    distanceWarning.textContent = '';
    return;
  }

  const userPos = userPin.getLatLng();
  const dest = architectTarget.coords;
  const km = haversineDistance(userPos.lat, userPos.lng, dest.lat, dest.lng);

  distanceWarning.style.display = 'block';
  distanceWarning.textContent = `Distância do ${architectTarget.nome}: ${km.toFixed(2)} km`;
}

function applyArchitectTarget(target) {
  if (!target || !target.coords) return;
  architectTarget = target;

  if (architectPin) {
    map.removeLayer(architectPin);
  }

  architectPin = L.marker([target.coords.lat, target.coords.lng], {
    icon: architectIcon
  }).addTo(map);

  // allow removing the architect pin with a click
  architectPin.on('click', () => {
    map.removeLayer(architectPin);
    architectPin = null;
    architectTarget = null;
    localStorage.removeItem('selectedArchitectLocation');
    updateDistanceWarning();
  });

  architectPin.bindPopup(
    `<strong>${target.nome || 'Arquiteto'}</strong><br>${target.morada || ''}`
  );

  // ajustar vista para mostrar ambos os pins
  const bounds = L.latLngBounds([
    userPin.getLatLng(),
    [target.coords.lat, target.coords.lng]
  ]);
  map.fitBounds(bounds, { padding: [32, 32] });

  updateDistanceWarning();
}

function loadArchitectTargetFromStorage() {
  const raw = localStorage.getItem('selectedArchitectLocation');
  if (!raw) {
    updateDistanceWarning();
    return;
  }

  try {
    const parsed = JSON.parse(raw);
    if (parsed && parsed.coords && typeof parsed.coords.lat === 'number' && typeof parsed.coords.lng === 'number') {
      applyArchitectTarget(parsed);
    } else {
      updateDistanceWarning();
    }
  } catch {
    updateDistanceWarning();
  }
}

window.addEventListener('beforeunload', () => {
  localStorage.removeItem('selectedArchitectLocation');
});

// =====================================
// GEOJSON E ARU
// =====================================

// Função para clique nas features
function onEachFeature(feature, layer) {
  layer.on('click', () => {
    // Guardar área selecionada
    selectedArea = feature.properties.name;

    // Ativar botão Benefícios
    if (beneficiosBtn) beneficiosBtn.classList.add('active');

    // Se havia uma área antes selecionada, reset ao estilo
    if (lastSelectedLayer) {
      lastSelectedLayer.setStyle({
        fillColor: '#3388ff',
        color: '#3388ff',
        weight: 2,
        fillOpacity: 0.3
      });
    }

    // Estilo do novo layer selecionado
    layer.setStyle({
      fillColor: '#ff0000',
      color: '#ff0000',
      weight: 3,
      fillOpacity: 0.5
    });

    // Guardar este como o novo último selecionado
    lastSelectedLayer = layer;

    // Popup
    if (feature.properties && feature.properties.name) {
      layer.bindPopup(`<strong>${feature.properties.name}</strong>`).openPopup();
    }
  });
}

// Função para carregar GeoJSON e ajustar mapa
function loadGeoJSON(path, zoomOverride = null, disableFitBounds = false) {
  if (currentLayer) map.removeLayer(currentLayer);

  fetch(path)
    .then(res => res.json())
    .then(data => {
      currentLayer = L.geoJSON(data, {
        style: {
          color: '#3388ff',
          weight: 2,
          fillOpacity: 0.3
        },
        onEachFeature: onEachFeature
      }).addTo(map);

      // Se NÃO desativaste o fitBounds
      if (!disableFitBounds) {
        try {
          map.fitBounds(currentLayer.getBounds());
        } catch {}
      }

      // Se pediste zoom manual
      if (zoomOverride !== null) {
        const center = currentLayer.getBounds().getCenter();
        map.setView(center, zoomOverride);
      }
    });
}

// Load inicial (Lisboa)
loadGeoJSON('resources/Lisboa_Mapa.geojson', 10, true);
loadArchitectTargetFromStorage();

// Seleção de concelho
concelhoSelect.addEventListener('change', () => {
  const concelho = concelhoSelect.value;

  if (concelho === 'Sintra') {
    loadGeoJSON('resources/Sintra_Mapa.geojson');
  } else {
    alert("As funcionalidades deste concelho ainda não foram implementadas.");
    loadGeoJSON('resources/Lisboa_Mapa.geojson', 10, true);
    concelhoSelect.value = 'Sintra';
    concelhoSelect.dispatchEvent(new Event('change'));
  }

  // sempre que mudar o concelho, desativar o botão
  if (beneficiosBtn) beneficiosBtn.classList.remove('active');
  selectedArea = null;
});

// Botão de ajuda
document.getElementById('helpConcelho').addEventListener('click', () => {
  alert('Seleciona um concelho e clica numa área para ver os seus benefícios e/ou penalizações.');
});

// Botão de Benefícios
beneficiosBtn.addEventListener('click', () => {
  if (!selectedArea) {
    alert('Por favor, clica numa área do mapa primeiro.');
    return;
  }

  location.href = 'bens-pens.html';
});
