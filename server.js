'use strict';

var fs = require('fs');
var express = require('express');
var app = express();
var dotenv = require('dotenv');

dotenv.config();

var GoogleSearch = require('google-search');
var googleSearch = new GoogleSearch({
  key: process.env.GOOGLE_CSE_KEY,
  cx: process.env.GOOGLE_CSE_CX,
});



app.use('/public', express.static(process.cwd() + '/public'));


app.route('/api/imagesearch/:query')
    .get(function(req, res) {
      var output = {};
      googleSearch.build({
        q: req.params.query,
        start: req.query.offset || 1,
        searchType: "image",
        num: 10, 
      }, function(error, response) {
        var images = [];
        response.items.forEach(function(item){
          images.push({url:item.link, snippet:item.snippet, context:item.image.contextLink})
        });
        res.json(images);
      });

    })
  
app.route('/')
    .get(function(req, res) {
		  res.sendFile(process.cwd() + '/views/index.html');
    })

// Respond not found to all the wrong routes
app.use(function(req, res, next){
  res.status(404);
  res.type('txt').send('Not found');
});

// Error Middleware
app.use(function(err, req, res, next) {
  if(err) {
    res.status(err.status || 500)
      .type('txt')
      .send(err.message || 'SERVER ERROR');
  }  
})




app.listen(process.env.PORT, function () {
  console.log('Node.js listening ...');
});


