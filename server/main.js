import { Meteor } from 'meteor/meteor';
import { TileData } from '../lib/collections.js'

/*Meteor.startup(() => {
  TileData = new Mongo.Collection('tileData');

});*/

Meteor.publish('tileData', () => {
  return TileData.find();
});
