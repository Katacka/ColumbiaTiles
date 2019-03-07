import { TileData } from '/lib/tile_data.js'

const FILL_OPACITY = 0.5; //Semi-transparent
const STROKE_COLOR = '#ffffff'; //White tile borders
const MapLayers = Object.freeze({
  TILE: 16,
  SUBTILE: 17,
  SUBTILE_ZOOMED: 18
});

module.exports = {
  mapContext: undefined,
  tileLayerContext: undefined,
  subTileLayerContext: undefined,
  tileCompositeLayerContext: undefined,
  subTileCompositeLayerContext: undefined,

  generateMap: () => {
    module.exports.mapContext = L.map('map', {
      maxBoundsViscosity: 1.0, //Bounds as set are treated as rigid
      bounceAtZoomLimits: false, //Inhibits rubber-banding when one tries to zoom in or out too far
      center: [45.6006, -122.5449285],
      zoom: MapLayers.TILE,
      minZoom: MapLayers.TILE,
      maxZoom: MapLayers.SUBTILE_ZOOMED,
      maxBounds: [
        [45.597776, -122.537072],
        [45.603645, -122.552085]
      ],
    });
    L.tileLayer.provider('OpenStreetMap.Mapnik').addTo(module.exports.mapContext); //Alternate: Esri.WorldImagery

    generateTilesWithData();
    setOnZoomListener();
  },

  updateMapColoring: () => { //TODO: Test functionality
    let zoom = module.exports.mapContext.getZoom();
    let updateTileCoverageColoring = module.exports.updateTileCoverageColoring;

    if (zoom === MapLayers.TILE) {
      module.exports.tileLayerContext.eachLayer((layer) => {
        let tile = TileData.findOne({"num": layer.feature.properties.num});
        layer.setStyle({ fillColor: updateTileCoverageColoring(tile) });
      });
    }
    else if (zoom === MapLayers.SUBTILE || zoom === MapLayers.SUBTILE_ZOOMED) {
      module.exports.subTileLayerContext.eachLayer((layer) => {
        let tile = TileData.findOne({"num": layer.feature.properties.num});
        let subtile = tile.subtiles[layer.feature.properties.idx];
        layer.setStyle({ fillColor: updateTileCoverageColoring(subtile) });
      });
    }


  },

  toggleMapLayer: () => {
    let map = module.exports.mapContext;
    let zoom = map.getZoom();

    if (zoom === MapLayers.TILE) {
      map.removeLayer(module.exports.subTileCompositeLayerContext);
      map.addLayer(module.exports.tileCompositeLayerContext);
    }
    else if (zoom === MapLayers.SUBTILE || zoom === MapLayers.SUBTILE_ZOOMED) {
      map.removeLayer(module.exports.tileCompositeLayerContext);
      map.addLayer(module.exports.subTileCompositeLayerContext);
    }
  },

  updateTileCoverageColoring: (tile) => {
    let focusedTile = tile[Session.get('plantFocus')];
    let date = Session.get("date") || 'test';

    if (focusedTile[date]) {
      let tileClass = focusedTile[date].class;
      return module.exports.updateCoverageColoring(tileClass);
    }

    console.log('Invalid coverage class encountered when updating tile coloring');
    return '#BEBEBE'; //Gray
  },

  updateCoverageColoring: (tileClass) => { //TODO: Add purple coloring for plots to revisit
    switch (tileClass) {
      case 0:
        return '#43cb91'; //Blue-green
        break;
      case 1:
        return '#31cf2f'; //Light-green
        break;
      case 2:
      return '#fdff01'; //Light-yellow
        break;
      case 3:
        return '#fe6600'; //Orange
        break;
      case 4:
        return '#fb0102'; //Red
        break;
      default:
        break;
    }
    console.log('Invalid coverage class encountered when updating tile coloring');
    return '#BEBEBE'; //Light-gray
  }

}

function generateTilesWithData() {
  let plotRef = { plots: [], subplots: [] };
  let map = module.exports.mapContext;
  //Coordinates defining the bounds of the tile array
  const latLonCoords = [{
      lon: -122.55055,
      lat: 45.60288,
      size: 2
    },
    {
      lon: -122.55055,
      lat: 45.60243,
      size: 3
    },
    {
      lon: -122.55055,
      lat: 45.60198,
      size: 4
    },
    {
      lon: -122.54991,
      lat: 45.60153,
      size: 9
    },
    {
      lon: -122.54991,
      lat: 45.60108,
      size: 9
    },
    {
      lon: -122.54991,
      lat: 45.60063,
      size: 10
    },
    {
      lon: -122.54991,
      lat: 45.60018,
      size: 14,
      skip: [7]
    },
    {
      lon: -122.54479,
      lat: 45.59973,
      size: 9,
      skip: [3]
    },
    {
      lon: -122.54095,
      lat: 45.59928,
      size: 4
    },
    {
      lon: -122.54223,
      lat: 45.59883,
      size: 7,
      skip: [2, 4, 5, 6]
    },
    {
      lon: -122.54095,
      lat: 45.59838,
      size: 3
    }
  ];

  generateTiles(plotRef, latLonCoords);

  generateTileLayer(plotRef.plots);
  generateSubTileLayer(plotRef.subplots);
}

function generateTiles(plotRef, lonLatRows) {
  num = 1;
  lonLatRows.forEach(lonLatRow => {
    for (let i = 1; i <= lonLatRow.size; i++, num++) {
      if (lonLatRow.skip && lonLatRow.skip.includes(i)) {
        num--;
        lonLatRow.lon = lonLatRow.lon + 0.00064;
        continue;
      }

      plotRef.plots.push({
        "type": "Feature",
        "properties": {
          "num": num,
          "lonLat": { 'lon': lonLatRow.lon, 'lat': lonLatRow.lat }
        },
        "geometry": {
          "type": "Polygon",
          "coordinates": [
            [ //Center: [-122.550551, 45.60288444]
              [lonLatRow.lon + 0.00032, lonLatRow.lat + 0.000225], //Top-right
              [lonLatRow.lon - 0.00032, lonLatRow.lat + 0.000225], //Top-left
              [lonLatRow.lon - 0.00032, lonLatRow.lat - 0.000225], //Bottom-left
              [lonLatRow.lon + 0.00032, lonLatRow.lat - 0.000225], //Bottom-right
              [lonLatRow.lon + 0.00032, lonLatRow.lat + 0.000225] //Top-right
            ]
          ]
        }
      });

      generateSubTiles(plotRef, lonLatRow, num);

      lonLatRow.lon += 0.00064;
    }
  });
}

function generateSubTiles(plotRef, lonLatRow, num) {
  let lonTileOffset = 0.00032;
  let latTileOffset = 0.000225;

  quadLonRef = lonLatRow.lon;
  quadLatRef = lonLatRow.lat;
  for (let i = 0, j = 0; i < 4; i++) {
    name = num + String.fromCharCode(97 + i);
    quadLon = quadLonRef + lonTileOffset * (i % 2);
    quadLat = quadLatRef - latTileOffset * (j % 2);
    if (i % 2) j++;

    plotRef.subplots.push({
      "type": "Feature",
      "properties": {
        "name": name,
        "num": num,
        "idx": i,
        "lonLat": { 'lon': quadLon, 'lat': quadLat }
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [ //Center: [-122.550551, 45.60288444]
            [quadLon, quadLat + latTileOffset], //Top-right
            [quadLon - lonTileOffset, quadLat + latTileOffset], //Top-left
            [quadLon - lonTileOffset, quadLat], //Bottom-left
            [quadLon, quadLat], //Bottom-right
            [quadLon, quadLat + latTileOffset] //Top-right
          ]
        ]
      }
    });
  }
}

function generateTileLayer(plots) {
  module.exports.tileCompositeLayerContext = new L.LayerGroup();
  module.exports.tileLayerContext = L.geoJSON(plots, {
    style: (feature) => {
      let tile = TileData.findOne({"num": feature.properties.num});
      return {
        fillColor: module.exports.updateTileCoverageColoring(tile),
        color: STROKE_COLOR,
        fillOpacity: FILL_OPACITY
      }
    },
    onEachFeature: (feature, layer) => {
      layer.on({
        click: (event) => {
          let tile = TileData.findOne({"num": feature.properties.num});
          console.log(tile);
          Session.set("tileContext", tile);
          //Session.set('dateIdx', 0);
          Session.set('lonLat',  feature.properties.lonLat);
          layerContext = layer;
        }
      });

      module.exports.tileCompositeLayerContext.addLayer(
        L.marker(layer.getBounds().getCenter(), {
          icon: L.divIcon({
            className: 'label',
            html: feature.properties.num, //TODO: Check for errors
            iconSize: [15, 20],
          }),
          interactive: false
        })
      );
    }
  });
  module.exports.tileCompositeLayerContext.addLayer(module.exports.tileLayerContext).addTo(module.exports.mapContext);
}

function generateSubTileLayer(subPlots) {
  module.exports.subTileCompositeLayerContext = new L.LayerGroup();
  module.exports.subTileLayerContext = L.geoJSON(subPlots, {
    style: feature => {
      let tile = TileData.findOne({"num": feature.properties.num});
      let subtile = tile.subtiles[feature.properties.idx];
      return {
        fillColor: module.exports.updateTileCoverageColoring(subtile),
        color: STROKE_COLOR,
        fillOpacity: FILL_OPACITY
      }
    },
    onEachFeature: function(feature, layer) {
      layer.on({
        click: event => {
          let tile = TileData.findOne({"num": feature.properties.num});
          let subtile = tile.subtiles[feature.properties.idx];
          Session.set("tileContext", subtile);
          //Session.set('dateIdx', 0);
          Session.set('lonLat',  feature.properties.lonLat);

          let focusedSubTile = subtile[Session.get('plantFocus')];
          layerContext = layer;
        }
      });

      module.exports.subTileCompositeLayerContext.addLayer(L.marker(layer.getBounds().getCenter(), {
        icon: L.divIcon({
          className: 'label',
          html: feature.properties.name, //TODO: Check for errors
          iconSize: [15, 20],
        }),
        interactive: false
      }));
    }
  });
  module.exports.subTileCompositeLayerContext.addLayer(module.exports.subTileLayerContext);
}

function setOnZoomListener() {
  let map = module.exports.mapContext;
  let layerChanged = true;
  map.on('zoomend', event => {
    module.exports.updateMapColoring();
    module.exports.toggleMapLayer();
    if (map.getZoom() === MapLayers.TILE) {
      layerChanged = true;
    }
    else if ((map.getZoom() === MapLayers.SUBTILE || map.getZoom() === MapLayers.SUBTILE_ZOOMED) && layerChanged === true) {
      layerChanged = false;
    }

    Session.set('date')
    Session.set('tileContext');
    Session.set('lonLat');
  });
}
