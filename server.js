'use strict';

var fs = require('fs');
var express = require('express');
var app = express();
var dotenv = require('dotenv');
var mongodb = require('mongodb');
var MongoClient = mongodb.MongoClient;
var url = process.env.MONGOLAB_URI;


dotenv.config();

var GoogleSearch = require('google-search');
var googleSearch = new GoogleSearch({
    key: process.env.GOOGLE_CSE_KEY,
    cx: process.env.GOOGLE_CSE_CX,
});

const SEARCHES = 'saved_searches'

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
            response.items.forEach(function(item) {
                images.push({
                    url: item.link,
                    snippet: item.snippet,
                    context: item.image.contextLink
                })
            });
            dbInsert(SEARCHES, {
                term: req.params.query,
                when: Date()
            }, function(error) {
                if (error) throw error;
            });
            res.json(images);
        });

    })

app.route('/api/latest/imagesearch/')
    .get(function(req, res) {
        MongoClient.connect(url, function(err, db) {
            if (err) throw err;
            db.collection(SEARCHES).find({}, {
                limit: 50
            }).toArray(function(err, searches) {
                res.json(searches);
            });
        });
    })

app.route('/')
    .get(function(req, res) {
        res.sendFile(process.cwd() + '/views/index.html');
    })

// Respond not found to all the wrong routes
app.use(function(req, res, next) {
    res.status(404);
    res.type('txt').send('Not found');
});

// Error Middleware
app.use(function(err, req, res, next) {
    if (err) {
        res.status(err.status || 500)
            .type('txt')
            .send(err.message || 'SERVER ERROR');
    }
})




app.listen(process.env.PORT, function() {
    console.log('Node.js listening ...');
});

function dbInsert(collection, dbObject) {
    console.log("test")
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        db.collection(collection).insertOne(dbObject, function(err, result) {
            if (err) throw err;
            console.log('success')
            db.close();
        });
    });
}