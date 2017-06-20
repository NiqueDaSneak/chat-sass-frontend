"use strict"

// NPM PACKAGES
const express = require('express')
const path = require("path")
const bodyParser = require('body-parser')

// EXPRESS SETUP
const app = express()
app.use(express.static('public'))
app.use(express.static(__dirname + 'view'))
// app.set('view engine', 'pug')
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

// ROUTES
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname + '/views/index.html'))
})

app.get('/auth', (req, res) => {
  res.sendFile(path.join(__dirname + '/views/auth.html'))
})

app.post('/login', (req, res) => {
  console.log('login data')
  console.log(req.body)
})

app.post('/signup', (req, res) => {
  console.log('signup data')
  console.log(req.body)
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
