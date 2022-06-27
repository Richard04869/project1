'use strict';
const mongoose = require( 'mongoose' );
const Schema = mongoose.Schema;

var browseSchema = Schema( {
  userId: {type:Schema.Types.ObjectId, ref:'User'},
  article: String,
  view: String,
  date: String,
  createdAt: Date,
} );

module.exports = mongoose.model( 'BrowseHistory', browseSchema );

