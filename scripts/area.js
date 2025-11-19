// === MAPA ===

// Inicializar mapa (sem setView fixo)
var map = L.map('map');

// Camada base
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '© OpenStreetMap'
}).addTo(map);

// Guarda a layer atual e a área selecionada
let currentLayer = null;
let selectedArea = null;
let lastSelectedLayer = null;



// =====================================
// PIN DRAGGABLE (NOVO)
// =====================================

const greenIcon = L.icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
  iconSize: [36, 36],
  iconAnchor: [18, 36]
});


// posição inicial do pin
let userPin = L.marker([38.724235912881454, -9.13568400222701], {
  icon: greenIcon,
  draggable: true
}).addTo(map);

document.getElementById("aruWarning").style.display = "none";

// quando o pin é largado → verificar ARU
userPin.on("dragend", function (e) {
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
  const aruWarning = document.getElementById("aruWarning");
  if (aruWarning) {
    aruWarning.style.display = inside ? "block" : "none";
  }

  // gerir estado do botão Benefícios consoante o pin está dentro/fora da ARU
  if (inside) {
    if (beneficiosBtn) beneficiosBtn.classList.add('active');
    // marca seleção vinda do pin
    selectedArea = "pin-inside-aru";
  } else {
    // se a seleção atual veio do pin, limpar e desativar botão
    if (selectedArea === "pin-inside-aru") {
      selectedArea = null;
      if (beneficiosBtn) beneficiosBtn.classList.remove('active');
    }
  }
});
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


// === DOM ===

const concelhoSelect = document.getElementById('concelho');
const beneficiosBtn = document.getElementById('beneficiosBtn');


// Load inicial (Lisboa)
loadGeoJSON('resources/Lisboa_Mapa.geojson', 10, true);


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
document.getElementById("helpConcelho").addEventListener("click", () => {
  alert("Seleciona um concelho e clica numa área para ver os seus benefícios e/ou penalizações.");
});


// Botão de Benefícios
beneficiosBtn.addEventListener('click', () => {
  if (!selectedArea) {
    alert("Por favor, clica numa área do mapa primeiro.");
    return;
  }

  location.href = "bens-pens.html";
});

