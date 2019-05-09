const CONST = require("../config/index");
var mongoose = require('mongoose');
mongoose.connect(CONST.MONGOOSE_URL, {useNewUrlParser: true});

var filterSchema = mongoose.Schema({
    movie_id : Number,
    director : String,
    year : String,
    released : String,
    genre : [String],
    language : [String],
    imdbRating : String,
    ProductName : String,
    ProductDesc : String,
    Image : String,
    Price : String
},{strict:false});

var Filter = mongoose.model('filters',filterSchema);
module.exports = Filter;