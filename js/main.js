// 1. Create a map object.
var mymap = L.map('map', {
  center: [47.7511, -120.7401],
  zoom: 7,
  maxZoom: 10,
  minZoom: 3,
  detectRetina: true // detect whether the sceen is high resolution or not.
});

// 2. Add a base map.
L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager_labels_under/{z}/{x}/{y}.png').addTo(mymap);

// 3. Add airports GeoJSON Data
// Null variable that will hold airport data
var airports = null;

// 4. Build up a set of colors from colorbrewer's dark2 category
var colors = chroma.scale('Dark2').mode('lch').colors(2);

// 5. Dynamically append style classes to this page. This style classes will be used for colorize the markers.
for (i = 0; i < 2; i++) {
  $('head').append($("<style> .marker-color-" + (i + 1).toString() + " { color: " + colors[i] + "; font-size: 15px; text-shadow: 0 0 3px #ffffff;} </style>"));
}

// Get GeoJSON and put on it on the map when it loads
airports = L.geoJson.ajax("assets/airports.geojson", {
  // assign a function to the onEachFeature parameter of the airports object.
  // Then each (point) feature will bind a popup window.
  // The content of the popup window is the value of `feature.properties.AIRPT_NAME'
  onEachFeature: function (feature, layer) {
    layer.bindPopup(feature.properties.AIRPT_NAME);
  },
  pointToLayer: function (feature, latlng) {
    var id = 0;
    if (feature.properties.CNTL_TWR == "Y") { id = 0; } // has a control tower
    else { id = 1; } // no control tower
    return L.marker(latlng, {icon: L.divIcon({className: 'fa fa-plane marker-color-' + (id + 1).toString() })});
  },
  attribution: 'Airport Data &copy; data.gov | US states &copy; Mike Bostock of D3 | Base Map &copy; CartoDB | Made By Manya Rozet'
}).addTo(mymap);

// 6. Set function for color ramp
colors = chroma.scale('Blues').colors(5);

function setColor(density) {
  var id = 0;
  if (density > 40) { id = 4; }
  else if (density >= 30 && density <= 39) { id = 3; }
  else if (density >= 20 && density <= 29) { id = 2; }
  else if (density >= 10 && density <= 19) { id = 1; }
  else  { id = 0; }
  return colors[id];
}

// 7. Set style function that sets fill color.md property equal to density of aiports per state
function style(feature) {
  return {
    fillColor: setColor(feature.properties.count),
    fillOpacity: 0.4,
    weight: 2,
    opacity: 1,
    color: '#b4b4b4',
    dashArray: '4'
  };
}

// 8. Add state polygons
// create states variable, and assign null to it.
var states = null;
c = L.geoJson.ajax("assets/us-states.geojson", {
    style: style
}).addTo(mymap);

// 9. Create Leaflet Control Object for Legend
var legend = L.control({position: 'topright'});

// 10. Function that runs when legend is added to map
legend.onAdd = function () {
  // Create Div Element and Populate it with HTML
  var div = L.DomUtil.create('div', 'legend');
  div.innerHTML += '<b>Number of Airports per State</b><br />';
  div.innerHTML += '<i style="background: ' + colors[4] + '; opacity: 0.5"></i><p> 40+ </p>';
  div.innerHTML += '<i style="background: ' + colors[3] + '; opacity: 0.5"></i><p> 30-39 </p>';
  div.innerHTML += '<i style="background: ' + colors[2] + '; opacity: 0.5"></i><p> 20-29 </p>';
  div.innerHTML += '<i style="background: ' + colors[1] + '; opacity: 0.5"></i><p> 10-19 </p>';
  div.innerHTML += '<i style="background: ' + colors[0] + '; opacity: 0.5"></i><p> 0-9 </p>';
  div.innerHTML += '<hr><b>Presence of Control Tower<b><br />';
  div.innerHTML += '<i class="fa fa-plane marker-color-1"></i><p> Present </p>';
  div.innerHTML += '<i class="fa fa-plane marker-color-2"></i><p> Not Present </p>';
  // Return the Legend div containing the HTML content
  return div;
};

// 11. Add a legend to map
legend.addTo(mymap);

// 12. Add a scale bar to map
L.control.scale({position: 'bottomleft'}).addTo(mymap);
