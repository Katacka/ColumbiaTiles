import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import Moment from 'moment';
import { TileData } from '/lib/tile_data.js'
import './main.html';

const Map = require('/client/map.js');

//Author: Julian Donovan
//Contact: julian.a.donov@gmail.com

//Pictures w/ annotations
//Class + Percent coverage for each species (4) for varying time periods

Session.set("lonLat");

Template.body.events({
  'click'(event) {
    if (event.currentTarget.id == 'analyticsOverlay' || event.currentTarget.id == 'photoModal') {
      if ($('#tileComposite').css('filter') !== 'none' && new Date().getTime() > Session.get('blurTime') + 250) {
        $('#tileComposite').css("filter", "none"); //Unblur the background
        $('#photoModal').css('display', 'none'); //Hide the photo modal
        $('#analyticsOverlay').css('display', 'none'); //Hide the analytics overlay

        window.location.hash = Session.get('prevHash');
      }
    }
  }
});

Template.photoModal.onCreated(() => {
  //$('.file_upload').file_upload();
});

Template.photoModal.helpers({
  photos() {
    let plantFocus = Session.get('plantFocus');
    let subtile = Session.get('tileContext');
    //if (subtile) return subtile[plantFocus].photos;
  }
});

Template.photoModal.events({
});

Template.analyticsOverlay.onCreated(() => {
  //Tile priority
  Session.set('selectedPlantTypes', ['blackberry']);
});

Template.analyticsOverlay.helpers({
  isTilePriortities() {
    return Session.get('analyticsOption');
  },
  tilePriority() {
    let selectedPlantTypes = Session.get('selectedPlantTypes');
    let tiles = TileData.find().fetch();

    return rankTilesByPlantType(tiles, ...selectedPlantTypes).tiles;
  }
});

Template.analyticsOverlay.events({
  'click .checkmark' (event) {
    let selectedPlantTypes = Session.get('selectedPlantTypes');
    let plantType = event.target.dataset.plantType;

    if (selectedPlantTypes.includes(plantType)) selectedPlantTypes = selectedPlantTypes.filter((plant) => plant != plantType);
    else selectedPlantTypes.push(plantType);

    console.log(selectedPlantTypes);
    Session.set('selectedPlantTypes', selectedPlantTypes);
  }
});



Template.propertyMap.onCreated(() => {
  Meteor.subscribe('TileData', () => { //Accesses  tile data as stored on the server to generate a map
    console.log(TileData.find().fetch());
    Map.generateMap();
    //rankTilesByPriority();
  });
});

Template.dateSelect.onRendered(() => {
  Session.set("date", new Moment().format('LL'));
  $('#dateSelector').datetimepicker({
    format: 'LL',
    defaultDate: new Moment()
  }).on('dp.change', (e) => {
    Session.set('date', e.date.format('LL'));
    Map.updateMapColoring();
  });
});

Template.plantTypesNavBar.onCreated(() => {
  window.location.hash = 'blackberry'; //Targets the blackberry pane as the page context
  Session.set('plantFocus', 'blackberry');
});

Template.plantTypesNavBar.helpers({
  tileName() { //Specifically returns the tile name, or layer if no tile context exists
    let tile = Session.get("tileContext");
    if (tile) return tile.name;
    else if (Session.get('zoom') === 16) return "Tile_Layer"
    else return "Subtile_Layer";
  },
  lastModified() {
    let lastModified = Session.get('lastModified');
    if (lastModified) {
      return ' - ' + lastModified;
    }
  },
  gps() { //Describes the GPS coordinates of the selected tile
    let lonLat = Session.get("lonLat");
    if (lonLat) {
      return {
        lon: 'Lon: ' + lonLat.lon.toFixed(7),
        lat: 'Lat: ' + lonLat.lat.toFixed(7)
      };
    }
  }
});

Template.plantTypesNavBar.events({
  'click #plantTypesNavBar a'(event, template) {
    Session.set('plantFocus', event.currentTarget.id);
    Map.updateMapColoring(); //TODO: Remove once session reactivity issues are resolved
  }
});

Template.dataDisplay.helpers({
  isTileContext() { //Determines whether tile data should be displayed
    return Session.get("tileContext");
  },
  isTileLayer() { //TODO: Might need to fix a race condition
    return Map.mapContext.getZoom() === 16;
  },
  tileData() { //Returns tile data specific to the plant focus
    let tile = Session.get("tileContext");
    let plantFocus = Session.get("plantFocus");
    let date = Session.get("date");

    layerContext.setStyle({ fillColor: Map.updateTileCoverageColoring(tile, plantFocus, date) }); //Updates map coloring

    return Map.findClosestTileByDate(tile, plantFocus, date);
  }
});

Template.dataDisplay.events({
  'change #tileData #coveragePercent'(event, template) { //Handles tile coverage updates
    let coveragePercent = parseFloat(event.currentTarget.value);
    let plantFocus = Session.get('plantFocus');
    let tile = Session.get('tileContext');
    let date = Session.get('date');

    tile[plantFocus].dates[date] = {
      class: invasiveCoverageConversion(coveragePercent),
      coverage: coveragePercent
    };

    Meteor.call('updateTile', tile); //Updates the tile data server-side
    Session.set('tileContext', tile); //Updates the tile data client-side
  },
  'change #subtileData input'(event, template) {
     handleSubtileData(event);
  },
  'change #subtileData textarea'(event, template) {
    handleSubtileData(event);
  },
  'click #photoButton'(event, template) { //TODO: Implement
    $('#tileComposite').css('filter', "blur(5px)"); //Blurs the background
    $('#photoModal').css("display", "flex");
    Session.set('blurTime', new Date().getTime());

  },
  'click #analyticsButton'(event, template) {
    $('#tileComposite').css('filter', "blur(5px)"); //Blurs the background
    $('#analyticsOverlay').css("display", "flex");
    Session.set('blurTime', new Date().getTime());

    //Grant tile priority default focus
    Session.set('prevHash', window.location.hash);
    Session.set('analyticsOption', 'tilePriorities');
    window.location.hash = 'tilePriorities';
  }
});

function handleSubtileData(event, progressUpdate) {
  let plantFocus = Session.get('plantFocus');
  let subtile = Session.get('tileContext');
  let date = Session.get('date');

  let prevTileRef = Map.findClosestTileByDate(subtile, plantFocus, date);
  let coverage = parseFloat($('#coveragePercent').val());
  let progress = (prevTileRef) ? prevTileRef.coverage - coverage : 0;

  let dataContext = $('#detailData');
  let data = {
    'class': invasiveCoverageConversion(coverage),
    'progress': progress.toFixed(1),
    'coverage': coverage,
    'date': date,
    'method': dataContext.find('.historyMethod').val(),
    'leader': dataContext.find('.historyLeader').val(),
    'size': parseInt(dataContext.find('.historySize').val()),
    'duration': parseFloat(dataContext.find('.historyDuration').val()),
    'comments': dataContext.find('.historyComments').val()
  }

  //Ensure all necessary data has been provided
  if (isNaN(data['coverage'])) return;
  //if (data['coverage'] === null || data['coverage'] === undefined || data['coverage'] === "") return;

  subtile[plantFocus].dates[date] = data;
  console.log(subtile);

  let tile = TileData.findOne({"num": subtile.num});
  tile.subtiles[subtile.idx] = subtile;

  Meteor.call('updateTile', tile); //Updates the tile data server-side
  Session.set('tileContext', subtile); //Updates the tile data client-side
}

function parseDate(s) {
  if (s !== undefined && s !== null) {
    var b = s.split(/\D/);
    return new Date(b[0], --b[1], b[2]);
  }
}

function invasiveCoverageConversion(percentCoverage) {
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
}

function rankTilesByPriority() {
  let tiles = TileData.find().fetch();
  let siteRankings = {
    laurel: rankTilesByPlantType(tiles, 'laurel'),
    blackberry: rankTilesByPlantType(tiles, 'blackberry'),
    holly: {
      smallHolly: rankTilesByPlantType(tiles, 'smallHolly'),
      largeHolly: rankTilesByPlantType(tiles, 'largeHolly'),
      overall: rankTilesByPlantType(tiles, 'smallHolly', 'largeHolly'),
    },
    ivy: {
      groundIvy: rankTilesByPlantType(tiles, 'groundIvy'),
      treeIvy: rankTilesByPlantType(tiles, 'treeIvy'),
      overall: rankTilesByPlantType(tiles, 'groundIvy', 'treeIvy'),
    },
    ivyBlackberry: rankTilesByPlantType(tiles, 'groundIvy', 'treeIvy', 'blackberry'),
    overall: rankTilesByPlantType(tiles, 'laurel', 'blackberry', 'smallHolly', 'largeHolly', 'groundIvy', 'treeIvy')
  }
  console.log(siteRankings);
}

//TODO: Currently simplified to intersort by coverage/trails
function rankTilesByPlantType(tiles, ...plantTypes) {
  let date = Session.get('date');
  let sortedTiles = tiles.filter(tile => plantGroupCoverageSum(tile, date, plantTypes) > 0)
                         .sort((a, b) => {
                           let bScore = plantGroupCoverageSum(b, date, plantTypes) * calculateMinTrailDistance(b);
                           let aScore = plantGroupCoverageSum(a, date, plantTypes) * calculateMinTrailDistance(a);
                           return bScore - aScore;
                         });

  let subtiles = [];
  tiles.forEach(tile => {
    tile.subtiles.forEach(subtile => subtiles.push(subtile))
  })

  let sortedSubtiles = subtiles.filter(subtile => plantGroupCoverageSum(subtile, date, plantTypes) > 0)
                               .sort((a, b) => {
                                 let bScore = plantGroupCoverageSum(b, date, plantTypes) * calculateMinTrailDistance(b);
                                 let aScore = plantGroupCoverageSum(a, date, plantTypes) * calculateMinTrailDistance(a);
                                 return bScore - aScore
                               });

  return {tiles: sortedTiles, subtiles: sortedSubtiles};
}

function plantGroupCoverageSum(tile, date, plantTypes) {
  let coverageSum = 0;
  plantTypes.forEach(plantType => {
    let focusedTile = Map.findClosestTileByDate(tile, plantType, date);
    if (focusedTile) {
      coverageSum += (1 + focusedTile.coverage)
    }
  });
  return coverageSum;
}

function calculateMinTrailDistance(tile) {
  if (tile.trailDistance) return tile.trailDistance;

  let minDistance = Infinity;
  let tileCenter = tile.lonLat;

  Map.trailsContext.eachLayer((layer) => {
    layer.feature.geometry.coordinates.forEach((point) => {
      let lonDistance = Math.pow(point[0] - tileCenter.lon, 2);
      let latDistance = Math.pow(point[1] - tileCenter.lat, 2);
      let distance = Math.sqrt(lonDistance + latDistance);
      if (distance <= minDistance) {
        minDistance = (distance === 0) ? distance  + 0.000001 : distance;
      }
    });
  });

  let effectiveDistance = Math.abs(Math.log(minDistance));
  let subtileIdx = (typeof tile.idx === 'number') ? tile.idx : null;
  Map.updateTileParam(tile.num, 'trailDistance', effectiveDistance, subtileIdx);

  return effectiveDistance;
}
