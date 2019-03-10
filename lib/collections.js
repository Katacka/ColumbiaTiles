import {
  Mongo
} from 'meteor/mongo';

export const TileData = new Mongo.Collection('TileData');

if (Meteor.isServer) {
  initializeTileDB(68);

  TileData.allow({
    'update'(userId, doc) {
      return true;
    }
  });
}

function initializeTileDB(numTiles) {
  for (let i = 1; i <= numTiles; i++) {
    let subtileArray = initializeSubTiles(i);
    updateTileDB(subtileArray, i);
  }
}

function initializeSubTiles(tileNum) {
  let subtileArray = [];
  for (let i = 0; i < 4; i++) {
    subtileArray.push(updateSubtile(tileNum + String.fromCharCode(97 + i)));
  }
  return subtileArray;
}

function updateSubtile(id) {
  return {
    "name": "Subtile_" + id,
    "num": id,
    "laurel": {
      "class": 1,
      "coverage": 0,
      "resprouts": 0,
      "workHistory": {}, //Date, method, crewSize, crewLeader, comments
      "photos": {} //Photo, date, caption
    },
    "blackberry": {
      "class": 0,
      "coverage": 0,
      "resprouts": 0,
      "workHistory": {}, //Date, method, crewSize, crewLeader, comments
      "photos": {} //Photo, date, caption
    },
    "smallHolly": {
      "class": 0,
      "coverage": 0,
      "resprouts": 0,
      "workHistory": {}, //Date, method, crewSize, crewLeader, comments
      "photos": {} //Photo, date, caption
    },
    "largeHolly": {
      "class": 0,
      "coverage": 0,
      "resprouts": 0,
      "workHistory": {}, //Date, method, crewSize, crewLeader, comments
      "photos": {} //Photo, date, caption
    },
    "groundIvy": {
      "class": 0,
      "coverage": 0,
      "resprouts": 0,
      "workHistory": {}, //Date, method, crewSize, crewLeader, comments
      "photos": {} //Photo, date, caption
    },
    "treeIvy": {
      "class": 0,
      "coverage": 0,
      "resprouts": 0,
      "workHistory": {}, //Date, method, crewSize, crewLeader, comments
      "photos": {} //Photo, date, caption
    }
  }
}

function updateTileDB(subtileArray, index) {
  TileData.update({
    "name": "Tile_" + index
  }, {
    "name": "Tile_" + index,
    "num": index,
    "laurel": {
      "class": 4,
      "coverage": 0,
    },
    "blackberry": {
      "class": 0,
      "coverage": 0,
    },
    "smallHolly": {
      "class": 0,
      "coverage": 0,
    },
    "largeHolly": {
      "class": 0,
      "coverage": 0,
    },
    "groundIvy": {
      "class": 0,
      "coverage": 0,
    },
    "treeIvy": {
      "class": 0,
      "coverage": 0,
    },
    "subtiles": subtileArray
  }, {
    "upsert": true
  });
}
