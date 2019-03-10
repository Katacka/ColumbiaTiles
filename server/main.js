import { Meteor } from 'meteor/meteor';
<<<<<<< HEAD
import { TileData } from '/lib/tile_data.js'

Meteor.startup(() => {
  Meteor.publish('TileData', () => {
    console.log(TileData.find({}).fetch());
    return TileData.find({});
  });
=======
import { TileData } from '../lib/collections.js'

/*Meteor.startup(() => {
  TileData = new Mongo.Collection('tileData');

});*/

Meteor.publish('tileData', () => {
  return TileData.find();
>>>>>>> 14d7af9089e950e1200b5be990583b83fc73b3fc
});
