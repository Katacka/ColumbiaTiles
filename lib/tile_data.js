import { Mongo } from 'meteor/mongo';
export const TileData = new Mongo.Collection('TileData');

Meteor.methods({
  'updateTile': (tile) => {
    //console.log(tile);
    TileData.update( { "name": tile.name }, { $set: tile } );
  },
  'sortTilePriority': () => { //TODO: Finish
    TileData.find().sort({ subtiles })
  }
});

if (Meteor.isServer) {
  //initializeTileDB(68);

  function initializeTileDB(numTiles) {
    for (let i = 1; i <= numTiles; i++) {
      let subtileArray = initializeSubTiles(i);
      updateTileDB(subtileArray, i);
    }
  }

  function initializeSubTiles(tileNum) {
    let subtileArray = [];
    for (let i = 0; i < 4; i++) {
      subtileArray.push(updateSubtile(tileNum, String.fromCharCode(97 + i), i));
    }
    return subtileArray;
  }

  function updateSubtile(num, char, idx) {
    let id = num + char;
    return {
      "name": "Subtile_" + id,
      "id": id,
      "num": num,
      "idx": idx,
      "lonLat": {},
      "laurel": {
        "dates": {}
        //"date": new Date(),
        //"class": 0,
        //"coverage": 0,
        //"resprouts": 0,
        //"workHistory": [], //Date, method, crewSize, crewLeader, comments
        //"photos": [] //Photo, date, caption
      },
      "blackberry": {
        "dates": {}


      },
      "smallHolly": {
        "dates": {}

        //"date": new Date(),
        //"class": 0,
        //"coverage": 0,
        //"resprouts": 0,
        //"workHistory": [], //Date, method, crewSize, crewLeader, comments
        //"photos": [] //Photo, date, caption
      },
      "largeHolly": {
        "dates": {}

        //"date": new Date(),
        //"class": 0,
        //"coverage": 0,
        //"resprouts": 0,
        //"workHistory": [], //Date, method, crewSize, crewLeader, comments
        //"photos": [] //Photo, date, caption
      },
      "groundIvy": {
        "dates": {}

        //"class": 0,
        //"coverage": 0,
        //"resprouts": 0,
        //"workHistory": [], //Date, method, crewSize, crewLeader, comments
        //"photos": [] //Photo, date, caption
      },
      "treeIvy": {
        "dates": {}

        //"date": new Date(),
        //"class": 0,
        //"coverage": 0,
        //"resprouts": 0,
        //"workHistory": [], //Date, method, crewSize, crewLeader, comments
        //"photos": [] //Photo, date, caption
      }
    }
  }

  function updateTileDB(subtileArray, index) {
    TileData.update({
      "name": "Tile_" + index
    }, {
      "name": "Tile_" + index,
      "num": index,
      "lonLat": {},
      "laurel": {
        "dates": {}

        //"date": new Date(),
        //"class": 0,
        //"coverage": 0,
      },
      "blackberry": {
        "dates": {}

        //"date": new Date(),
        //"class": 0,
        //"coverage": 0,
      },
      "smallHolly": {
        "dates": {}

        //"date": new Date(),
        //"class": 0,
        //"coverage": 0,
      },
      "largeHolly": {
        "dates": {}

        //"date": new Date(),
        //"class": 0,
        //"coverage": 0,
      },
      "groundIvy": {
        "dates": {}

        //"date": new Date(),
        //"class": 0,
        //"coverage": 0,
      },
      "treeIvy": {
        "dates": {}

        //"date": new Date(),
        //"class": 0,
        //"coverage": 0,
      },
      "subtiles": subtileArray
    }, {
      "upsert": true
    });
  }
}
