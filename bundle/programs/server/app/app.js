var require = meteorInstall({"lib":{"tile_data.js":function(require,exports,module){

///////////////////////////////////////////////////////////////////////////////////
//                                                                               //
// lib/tile_data.js                                                              //
//                                                                               //
///////////////////////////////////////////////////////////////////////////////////
                                                                                 //
module.export({
  TileData: () => TileData
});
let Mongo;
module.link("meteor/mongo", {
  Mongo(v) {
    Mongo = v;
  }

}, 0);
const TileData = new Mongo.Collection('TileData');
Meteor.methods({
  'updateTile': tile => {
    //console.log(tile);
    TileData.update({
      "name": tile.name
    }, {
      $set: tile
    });
  },
  'sortTilePriority': () => {
    //TODO: Finish
    TileData.find().sort({
      subtiles
    });
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
      "laurel": {
        "dates": {} //"date": new Date(),
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
        "dates": {} //"date": new Date(),
        //"class": 0,
        //"coverage": 0,
        //"resprouts": 0,
        //"workHistory": [], //Date, method, crewSize, crewLeader, comments
        //"photos": [] //Photo, date, caption

      },
      "largeHolly": {
        "dates": {} //"date": new Date(),
        //"class": 0,
        //"coverage": 0,
        //"resprouts": 0,
        //"workHistory": [], //Date, method, crewSize, crewLeader, comments
        //"photos": [] //Photo, date, caption

      },
      "groundIvy": {
        "dates": {} //"class": 0,
        //"coverage": 0,
        //"resprouts": 0,
        //"workHistory": [], //Date, method, crewSize, crewLeader, comments
        //"photos": [] //Photo, date, caption

      },
      "treeIvy": {
        "dates": {} //"date": new Date(),
        //"class": 0,
        //"coverage": 0,
        //"resprouts": 0,
        //"workHistory": [], //Date, method, crewSize, crewLeader, comments
        //"photos": [] //Photo, date, caption

      }
    };
  }

  function updateTileDB(subtileArray, index) {
    TileData.update({
      "name": "Tile_" + index
    }, {
      "name": "Tile_" + index,
      "num": index,
      "laurel": {
        "dates": {} //"date": new Date(),
        //"class": 0,
        //"coverage": 0,

      },
      "blackberry": {
        "dates": {} //"date": new Date(),
        //"class": 0,
        //"coverage": 0,

      },
      "smallHolly": {
        "dates": {} //"date": new Date(),
        //"class": 0,
        //"coverage": 0,

      },
      "largeHolly": {
        "dates": {} //"date": new Date(),
        //"class": 0,
        //"coverage": 0,

      },
      "groundIvy": {
        "dates": {} //"date": new Date(),
        //"class": 0,
        //"coverage": 0,

      },
      "treeIvy": {
        "dates": {} //"date": new Date(),
        //"class": 0,
        //"coverage": 0,

      },
      "subtiles": subtileArray
    }, {
      "upsert": true
    });
  }
}
///////////////////////////////////////////////////////////////////////////////////

}},"server":{"main.js":function(require,exports,module){

///////////////////////////////////////////////////////////////////////////////////
//                                                                               //
// server/main.js                                                                //
//                                                                               //
///////////////////////////////////////////////////////////////////////////////////
                                                                                 //
let Meteor;
module.link("meteor/meteor", {
  Meteor(v) {
    Meteor = v;
  }

}, 0);
let TileData;
module.link("/lib/tile_data.js", {
  TileData(v) {
    TileData = v;
  }

}, 1);
Meteor.startup(() => {
  Meteor.publish('TileData', () => {
    console.log(TileData.find({}).fetch());
    return TileData.find({});
  });
});
///////////////////////////////////////////////////////////////////////////////////

}}},{
  "extensions": [
    ".js",
    ".json"
  ]
});

var exports = require("/server/main.js");
//# sourceURL=meteor://💻app/app/app.js
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1ldGVvcjovL/CfkrthcHAvbGliL3RpbGVfZGF0YS5qcyIsIm1ldGVvcjovL/CfkrthcHAvc2VydmVyL21haW4uanMiXSwibmFtZXMiOlsibW9kdWxlIiwiZXhwb3J0IiwiVGlsZURhdGEiLCJNb25nbyIsImxpbmsiLCJ2IiwiQ29sbGVjdGlvbiIsIk1ldGVvciIsIm1ldGhvZHMiLCJ0aWxlIiwidXBkYXRlIiwibmFtZSIsIiRzZXQiLCJmaW5kIiwic29ydCIsInN1YnRpbGVzIiwiaXNTZXJ2ZXIiLCJpbml0aWFsaXplVGlsZURCIiwibnVtVGlsZXMiLCJpIiwic3VidGlsZUFycmF5IiwiaW5pdGlhbGl6ZVN1YlRpbGVzIiwidXBkYXRlVGlsZURCIiwidGlsZU51bSIsInB1c2giLCJ1cGRhdGVTdWJ0aWxlIiwiU3RyaW5nIiwiZnJvbUNoYXJDb2RlIiwibnVtIiwiY2hhciIsImlkeCIsImlkIiwiaW5kZXgiLCJzdGFydHVwIiwicHVibGlzaCIsImNvbnNvbGUiLCJsb2ciLCJmZXRjaCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7QUFBQUEsTUFBTSxDQUFDQyxNQUFQLENBQWM7QUFBQ0MsVUFBUSxFQUFDLE1BQUlBO0FBQWQsQ0FBZDtBQUF1QyxJQUFJQyxLQUFKO0FBQVVILE1BQU0sQ0FBQ0ksSUFBUCxDQUFZLGNBQVosRUFBMkI7QUFBQ0QsT0FBSyxDQUFDRSxDQUFELEVBQUc7QUFBQ0YsU0FBSyxHQUFDRSxDQUFOO0FBQVE7O0FBQWxCLENBQTNCLEVBQStDLENBQS9DO0FBRTFDLE1BQU1ILFFBQVEsR0FBRyxJQUFJQyxLQUFLLENBQUNHLFVBQVYsQ0FBcUIsVUFBckIsQ0FBakI7QUFFUEMsTUFBTSxDQUFDQyxPQUFQLENBQWU7QUFDYixnQkFBZUMsSUFBRCxJQUFVO0FBQ3RCO0FBQ0FQLFlBQVEsQ0FBQ1EsTUFBVCxDQUFpQjtBQUFFLGNBQVFELElBQUksQ0FBQ0U7QUFBZixLQUFqQixFQUF3QztBQUFFQyxVQUFJLEVBQUVIO0FBQVIsS0FBeEM7QUFDRCxH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LEVBQTRCO0FBQUNHLFFBQU0sQ0FBQ0YsQ0FBRCxFQUFHO0FBQUNFLFVBQU0sR0FBQ0YsQ0FBUDtBQUFTOztBQUFwQixDQUE1QixFQUFrRCxDQUFsRDtBQUFxRCxJQUFJSCxRQUFKO0FBQWFGLE1BQU0sQ0FBQ0ksSUFBUCxDQUFZLG1CQUFaLEVBQWdDO0FBQUNGLFVBQVEsQ0FBQ0csQ0FBRCxFQUFHO0FBQUNILFlBQVEsR0FBQ0csQ0FBVDtBQUFXOztBQUF4QixDQUFoQyxFQUEwRCxDQUExRDtBQUc3RUUsTUFBTSxDQUFDMEIsT0FBUCxDQUFlLE1BQU07QUFDbkIxQixRQUFNLENBQUMyQixPQUFQLENBQWUsVUFBZixFQUEyQixNQUFNO0FBQy9CQyxXQUFPLENBQUNDLEdBQVIsQ0FBWWxDLFFBQVEsQ0FBQ1csSUFBVCxDQUFjLEVBQWQsRUFBa0J3QixLQUFsQixFQUFaO0FBQ0EsV0FBT25DLFFBQVEsQ0FBQ1csSUFBVCxDQUFjLEVBQWQsQ0FBUDtBQUNELEdBSEQ7QUFJRCxDQUxELEUiLCJmaWxlIjoiL2FwcC5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IE1vbmdvIH0gZnJvbSAnbWV0ZW9yL21vbmdvJztcblxuZXhwb3J0IGNvbnN0IFRpbGVEYXRhID0gbmV3IE1vbmdvLkNvbGxlY3Rpb24oJ1RpbGVEYXRhJyk7XG5cbk1ldGVvci5tZXRob2RzKHtcbiAgJ3VwZGF0ZVRpbGUnOiAodGlsZSkgPT4ge1xuICAgIC8vY29uc29sZS5sb2codGlsZSk7XG4gICAgVGlsZURhdGEudXBkYXRlKCB7IFwibmFtZVwiOiB0aWxlLm5hbWUgfSwgeyAkc2V0OiB0aWxlIH0gKTtcbiAgfSxcbiAgJ3NvcnRUaWxlUHJpb3JpdHknOiAoKSA9PiB7IC8vVE9ETzogRmluaXNoXG4gICAgVGlsZURhdGEuZmluZCgpLnNvcnQoeyBzdWJ0aWxlcyB9KVxuICB9XG59KTtcblxuaWYgKE1ldGVvci5pc1NlcnZlcikge1xuICAvL2luaXRpYWxpemVUaWxlREIoNjgpO1xuXG4gIGZ1bmN0aW9uIGluaXRpYWxpemVUaWxlREIobnVtVGlsZXMpIHtcbiAgICBmb3IgKGxldCBpID0gMTsgaSA8PSBudW1UaWxlczsgaSsrKSB7XG4gICAgICBsZXQgc3VidGlsZUFycmF5ID0gaW5pdGlhbGl6ZVN1YlRpbGVzKGkpO1xuICAgICAgdXBkYXRlVGlsZURCKHN1YnRpbGVBcnJheSwgaSk7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gaW5pdGlhbGl6ZVN1YlRpbGVzKHRpbGVOdW0pIHtcbiAgICBsZXQgc3VidGlsZUFycmF5ID0gW107XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCA0OyBpKyspIHtcbiAgICAgIHN1YnRpbGVBcnJheS5wdXNoKHVwZGF0ZVN1YnRpbGUodGlsZU51bSwgU3RyaW5nLmZyb21DaGFyQ29kZSg5NyArIGkpLCBpKSk7XG4gICAgfVxuICAgIHJldHVybiBzdWJ0aWxlQXJyYXk7XG4gIH1cblxuICBmdW5jdGlvbiB1cGRhdGVTdWJ0aWxlKG51bSwgY2hhciwgaWR4KSB7XG4gICAgbGV0IGlkID0gbnVtICsgY2hhcjtcbiAgICByZXR1cm4ge1xuICAgICAgXCJuYW1lXCI6IFwiU3VidGlsZV9cIiArIGlkLFxuICAgICAgXCJpZFwiOiBpZCxcbiAgICAgIFwibnVtXCI6IG51bSxcbiAgICAgIFwiaWR4XCI6IGlkeCxcbiAgICAgIFwibGF1cmVsXCI6IHtcbiAgICAgICAgXCJkYXRlc1wiOiB7fVxuICAgICAgICAvL1wiZGF0ZVwiOiBuZXcgRGF0ZSgpLFxuICAgICAgICAvL1wiY2xhc3NcIjogMCxcbiAgICAgICAgLy9cImNvdmVyYWdlXCI6IDAsXG4gICAgICAgIC8vXCJyZXNwcm91dHNcIjogMCxcbiAgICAgICAgLy9cIndvcmtIaXN0b3J5XCI6IFtdLCAvL0RhdGUsIG1ldGhvZCwgY3Jld1NpemUsIGNyZXdMZWFkZXIsIGNvbW1lbnRzXG4gICAgICAgIC8vXCJwaG90b3NcIjogW10gLy9QaG90bywgZGF0ZSwgY2FwdGlvblxuICAgICAgfSxcbiAgICAgIFwiYmxhY2tiZXJyeVwiOiB7XG4gICAgICAgIFwiZGF0ZXNcIjoge31cblxuXG4gICAgICB9LFxuICAgICAgXCJzbWFsbEhvbGx5XCI6IHtcbiAgICAgICAgXCJkYXRlc1wiOiB7fVxuXG4gICAgICAgIC8vXCJkYXRlXCI6IG5ldyBEYXRlKCksXG4gICAgICAgIC8vXCJjbGFzc1wiOiAwLFxuICAgICAgICAvL1wiY292ZXJhZ2VcIjogMCxcbiAgICAgICAgLy9cInJlc3Byb3V0c1wiOiAwLFxuICAgICAgICAvL1wid29ya0hpc3RvcnlcIjogW10sIC8vRGF0ZSwgbWV0aG9kLCBjcmV3U2l6ZSwgY3Jld0xlYWRlciwgY29tbWVudHNcbiAgICAgICAgLy9cInBob3Rvc1wiOiBbXSAvL1Bob3RvLCBkYXRlLCBjYXB0aW9uXG4gICAgICB9LFxuICAgICAgXCJsYXJnZUhvbGx5XCI6IHtcbiAgICAgICAgXCJkYXRlc1wiOiB7fVxuXG4gICAgICAgIC8vXCJkYXRlXCI6IG5ldyBEYXRlKCksXG4gICAgICAgIC8vXCJjbGFzc1wiOiAwLFxuICAgICAgICAvL1wiY292ZXJhZ2VcIjogMCxcbiAgICAgICAgLy9cInJlc3Byb3V0c1wiOiAwLFxuICAgICAgICAvL1wid29ya0hpc3RvcnlcIjogW10sIC8vRGF0ZSwgbWV0aG9kLCBjcmV3U2l6ZSwgY3Jld0xlYWRlciwgY29tbWVudHNcbiAgICAgICAgLy9cInBob3Rvc1wiOiBbXSAvL1Bob3RvLCBkYXRlLCBjYXB0aW9uXG4gICAgICB9LFxuICAgICAgXCJncm91bmRJdnlcIjoge1xuICAgICAgICBcImRhdGVzXCI6IHt9XG5cbiAgICAgICAgLy9cImNsYXNzXCI6IDAsXG4gICAgICAgIC8vXCJjb3ZlcmFnZVwiOiAwLFxuICAgICAgICAvL1wicmVzcHJvdXRzXCI6IDAsXG4gICAgICAgIC8vXCJ3b3JrSGlzdG9yeVwiOiBbXSwgLy9EYXRlLCBtZXRob2QsIGNyZXdTaXplLCBjcmV3TGVhZGVyLCBjb21tZW50c1xuICAgICAgICAvL1wicGhvdG9zXCI6IFtdIC8vUGhvdG8sIGRhdGUsIGNhcHRpb25cbiAgICAgIH0sXG4gICAgICBcInRyZWVJdnlcIjoge1xuICAgICAgICBcImRhdGVzXCI6IHt9XG5cbiAgICAgICAgLy9cImRhdGVcIjogbmV3IERhdGUoKSxcbiAgICAgICAgLy9cImNsYXNzXCI6IDAsXG4gICAgICAgIC8vXCJjb3ZlcmFnZVwiOiAwLFxuICAgICAgICAvL1wicmVzcHJvdXRzXCI6IDAsXG4gICAgICAgIC8vXCJ3b3JrSGlzdG9yeVwiOiBbXSwgLy9EYXRlLCBtZXRob2QsIGNyZXdTaXplLCBjcmV3TGVhZGVyLCBjb21tZW50c1xuICAgICAgICAvL1wicGhvdG9zXCI6IFtdIC8vUGhvdG8sIGRhdGUsIGNhcHRpb25cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiB1cGRhdGVUaWxlREIoc3VidGlsZUFycmF5LCBpbmRleCkge1xuICAgIFRpbGVEYXRhLnVwZGF0ZSh7XG4gICAgICBcIm5hbWVcIjogXCJUaWxlX1wiICsgaW5kZXhcbiAgICB9LCB7XG4gICAgICBcIm5hbWVcIjogXCJUaWxlX1wiICsgaW5kZXgsXG4gICAgICBcIm51bVwiOiBpbmRleCxcbiAgICAgIFwibGF1cmVsXCI6IHtcbiAgICAgICAgXCJkYXRlc1wiOiB7fVxuXG4gICAgICAgIC8vXCJkYXRlXCI6IG5ldyBEYXRlKCksXG4gICAgICAgIC8vXCJjbGFzc1wiOiAwLFxuICAgICAgICAvL1wiY292ZXJhZ2VcIjogMCxcbiAgICAgIH0sXG4gICAgICBcImJsYWNrYmVycnlcIjoge1xuICAgICAgICBcImRhdGVzXCI6IHt9XG5cbiAgICAgICAgLy9cImRhdGVcIjogbmV3IERhdGUoKSxcbiAgICAgICAgLy9cImNsYXNzXCI6IDAsXG4gICAgICAgIC8vXCJjb3ZlcmFnZVwiOiAwLFxuICAgICAgfSxcbiAgICAgIFwic21hbGxIb2xseVwiOiB7XG4gICAgICAgIFwiZGF0ZXNcIjoge31cblxuICAgICAgICAvL1wiZGF0ZVwiOiBuZXcgRGF0ZSgpLFxuICAgICAgICAvL1wiY2xhc3NcIjogMCxcbiAgICAgICAgLy9cImNvdmVyYWdlXCI6IDAsXG4gICAgICB9LFxuICAgICAgXCJsYXJnZUhvbGx5XCI6IHtcbiAgICAgICAgXCJkYXRlc1wiOiB7fVxuXG4gICAgICAgIC8vXCJkYXRlXCI6IG5ldyBEYXRlKCksXG4gICAgICAgIC8vXCJjbGFzc1wiOiAwLFxuICAgICAgICAvL1wiY292ZXJhZ2VcIjogMCxcbiAgICAgIH0sXG4gICAgICBcImdyb3VuZEl2eVwiOiB7XG4gICAgICAgIFwiZGF0ZXNcIjoge31cblxuICAgICAgICAvL1wiZGF0ZVwiOiBuZXcgRGF0ZSgpLFxuICAgICAgICAvL1wiY2xhc3NcIjogMCxcbiAgICAgICAgLy9cImNvdmVyYWdlXCI6IDAsXG4gICAgICB9LFxuICAgICAgXCJ0cmVlSXZ5XCI6IHtcbiAgICAgICAgXCJkYXRlc1wiOiB7fVxuXG4gICAgICAgIC8vXCJkYXRlXCI6IG5ldyBEYXRlKCksXG4gICAgICAgIC8vXCJjbGFzc1wiOiAwLFxuICAgICAgICAvL1wiY292ZXJhZ2VcIjogMCxcbiAgICAgIH0sXG4gICAgICBcInN1YnRpbGVzXCI6IHN1YnRpbGVBcnJheVxuICAgIH0sIHtcbiAgICAgIFwidXBzZXJ0XCI6IHRydWVcbiAgICB9KTtcbiAgfVxufVxuIiwiaW1wb3J0IHsgTWV0ZW9yIH0gZnJvbSAnbWV0ZW9yL21ldGVvcic7XG5pbXBvcnQgeyBUaWxlRGF0YSB9IGZyb20gJy9saWIvdGlsZV9kYXRhLmpzJ1xuXG5NZXRlb3Iuc3RhcnR1cCgoKSA9PiB7XG4gIE1ldGVvci5wdWJsaXNoKCdUaWxlRGF0YScsICgpID0+IHtcbiAgICBjb25zb2xlLmxvZyhUaWxlRGF0YS5maW5kKHt9KS5mZXRjaCgpKTtcbiAgICByZXR1cm4gVGlsZURhdGEuZmluZCh7fSk7XG4gIH0pO1xufSk7XG4iXX0=
