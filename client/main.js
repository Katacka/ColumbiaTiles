import {
  Template
} from 'meteor/templating';
import {
  ReactiveVar
} from 'meteor/reactive-var';
import {
  TileData
} from '../lib/collections.js';

import './main.html';

//Author: Julian Donovan
//Contact: julian.a.donov@gmail.com

//Pictures w/ annotations
//Class + Percent coverage for each species (4) for varying time periods
//Number of resprouts for each species (4)

Template.propertyMap.onCreated(() => {
  Session.set("plantFocus", "blackberry");

  Tracker.autorun(() => {
    Meteor.subscribe('tileData', () => {
      //console.log(TileData.find().fetch());
    });
  });
});

Template.propertyMap.onRendered(function helloOnCreated() {
  var map = L.map('map', {
    maxBoundsViscosity: 1.0, //Bounds as set are treated as fully solid
    bounceAtZoomLimits: false, //Inhibits rubber-banding when one tries to zoom in or out too far
    center: [45.6006, -122.5449285],
    zoom: 16,
    minZoom: 16,
    maxZoom: 18,
    maxBounds: [
      [45.597776, -122.537072],
      [45.603645, -122.552085]
    ],
  });
  L.tileLayer.provider('OpenStreetMap.Mapnik').addTo(map); //Alternate: Esri.WorldImagery

  var plots = [];
  var subPlots = [];
  generateTiles(plots, subPlots, [{
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
  ]);

  var tileLayer = new L.LayerGroup();
  tileLayer.addLayer(
    L.geoJSON(plots, {
      style: {},
      onEachFeature: function(feature, layer) {
        layer.on({
          click: event => {
            let tile = TileData.find({
              name: "Tile_" + feature.properties.name
            }).fetch()[0];
            Session.set("tileContext", tile);
            console.log(tile);
          }
        });

        tileLayer.addLayer(L.marker(layer.getBounds().getCenter(), {
          icon: L.divIcon({
            className: 'label',
            html: feature.properties.name,
            iconSize: [15, 20],
          })
        }));
      }
    })
  );

  var subTileLayer = new L.LayerGroup();
  subTileLayer.addLayer(
    L.geoJSON(subPlots, {
      style: {},
      onEachFeature: function(feature, layer) {
        layer.on({
          click: event => {
            let tile = TileData.find({
              name: "Tile_" + feature.properties.num,
              subtiles: {
                $elemMatch: {
                  name: "Subtile_" + feature.properties.name
                }
              }
            }, {
              subtiles: {
                $elemMatch: {
                  name: "Subtile_" + feature.properties.name
                }
              }
            }).fetch()[0];
            console.log(tile);
            Session.set("tileContext", tile);
          }
        });

        subTileLayer.addLayer(L.marker(layer.getBounds().getCenter(), {
          icon: L.divIcon({
            className: 'label',
            html: feature.properties.name,
            iconSize: [15, 20],
          })
        }));
      }
    })
  );

  if (map.getZoom() == 16) {
    tileLayer.addTo(map);
    Session.set('mapZoom', 16);
  } else if (map.getZoom() == 17) {
    subTileLayer.addTo(map);
    Session.set('mapZoom', 17);
  }

  let layerChanged = true;
  map.on('zoomend', event => {
    if (map.getZoom() == 16) {
      subTileLayer.remove();
      tileLayer.addTo(map);
      Session.set('mapZoom', 16);
      Session.set('tileContext');
      layerChanged = true;
    } else if ((map.getZoom() == 17 || map.getZoom() == 18) && layerChanged == true) {
      tileLayer.remove();
      subTileLayer.addTo(map);
      Session.set('mapZoom', 17);
      Session.set('tileContext');
      layerChanged = false;
    }
  });

});

Template.tileDataDisplay.helpers({
  tileDisplay() {
    if (Session.get("tileContext")) return true;
    return false;
  },
  tileName() {
    let tile = Session.get("tileContext");
    if (tile) return tile.name;
    else if (Session.get('mapZoom') == 16) return "Tile_Layer"
    else return "Subtile_Layer";
  },
  isContext(context) {
    return Session.equals('plantFocus', context);
  },
  tileData() {
    let tileRef = Session.get("tileContext");
    return tileRef[Session.get("plantFocus")];
  },
  subtileArray() {
    let subtilesRef = Session.get("tileContext").subtiles;
    let plantFocus = Session.get("plantFocus");
    let subtileArray = [];

    for(let i = 0; i < subtilesRef.length; i++) {
      let subtile = subtilesRef[i];
      let focusedSubtile = subtile[plantFocus];
      focusedSubtile.name = subtile.name;
      subtileArray.push(focusedSubtile);
    }

    console.log(subtileArray);
    return subtileArray;
  },
});

Template.tileDataDisplay.events({
  'click ._plant_types_nav_bar a'(event, template) {
    Session.set('plantFocus', event.currentTarget.name);
    console.log(event.currentTarget.name);
  },
  'change ._plant_data input'(event, template) {
    let percentCoverage = event.currentTarget.value;
    let plantFocus = Session.get('plantFocus');
    console.log(plantFocus);

    //Very broken db access
    let a = TileData.update({
      _id: Session.get("tileContext")._id
    }, {
      $set: {
        [plantFocus]: {
          class: invasiveCoverageConversion(percentCoverage),
          coverage: percentCoverage
        }
      }
    });

    let tile = TileData.find({
      name: Session.get("tileContext").name
    }).fetch()[0];
    console.log(Session.get("tileContext"));
    Session.set("tileContext", tile);
  }
});

function invasiveCoverageConversion(percentCoverage) {
  return (percentCoverage <= 25) ? 1 :
    (percentCoverage <= 50) ? 2 :
    (percentCoverage <= 75) ? 3 : 4;
}

function generateTiles(plots, subPlots, lonLatRows) {
  num = 1;
  lonLatRows.forEach(lonLatRow => {
    for (let i = 1; i <= lonLatRow.size; i++, num++) {
      if (lonLatRow.skip && lonLatRow.skip.includes(i)) {
        num--;
        lonLatRow.lon = lonLatRow.lon + 0.00064;
        continue;
      }
      plots.push({
        "type": "Feature",
        "properties": {
          "name": num,
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

      generateSubTiles(subPlots, lonLatRow, num);

      lonLatRow.lon += 0.00064;
    }
  });
}

function generateSubTiles(subPlots, lonLatRow, num) {
  let lonTileOffset = 0.00032;
  let latTileOffset = 0.000225;

  quadLonRef = lonLatRow.lon;
  quadLatRef = lonLatRow.lat;
  for (let i = 0, j = 0; i < 4; i++) {
    if (i % 2) j++;
    name = num + String.fromCharCode(97 + i);
    quadLon = quadLonRef + lonTileOffset * (j % 2);
    quadLat = quadLatRef - latTileOffset * (i % 2);

    subPlots.push({
      "type": "Feature",
      "properties": {
        "name": name,
        "num": num
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
