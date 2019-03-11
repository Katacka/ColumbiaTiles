import { Meteor } from 'meteor/meteor';
import { TileData } from '/lib/tile_data.js'

Meteor.startup(() => {
  Meteor.publish('TileData', () => {
    console.log(TileData.find({}).fetch());
    return TileData.find({});
  });
});
