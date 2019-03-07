import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { TileData } from '/lib/tile_data.js'
import './main.html';

const Map = require('/client/map.js');

//Author: Julian Donovan
//Contact: julian.a.donov@gmail.com

//Pictures w/ annotations
//Class + Percent coverage for each species (4) for varying time periods

Session.set("isBlurred", false);
Session.set("date", 'test');
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
  Meteor.subscribe('TileData', () => { //Accesses  tile data as stored on the server to generate a map
    console.log(TileData.find().fetch());
    Map.generateMap();
  });
});

Template.plantTypesNavBar.onCreated(() => {
  window.location.hash = 'blackberry'; //Targets the blackberry pane as the page context
  Session.set('plantFocus', 'blackberry');
});

Template.plantTypesNavBar.helpers({
  tileName() { //Specifically returns the tile name, or layer if no tile context exists
    console.log(Map.mapContext);
    let tile = Session.get("tileContext");
    if (tile) return tile.name;
    else if (Map.mapContext.getZoom() === 16) return "Tile_Layer"
    else return "Subtile_Layer";
  },
  gps() { //Describes the GPS coordinates of the selected tile
    let lonLat = Session.get("lonLat");
    return {
      lon: 'Lon: ' + lonLat.lon.toFixed(7),
      lat: 'Lat: ' + lonLat.lat.toFixed(7)
    };
  }
});

Template.plantTypesNavBar.events({
  'click #plantTypesNavBar a'(event, template) {
    Session.set('dateIdx', 0);
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
    let focusedTile = tile[Session.get("plantFocus")];
    console.log(focusedTile);
    //let dateIdx = Session.get("dateIdx");
    let date = Session.get("date") || 'test';
    console.log(focusedTile);
    console.log(date);

    layerContext.setStyle({ fillColor: Map.updateTileCoverageColoring(tile) }); //Updates map coloring

    return focusedTile[date];
  },
  /*workEntry() { //TODO: Temporarily removed
    let tile = Session.get("tileContext");
    let tileData = tile[Session.get("plantFocus")];

    tileData.forEach(entry => {
      entry.date = entry.date.toISOString().substring(0, 10);
    });

    return tileData;
  }*/
});

Template.dataDisplay.events({
  'change #tileData #coveragePercent'(event, template) { //Handles tile coverage updates
    let coveragePercent = parseInt(event.currentTarget.value);
    let plantFocus = Session.get('plantFocus');
    let tile = Session.get('tileContext');
    let date = Session.get('date') || 'test';

    tile[plantFocus][date] = {
      class: invasiveCoverageConversion(coveragePercent),
      coverage: coveragePercent
    };

    console.log(tile);

    //tile[plantFocus].splice(0, 0, {'class': coverageClass});

    Meteor.call('updateTile', tile); //Updates the tile data server-side
    Session.set('tileContext', tile); //Updates the tile data client-side
  },
  /*'change #subtileData #coverageClass'(event, template) { //Handles subtile coverage updates (from the subtile interface)
    let coverageClass = parseInt(event.currentTarget.value);
    let subtile = Session.get('tileContext');
    let focusedTile = subtile[Session.get('plantFocus')];
    //let dateIdx = Session.get("dateIdx");

    if (dateIdx < focusedTile.length && dateIdx >= 0) {
      let tileData = focusedTile[dateIdx];
      tileData.class = coverageClass;

      let tile = TileData.findOne({"num": subtile.num});
      tile.subtiles[subtile.idx] = subtile;

      Meteor.call('updateTile', tile); //Updates the tile data server-side
      Session.set('tileContext', subtile); //Updates the tile data client-side
    }
  },*/
  'change #subtileData #coveragePercent'(event, template) { //Handles subtile coverage percent updates (from the subtile interface)
    let coveragePercent = parseInt(event.currentTarget.value);
    let subtile = Session.get('tileContext');
    let focusedTile = subtile[Session.get('plantFocus')];
    let dateIdx = Session.get("dateIdx");

    if (dateIdx < focusedTile.length && dateIdx >= 0) {
      let tileData = focusedTile[dateIdx];
      tileData.coverage = coveragePercent;
      let tile = TileData.findOne({"num": subtile.num});
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
    //Gather data from the relevant table row
    let trContext = $(event.currentTarget).closest('tr');
    let data = {
      'class': parseInt($('#coverageClass').val()) || 0,
      'coverage': parseInt($('#coveragePercent').val()) || 0,
      'date': parseDate(trContext.find('.historyDate').val()) || new Date(),
      'progress': parseFloat(trContext.find('.historyProgress').val()),
      'method': trContext.find('.historyMethod').val(),
      'leader': trContext.find('.historyLeader').val(),
      'size': parseInt(trContext.find('.historySize').val()),
      'duration': parseFloat(trContext.find('.historyDuration').val()),
      'comments': trContext.find('.historyComments').val()
    }

    //Ensure all necessary data has been provided
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

      let tile = TileData.findOne({"num": subtile.num});
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

      let tile = TileData.findOne({"num": subtile.num});
      tile.subtiles[subtile.idx] = subtile;

      Meteor.call('updateTile', tile); //Updates the tile data server-side
      Session.set('tileContext', subtile); //Updates the tile data client-side
    }
  },
  'click #photoButton'(event, template) { //TODO: Implement
    //$('#tileComposite').blur(); //Blurs the background
    /*$('#photoModal').css("display", "block");
    Session.set('isBlurred', true);
    Session.set('blurTime', new Date().getTime());*/
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
