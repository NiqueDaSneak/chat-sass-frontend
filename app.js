"use strict"

// NPM PACKAGES
const express = require('express')

// EXPRESS SETUP
const app = express()
app.use(express.static('public'))
app.set('views', __dirname + '/views')
app.set('view engine', 'pug')

// ROUTES
app.get('/', (req, res) => {
  res.render('index')
})

// SET UP SERVER ENVIRONMENT
var port = process.env.PORT || 3000;
server.listen(port, function(){
    console.log('Server running on port ' + port);
});

app.on('error', function(){
    console.log(error);
});

module.exports = app;
