const mongoose = require('mongoose');
mongoose.connect('mongodb://54.214.184.72:27017/just_watch', {useNewUrlParser: true});

const Movie = mongoose.model('Movie', 
{ 
    title: String,
    movie_id:Number,
    plot:String,
    director:String,
    year:String,
    released:String,
    genre:String,
    language:String,
    imdbRating:String,
    poster:String
});

module.exports = { Movie };
 