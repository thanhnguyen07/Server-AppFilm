const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const DataFilm = new Schema({
    title: { type: String },
    overview:  { type: String },
    release_date: { type: String },
    name: { type: String },
    time:  { type: String },
    quality: { type: String },
    country: { type: String },
    point: { type: Number },
  }, { timestamps: true});

module.exports = mongoose.model('DataFilm', DataFilm);
