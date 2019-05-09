const csv = require('csv-parser');  
const fs = require('fs');

var { Movie } = require("./movie");

fs.createReadStream('ml-latest-small/movies.csv')  
  .pipe(csv())
  .on('data', (row) => {
    title = row.title;
    titleWithoutYear="";
    for (var i = 0; i < title.length; i++) {
        ch= title.charAt(i)
        if(ch != ('(')){
            titleWithoutYear+=ch;
        }else{
         break;
        }
      }
      titleWithoutYear=titleWithoutYear.trim();
      Movie.create(
        {
          title: titleWithoutYear,
          movie_id: row.movieId,
        },
        (err, movie) => {
         // console.log("Added movie: ", movie);
        }
      );

  })
  .on('end', () => {
    console.log('CSV file successfully processed');
  });