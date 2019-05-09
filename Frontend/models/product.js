var mongoose = require('mongoose');
const CONST = require("../config/index");
mongoose.connect(CONST.MONGOOSE_URL, {useNewUrlParser: true});
var productSchema = mongoose.Schema({
    movie_id : String,
    director : String,
    year : String,
    released : String,
    genre : String,
    language : String,
    imdbRating : String,
    ProductName : String,
    ProductDesc : String,
    Image : String,
    Price : String
},{strict:false});

var Product = mongoose.model('products',productSchema);
module.exports = Product;