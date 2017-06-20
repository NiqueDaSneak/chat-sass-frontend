"use strict"

// NPM PACKAGES
const express = require('express')
var path = require("path")

// EXPRESS SETUP
const app = express()
app.use(express.static('public'))
app.use(express.static(__dirname + 'view'))
// app.set('view engine', 'pug')

// ROUTES
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname + '/views/index.html'))
})

// SET UP SERVER ENVIRONMENT
var port = process.env.PORT || 3000
app.listen(port, function(){
    console.log('Server running on port ' + port)
})

app.on('error', function(){
    console.log(error)
})

module.exports = app
