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
    if ($('#tileComposite').css('filter') !== 'none' && new Date().getTime() > Session.get('blurTime') + 250) {
      $('#tileComposite').css("filter", "none"); //Unblur the background
      $('#photoModal').css('display', 'none'); //Hide the photo modal
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

Template.propertyMap.onCreated(() => {
  Meteor.subscribe('TileData', () => { //Accesses  tile data as stored on the server to generate a map
    console.log(TileData.find().fetch());
    Map.generateMap();
    rankSitesByPriority();
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

    if (tile[plantFocus].dates[date]) {
      Session.set('lastModified', date);
      return tile[plantFocus].dates[date];
    }
    else return Map.findClosestTileByDate(tile, plantFocus, date);;
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
  }
});

function handleSubtileData(event) {
  let coveragePercent = parseInt(event.currentTarget.value);
  let plantFocus = Session.get('plantFocus');
  let subtile = Session.get('tileContext');
  let date = Session.get('date');

  let dataContext = $('#detailData');
  let data = {
    'class': invasiveCoverageConversion(parseFloat($('#coveragePercent').val())),
    'progress': 0,
    'coverage': parseFloat($('#coveragePercent').val()),
    'date': Session.get('date'),
    'method': dataContext.find('.historyMethod').val(),
    'leader': dataContext.find('.historyLeader').val(),
    'size': parseInt(dataContext.find('.historySize').val()),
    'duration': parseFloat(dataContext.find('.historyDuration').val()),
    'comments': dataContext.find('.historyComments').val()
  }

  //Ensure all necessary data has been provided
  for (let key in data)  {
    if (data[key] === null || data[key] === undefined || data[key] === "") return;
  }

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
  return undefined;
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



function rankSitesByPriority() {
  let tiles = TileData.find().fetch();
  /*let siteRankings = {
    laurel: rankSitesByPriority('laurel', tiles),
    blackberry: rankSitesByPriority('blackberry', tiles),
    smallHolly: rankSitesByPriority('smallHolly', tiles),
    largeHolly: rankSitesByPriority('largeHolly', tiles),
    groundIvy: rankSitesByPriority('groundIvy', tiles),
    treeIvy: rankSitesByPriority('treeIvy', tiles)
  }*/
}

//TODO: Currently simplified to intersort by coverage
function rankSitesByPlantType(plantType, tiles) {
}
