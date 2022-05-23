const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const User = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    playlist: { type: Array, default: ["0"] },
    like: { type: Array, default: ["0"] },
  }, { timestamps: true});

module.exports = mongoose.model('User', User);
