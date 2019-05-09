const axios = require('axios');
var url = require('url');
var { Movie } = require("./movie");

var count=0;
var moviesNotFount=[]
Movie.find()
     .exec((err,movies)=>{
        movies.forEach(function(movie) {
            var url = new URL("http://www.omdbapi.com/");
            url.searchParams.append('t', movie.title); 
            url.searchParams.append('apikey', '');
           // console.log(url.href)
            axios.get(url.href)
            .then(response => {
                console.log(response.data.Title);
                if(!response.data.Title){
                    count++;
                    moviesNotFount.push(movie);
                }
                var query = {
                    'plot':response.data.Plot ,
                    'director': response.data.Director,
                    'year':response.data.Year,
                    'released':response.data.Released,
                    'genre':response.data.Genre,
                    'language':response.data.Language,
                    'imdbRating':response.data.imdbRating,
                    'poster':response.data.Poster
                };
                Movie.findOneAndUpdate({title:movie.title}, 
                    {
                        $set:
                        {
                            plot:response.data.Plot,
                            director:response.data.Director,
                            year:response.data.Year,
                            released:response.data.Released,
                            genre:response.data.Genre,
                            language:response.data.Language,
                            imdbRating:response.data.imdbRating,
                            poster:response.data.Poster
                        }
                    }, 
                    (err,movie)=>{
                        if(err){
                            console.log("error",err);
                        }
                        if(movie){
                            //console.log(movie);
                        }
                    }) 
            })
            .catch(error => {
                console.log(error);
            });    
        });
         
     })

     console.log("Count of Movies not found", count);
     console.log("Movies not found", moviesNotFount);