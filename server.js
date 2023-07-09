const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const { spawn } = require('child_process');
const fetch = require('node-fetch');
let searchResults = [];
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

app.post('/search', (req, res) => {
  const searchQuery = req.body.searchQuery;
  if (searchQuery !== '') {
    scrape(searchQuery);
    console.log(searchResults);
    res.json(searchResults);
    searchResults = [];
  } 
  else {
    res.sendStatus(400);
  }
});

function scrape(searchQuery) {
  const results = spawn('python',['recommendation.py',searchQuery]);
  results.stdout.on('data', (data) =>{

    const dataString = data.toString('utf-8'); // Convert the buffer to a string
    const dataArray = dataString.split(',\r\n'); // Split the string into an array of strings using a comma as the delimiter
    console.log(dataArray); // Output the string array
    for(var i = 0; i < 6; i++) {
      const url = 'https://api.themoviedb.org/3/search/movie?query='+dataArray[i]+'&include_adult=false&language=en-US&page=1';
      const options = {
        method: 'GET',
        headers: {
          accept: 'application/json',
          Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJkMjI4Njg2NDRhNmY4MDYyYThkNzVkMjM4ZGFiNzJkYiIsInN1YiI6IjY0YTY1MDRkYzNiZmZlMDEwNmYzNWE0NCIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.wCzNY0toNitTFaTN5NAwzUSQH2dj4n8QJ0GUkT9xpsU'
        }
      };

      fetch(url, options)
        .then(res => res.json())
        .then(json =>{
            const title = json.results[0].title;
            const des = json.results[0].overview;
            const image = json.results[0].poster_path;

            searchResults.push({
              title,
              des,
              image
            });
        })
        .catch(err => console.error('error:' + err));
    }
  });

  results.stderr.on('data', (data) =>{
    console.error(`stderr: ${data}`);
  });
}


app.listen(3000,function(){
  console.log('listening on port 3000');
})

