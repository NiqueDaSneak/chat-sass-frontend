"use strict"

// NPM PACKAGES
const express = require('express')
const path = require("path")
const bodyParser = require('body-parser')

// DATABASE SETUP
var mongoose = require('mongoose')
mongoose.connect('mongodb://dom:Losangeleslakers47@ds123182.mlab.com:23182/chat-sass-frontend')
var db = mongoose.connection
db.on('error', console.error.bind(console, 'connection error:'))

var userSchema = mongoose.Schema({email: String, organization: String, password: String})
var User = mongoose.model('User', userSchema)

// BCRYPT
var bcrypt = require('bcryptjs')

// EXPRESS SETUP
const app = express()
app.use(express.static('public'))
app.use(express.static(__dirname + 'view'))
// app.set('view engine', 'pug')
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
var session = require('express-session')
var sess = {
  secret: 'ELpR4sYMFAv12w4Ae386',
  cookie: {},
  resave: false,
  saveUninitialized: true
}
if (app.get('env') === 'production') {
  app.set('trust proxy', 1) // trust first proxy
  sess.cookie.secure = true // serve secure cookies
}
app.use(session(sess))

// ROUTES
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname + '/views/index.html'))
})

app.get('/auth', (req, res) => {
  res.sendFile(path.join(__dirname + '/views/auth.html'))
})

app.get('/auth-error', (req, res) => {
  res.sendFile(path.join(__dirname + '/views/auth-error.html'))
})

app.get('/dashboard/:organization', (req, res) => {
  res.sendFile(path.join(__dirname + '/views/dashboard.html'))
})

app.post('/login', (req, res) => {
  User.findOne({email: req.body.email}, (err, user) => {
    if (err) return console.error(err)
    bcrypt.compare(req.body.password, user.password).then((response) => {
        if (response) {
          res.redirect('dashboard/' + user.organization)
          var sess = req.session
          sess.email = req.body.email
        } else {
          res.redirect('auth-error')
        }
    })
  })
})

app.post('/signup', (req, res) => {
  bcrypt.genSalt(10, function(err, salt) {
    bcrypt.hash(req.body.password, salt, function(err, hash) {
      var newUser = new User({email: req.body.email, organization: req.body.organization, password: hash}).save((err, user) => {
        if (err) return console.error(err)
      })
    })
  })
  res.redirect('/dashboard')
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
