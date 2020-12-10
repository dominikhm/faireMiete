
const express = require('express');
const app = express();
const port = 3000;

const searchZuschlag = require('./scraper');

//Catches requests made to localhost:3000/search
app.get('/search', (request, response) => {

  //Holds value of the query param 'searchquery'.
    const address = request.query.searchquery;

  //Do something when the searchQuery is not null.
  if(address != null){
    searchZuschlag.searchZuschlag(address)
      .then(results => {
                //Returns a 200 Status OK with Results JSON back to the client.
                response.status(200);
                response.json(results);
            });

  }else{
    console.log('Please enter a valid address');
    response.end();
  }
});

//Initialises the express server on the port 30000
app.listen(port, () => console.log(`The Lagezuschlags-API is ready`));
