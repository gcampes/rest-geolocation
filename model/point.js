var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var PointSchema = new Schema({
  name: String,
  cd_estabelecimento: String,

  geo: {
    type: [Number],
    index: '2d'
  }
});

module.exports = mongoose.model('Point', PointSchema);
