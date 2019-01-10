import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { TileData } from '/lib/tile_data.js'
import './main.html';

//Author: Julian Donovan
//Contact: julian.a.donov@gmail.com

//Pictures w/ annotations
//Class + Percent coverage for each species (4) for varying time periods
//Number of resprouts for each species (4)

const FILL_OPACITY = 0.5;

Session.set("isBlurred", false);
Session.set("date", null);
Session.set("dateIdx", 0);
Session.set("lonLat");

Template.body.events({
  'click'(event) {
    if (Session.get("isBlurred") === true && new Date().getTime() > Session.get('blurTime') + 250) {
      //$('body').focus(); //Un-blurs the background
      $('#photoModal').css("display", "none");

    }
  }
});

/*Template.photoModal.helpers({
  photos() {
    let plantFocus = Session.get('plantFocus');
    let subtile = Session.get('tileContext');
    return subtile[plantFocus].photos;
  }
});*/

Template.propertyMap.onCreated(() => {
  Session.set("plantFocus", "blackberry"); //Sets the default invasive species data context (blackberry)
  Meteor.subscribe('TileData', () => {
    console.log(TileData.find().fetch());
    generateMap();
  });
});

function generateMap() {
  map = L.map('map', {
    maxBoundsViscosity: 1.0, //Bounds as set are treated as rigid
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

  generateTilesWithData(map);

  let layerChanged = true;
  map.on('zoomend', event => {
    if (map.getZoom() == 16) {
      subTileCompositeLayer.remove();
      tileCompositeLayer = new L.LayerGroup();
      tileLayer = generateTileLayer();
      tileCompositeLayer.addLayer(tileLayer);
      tileCompositeLayer.addTo(map);
      //Session.set('dateIdx', 0);
      layerChanged = true;
    }
    else if ((map.getZoom() == 17 || map.getZoom() == 18) && layerChanged == true) {
      tileCompositeLayer.remove();
      subTileCompositeLayer = new L.LayerGroup();
      subTileLayer = generateSubTileLayer();
      subTileCompositeLayer.addLayer(subTileLayer);
      subTileCompositeLayer.addTo(map);
      //Session.set('dateIdx', 0);
      layerChanged = false;
    }

    Session.set('date')
    Session.set('tileContext');
    Session.set('lonLat');
    Session.set('mapZoom', map.getZoom());
  });
}

function generateTilesWithData(map) {
  plots = [];
  subPlots = [];
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

  generateTiles(plots, subPlots, latLonCoords);

  tileCompositeLayer = new L.LayerGroup();
  tileLayer = generateTileLayer();
  tileCompositeLayer.addLayer(tileLayer);

  subTileCompositeLayer = new L.LayerGroup();
  subTileLayer = generateSubTileLayer();
  subTileCompositeLayer.addLayer(subTileLayer);

  if (map.getZoom() == 16) {
    tileCompositeLayer.addTo(map);
    Session.set('mapZoom', 16);
  } else if (map.getZoom() == 17 || map.getZoom() == 18) {
    subTileCompositeLayer.addTo(map);
    Session.set('mapZoom', 17);
  }
}

Template.plantTypesNavBar.helpers({
  tileName() { //Specifically returns the tile name, or layer if no tile context exists
    let tile = Session.get("tileContext");
    if (tile) return tile.name;
    else if (Session.get('mapZoom') == 16) return "Tile_Layer"
    else return "Subtile_Layer";
  },
  gps() {
    let lonLat = Session.get("lonLat");

    console.log(lonLat);
    if (lonLat === undefined || lonLat === null) {
      $('#lonLat').css('visibility', 'hidden');
      return {
        'lon': -122.5470300,
        'lat': 45.5997300
      }
    }
    else {
      $('#lonLat').css('visibility', 'visible');
      return {
        'lon': lonLat.lon.toFixed(7),
        'lat': lonLat.lat.toFixed(7)
      }
    }
  }
});

Template.plantTypesNavBar.events({
  'click #plantTypesNavBar a'(event, template) {
    Session.set('dateIdx', 0);
    Session.set('date')
    Session.set('plantFocus', event.currentTarget.name);
    if (map.getZoom() === 16) {
      tileCompositeLayer.remove();

      tileCompositeLayer = new L.LayerGroup();
      tileLayer = generateTileLayer();
      tileCompositeLayer.addLayer(tileLayer);

      tileCompositeLayer.addTo(map);
    }
    else if (map.getZoom() === 17 || map.getZoom() === 18) {
      subTileCompositeLayer.remove();

      subTileCompositeLayer = new L.LayerGroup();
      subTileLayer = generateSubTileLayer();
      subTileCompositeLayer.addLayer(subTileLayer);

      subTileCompositeLayer.addTo(map);
    }
  }
});

Template.dataDisplay.helpers({
  isTileContext() { //Determines whether tile data should be displayed
    if (Session.get("tileContext")) return true;
    return false;
  },
  tileData() { //Returns tile data specific to the plant focus
    let tile = Session.get("tileContext");
    let focusedTile = tile[Session.get("plantFocus")];
    console.log(focusedTile);
    let dateIdx = Session.get("dateIdx");

    layerContext.setStyle({ fillColor: updateTileCoverageColoring(tile) }); //Updates map coloring

    if (dateIdx < focusedTile.length && dateIdx >= 0) {
      return focusedTile[dateIdx];
    }
  },
  subtileArray() { //Returns an array of the four subtiles of a tile
    let subtilesRef = Session.get("tileContext").subtiles;
    let plantFocus = Session.get("plantFocus");
    let subtileArray = [];

    for(let i = 0; i < subtilesRef.length; i++) {
      let subtile = subtilesRef[i];
      let focusedSubtile = subtile[plantFocus];
      let subTileData = {};
      subTileData.name = subtile.name;
      if (focusedSubtile.length > 0) {
        subTileData = focusedSubtile[0];
      }
      subtileArray.push(subTileData);
    }
    return subtileArray;
  },
  isTileLayer() {
    return (Session.get('mapZoom') === 16);
  },
  workEntry() {
    let tile = Session.get("tileContext");
    let tileData = tile[Session.get("plantFocus")];

    //  $('#historyBody tr').eq(1).addClass('selected');

    tileData.forEach(entry => {
      entry.date = entry.date.toISOString().substring(0, 10);
    });
    return tileData;
  },
  highlightRow() {
    let dateIdx = Session.get
    //if ()
  }
});

Template.dataDisplay.events({
  'change #tileData .coverageClass'(event, template) { //Handles tile coverage updates
    let coverageClass = parseInt(event.currentTarget.value);
    let plantFocus = Session.get('plantFocus');
    let tile = Session.get('tileContext');

    tile[plantFocus].splice(0, 0, {'class': coverageClass});

    Meteor.call('updateTile', tile); //Updates the tile data server-side
    Session.set('tileContext', tile); //Updates the tile data client-side
  },
  /*'change ._subtile_preview_array .coverageClass'(event, template) { //Handles subtile coverage updates (from the tile overview interface)
    let coverageClass = parseInt(event.currentTarget.value);
    let plantFocus = Session.get('plantFocus');
    let tile = Session.get('tileContext');

    let idxStr = $(event.currentTarget).closest('td[data-idx]').data().idx;
    let idx = parseInt(idxStr);
    let subtile = tile.subtiles[idx];
    let focusedSubTile = subtile[plantFocus];

    if (focusedSubTile.length > 0) {
      focusedSubTile[0].class = coverageClass;
      tile.subtiles[idx] = subtile;

      Meteor.call('updateTile', tile); //Updates the tile data server-side
      Session.set('tileContext', tile); //Updates the tile data client-side
    }
  },
  'change ._subtile_preview_array #numberResprouts'(event, template) { //Handles subtile resprout updates (from the tile overview interface)
    let numberResprouts = parseInt(event.currentTarget.value);
    let plantFocus = Session.get('plantFocus');
    let tile = Session.get('tileContext');

    let idxStr = $(event.currentTarget).parent().parent()[0].dataset.idx;
    let idx = parseInt(idxStr);
    let subtile = tile.subtiles[idx];
    let focusedSubTile = subtile[plantFocus];

    if (focusedSubTile.length > 0) {
      focusedSubTile[0].resprouts = numberResprouts;
      tile.subtiles[idx] = subtile;

      Meteor.call('updateTile', tile); //Updates the tile data server-side
      Session.set('tileContext', tile); //Updates the tile data client-side
    }
  },*/
  'change ._subtile_data .coverageClass'(event, template) { //Handles subtile coverage updates (from the subtile interface)
    let coverageClass = parseInt(event.currentTarget.value);
    let subtile = Session.get('tileContext');
    let focusedTile = subtile[Session.get('plantFocus')];
    let dateIdx = Session.get("dateIdx");

    if (dateIdx < focusedTile.length && dateIdx >= 0) {
      let tileData = focusedTile[dateIdx];
      tileData.class = coverageClass;

      let tile = TileData.find({"num": subtile.num}).fetch()[0];
      tile.subtiles[subtile.idx] = subtile;

      Meteor.call('updateTile', tile); //Updates the tile data server-side
      Session.set('tileContext', subtile); //Updates the tile data client-side
    }
    else if (dateIdx === -1) {
      //layerContext.setStyle({ fillColor: updateCoverageColoring(coverageClass) });
    }
  },
  'change ._subtile_data #numberResprouts'(event, template) { //Handles subtile resprout updates (from the subtile interface)
    let numberResprouts = parseInt(event.currentTarget.value);
    let subtile = Session.get('tileContext');
    let focusedTile = subtile[Session.get('plantFocus')];
    let dateIdx = Session.get("dateIdx");

    if (dateIdx < focusedTile.length && dateIdx >= 0) {
      let tileData = focusedTile[dateIdx];
      tileData.resprouts = numberResprouts;
      let tile = TileData.find({"num": subtile.num}).fetch()[0];
      tile.subtiles[subtile.idx] = subtile;

      Meteor.call('updateTile', tile); //Updates the tile data server-side
      Session.set('tileContext', subtile); //Updates the tile data client-side
    }
  },
  'click #scrollableTable tr'(event, template) {
    let plantFocus = Session.get('plantFocus');
    let subtile = Session.get('tileContext');
    let focusedSubtile = subtile[plantFocus];

    let trContext = $(event.currentTarget);
    $('tr').not(this).removeClass('selected');
    trContext.addClass('selected');

    if (!trContext.is('#tableHeader')) Session.set("dateIdx", trContext.index() - 1); //Compensates for the two default rows
    console.log(Session.get("dateIdx"));
    Session.set("date", parseDate(trContext.find('.historyDate').val()) || new Date());
  },
  'change #scrollableTable input'(event, template) {
    let trContext = $(event.currentTarget).closest('tr');
    let data = {
      'class': parseInt($('.coverageClass').val() || 0),
      //'coverage':
      'resprouts': parseInt($('#numberResprouts').val() || 0),
      'date': parseDate(trContext.find('.historyDate').val()) || new Date(),
      'progress': parseFloat(trContext.find('.historyProgress').val()),
      'method': trContext.find('.historyMethod').val(),
      'leader': trContext.find('.historyLeader').val(),
      'size': parseInt(trContext.find('.historySize').val()),
      'duration': parseFloat(trContext.find('.historyDuration').val()),
      'comments': trContext.find('.historyComments').val()
    }

    let formFilled = true;
    for (let key in data)  {
      if (data[key] === null || data[key] === undefined || data[key] === "") formFilled = false;
    }

    if (formFilled) {
      let plantFocus = Session.get('plantFocus');
      let subtile = Session.get('tileContext');
      let focusedSubtile = subtile[plantFocus];

      console.log(data);
      let i = insertSubtileData(data, focusedSubtile);
      //Session.set("dateIdx", i);
      //console.log(i);

      let tile = TileData.find({"num": subtile.num}).fetch()[0];
      tile.subtiles[subtile.idx] = subtile;

      $('#defaultEntry').find('input').val(''); //Clear input row

      Meteor.call('updateTile', tile); //Updates the tile data server-side
      Session.set('tileContext', subtile); //Updates the tile data client-side
    }
  },
  'click #deleteRow'(event, template) {
    let trContext = $(event.currentTarget).closest('tr');
    let trIdx = trContext.index();

    let plantFocus = Session.get('plantFocus');
    let subtile = Session.get('tileContext');
    let focusedSubtile = subtile[plantFocus];

    if (focusedSubtile.length >= trIdx) {
       focusedSubtile.splice(trIdx - 1, 1);

      let tile = TileData.find({"num": subtile.num}).fetch()[0];
      tile.subtiles[subtile.idx] = subtile;

      Meteor.call('updateTile', tile); //Updates the tile data server-side
      Session.set('tileContext', subtile); //Updates the tile data client-side
    }
  },
  'click #photoButton'(event, template) {
    //$('#tileComposite').blur(); //Blurs the background
    $('#photoModal').css("display", "block");
    Session.set('isBlurred', true);
    Session.set('blurTime', new Date().getTime());
  }
});

function parseDate(s) {
  if (s !== undefined && s !== null) {
    var b = s.split(/\D/);
    return new Date(b[0], --b[1], b[2]);
  }
  return undefined;
}

function insertSubtileData(data, focusedSubtile) {
  let time = data.date.getTime()/3600000; //Time in hours
  let prevDate = Session.get("date")
  let prevTime = (prevDate) ? prevDate.getTime()/3600000 : new Date().getTime()/3600000;

  for (var i = 0; i < focusedSubtile.length; i++) {
    if (time > focusedSubtile[i].date.getTime()/3600000) {
      focusedSubtile.splice(i, 0, data);
      return i;
    }
    else if (time === focusedSubtile[i].date.getTime()/3600000) {
      if (time != prevTime) {
        focusedSubtile.splice(i, 0);
      }
      focusedSubtile[i] = data;
      return i;
    }
  }
  focusedSubtile.push(data);
  return i;
}

function generateTileLayer() {
  return L.geoJSON(plots, {
    style: feature => {
      let tile = TileData.find({"num": feature.properties.num}).fetch()[0];
      return {
        fillColor: updateTileCoverageColoring(tile),
        color: 'white',
        fillOpacity: FILL_OPACITY
      }
    },
    onEachFeature: function(feature, layer) {
      layer.on({
        click: event => {
          let tile = TileData.find({"num": feature.properties.num}).fetch()[0];
          Session.set("tileContext", tile);
          Session.set('dateIdx', 0);
          Session.set('lonLat',  feature.properties.lonLat);
          layerContext = layer;
        }
      });

      tileCompositeLayer.addLayer(
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
}

function generateSubTileLayer() {
  return L.geoJSON(subPlots, {
    style: feature => {
      let tile = TileData.find({"num": feature.properties.num}).fetch()[0];
      let subtile = tile.subtiles[feature.properties.idx];
      return {
        fillColor: updateTileCoverageColoring(subtile),
        color: 'white',
        fillOpacity: FILL_OPACITY
      }
    },
    onEachFeature: function(feature, layer) {
      layer.on({
        click: event => {
          let tile = TileData.find({"num": feature.properties.num}).fetch()[0];
          let subtile = tile.subtiles[feature.properties.idx];
          Session.set("tileContext", subtile);
          Session.set('dateIdx', 0);
          Session.set('lonLat',  feature.properties.lonLat);

          let focusedSubTile = subtile[Session.get('plantFocus')];
          layerContext = layer;
        }
      });

      subTileCompositeLayer.addLayer(L.marker(layer.getBounds().getCenter(), {
        icon: L.divIcon({
          className: 'label',
          html: feature.properties.name, //TODO: Check for errors
          iconSize: [15, 20],
        }),
        interactive: false
      }));
    }
  });
}

/*function invasiveCoverageConversion(percentCoverage) {
  let plantFocus = Session.get('plantFocus');
  if (plantFocus === 'ivy' || plantFocus === 'blackberry') { //True percent coverage
    return (percentCoverage === 0) ? 0 :
           (percentCoverage <= 0.5) ? 1 :
           (percentCoverage <= 5) ? 2 :
           (percentCoverage <= 25) ? 3 : 4;
  }
  else { //Number of plants
    return (percentCoverage === 0) ? 0 :
           (percentCoverage <= 2) ? 1 :
           (percentCoverage <= 5) ? 2 :
           (percentCoverage <= 15) ? 3 : 4;
  }
}*/

function updateTileCoverageColoring(tile) {
  let focusedTile = tile[Session.get('plantFocus')];
  let dateIdx = Session.get("dateIdx");

  if (dateIdx < focusedTile.length && dateIdx >= 0) {
    let tileClass = focusedTile[dateIdx].class;
    return updateCoverageColoring(tileClass);
  }

  console.log('Invalid coverage class encountered when updating tile coloring');
  return '#BEBEBE'; //Gray
}

//TODO: The colors are not pronounced enough
function updateCoverageColoring(tileClass) { //TODO: Add purple coloring for plots to revisit
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
  return '#BEBEBE'; //Gray
  /*return coverage > 75 ? '#00FF7F':
          coverage > 50  ? '#BD0026':
          coverage > 25  ? '#E31A1C': '#FFEDA0';*/
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
    name = num + String.fromCharCode(97 + i);
    quadLon = quadLonRef + lonTileOffset * (i % 2);
    quadLat = quadLatRef - latTileOffset * (j % 2);
    if (i % 2) j++;

    subPlots.push({
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
