"use strict"

// NPM PACKAGES
const express = require('express')
const path = require("path")
const fs = require('fs')
const bodyParser = require('body-parser')
const app = express()
const server = require('http').createServer(app)
const io = require('socket.io')(server)
const request = require('request')
const util = require('util')
const favicon = require('serve-favicon')
const moment = require('moment')
// var stripe = require("stripe")("sk_test_8Df2wXol56EATQAeBpYwInGZ")
var stripe = require("stripe")("sk_live_vCVX2baHRaQSbnF1Y5DMcQiN")

// DATABASE SETUP
const mongoose = require('mongoose')
mongoose.connect('mongodb://domclemmer:domclemmerpasswordirrigate@ds153173-a0.mlab.com:53173,ds153173-a1.mlab.com:53173/irrigate?replicaSet=rs-ds153173', {
  useMongoClient: true
})
var db = mongoose.connection
db.on('error', console.error.bind(console, 'connection error:'))

var userSchema = mongoose.Schema({
  email: String,
  organization: String,
  onboarded: Boolean,
  username: String,
  userID: String,
  pageID: String,
  pageAccessToken: String,
  userAccessToken: String,
  stripeID: String,
  createdDate: String
})

var User = mongoose.model('User', userSchema)

var messageSchema = mongoose.Schema({
  date: String,
  time: String,
  text: String,
  image: String,
  videoURL: String,
  organization: String,
  groupNames: Array,
  id: String,
  createdDate: String
})
var Message = mongoose.model('Message', messageSchema)

var memberSchema = mongoose.Schema({
  organization: String,
  fbID: Number,
  fullName: String,
  timezone: Number,
  photo: String,
  gender: String,
  createdDate: Date,
})
memberSchema.virtual('firstName').get(() => {
  return this.fullName.split(' ')[0]
})
var Member = mongoose.model('Member', memberSchema)

var organizationSchema = mongoose.Schema({
  name: String,
  tier: String,
  createdDate: Date,
  memberList: Array
})
var Organization = mongoose.model('Organization', organizationSchema)

var groupSchema = mongoose.Schema({
  groupName: String,
  groupMembers: Array,
  organization: String
})
var Group = mongoose.model('Group', groupSchema)

// PASSPORTJS CONFIG
const passport = require('passport')
const FacebookStrategy = require('passport-facebook').Strategy

// EXPRESS SETUP

app.use((req, res, next) => {
  // console.log(req.get('Host'))
  if (!req.secure) {
    if (req.get('Host') === 'localhost:3000' || 'local') {
      console.log('localhost')
    } else {
      return res.redirect(['https://', req.get('Host'), req.url].join(''))
    }
  }
  next()
})

app.use(favicon(path.join(__dirname, 'public/imgs', 'favicon.ico')))
app.use(express.static('public'))
app.use(express.static(__dirname + 'view'))
var session = require('cookie-session')
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
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
  extended: false
}))
app.use(passport.initialize())
app.use(passport.session())

passport.use(new FacebookStrategy({
    clientID: '372903006444693',
    clientSecret: 'a6f18850bec3475a1f115d3476df81c7',
    callbackURL: "https://www.irrigatemsg.com/facebook/redirect",
    profileFields: ['id', 'emails', 'name'],
    enableProof: true
  },
  function(accessToken, refreshToken, profile, done) {
    User.findOne({
      'userID': profile.id
    }, (err, user) => {
      if (err) {
        console.log(err)
      }
      if (user) {
        return done(null, user)
      } else {
        var newUser = new User()
        if (profile.emails === undefined) {
          console.log('no email')
        } else {
          newUser.email = profile.emails[0].value
        }
        newUser.onboarded = false
        newUser.userID = profile.id
        newUser.userAccessToken = accessToken
        newUser.createdDate = moment().format('MM-DD-YYYY')
        newUser.save((err, user) => {
          if (err) return console.error(err)
          return done(null, user)
        })
      }
    })
  }))

// ROUTES


app.get('/auth/facebook', passport.authenticate('facebook', {
  scope: ['manage_pages', 'publish_pages', 'pages_messaging', 'email', 'pages_show_list']
}))

app.get('/chat', (req, res) => {
  res.redirect('https://www.m.me/irrigatemsg')
})

// Facebook redirect
app.get('/facebook/redirect', passport.authenticate('facebook', {
  failureRedirect: '/',
  session: false
}), (req, res, next) => {
  req.session.user = req.user
  console.log('user: ' + req.user)
  if (req.user.pageID) {
    res.redirect('/dashboard/' + req.user.organization)
  } else {
    res.redirect('/tiers/' + req.user.userID + '/' + req.user.userAccessToken)
  }
})


app.get('/webview-checkout', (req, res) => {
  res.sendFile(path.join(__dirname + '/views/webview-checkout.html'))
})

app.get('/tedxdonate', (req, res) => {
  res.sendFile(path.join(__dirname + '/views/tedxdonate.html'))
})

app.get('/tiers/:userID/:userAccessToken', (req, res) => {
  res.sendFile(path.join(__dirname + '/views/tiers.html'))
})

app.get('/pricing', (req, res) => {
  res.sendFile(path.join(__dirname + '/views/pricing.html'))
})

app.get('/about', (req, res) => {
  res.sendFile(path.join(__dirname + '/views/about.html'))
})

app.get('/privacy-policy', (req, res) => {
  res.sendFile(path.join(__dirname + '/views/privacy-policy.html'))
})

app.get('/terms', (req, res) => {
  res.sendFile(path.join(__dirname + '/views/terms.html'))
})

app.get('/customize', (req, res) => {
  res.sendFile(path.join(__dirname + '/views/customize.html'))
})

app.get('/choose-page/:userID/:userAccessToken', (req, res, next) => {
  res.sendFile(path.join(__dirname + '/views/pages.html'))
})

app.get('/save-page', (req, res) => {
  User.findOne({
    'userID': req.query.userid
  }, (err, user) => {
    if (err) return console.error(err)

    var getUsername = new Promise(function(resolve, reject) {
      let options = {
        method: 'get',
        url: 'https://graph.facebook.com/v2.10/' + req.query.pageid + '?fields=username&access_token=' + req.query.access_token
      }

      request(options, (err, res, body) => {
        if (err) {
          console.error('error with getting username: ' + err)
          throw err
        }


        var headers = res.headers
        var statusCode = res.statusCode
        console.log('headers: ', headers)
        console.log('statusCode: ', statusCode)
        console.log('body: ', body)
        resolve(body)
      })
    })

    getUsername.then((body) => {
      let userObj = JSON.parse(body)
      user.username = userObj.username
      user.pageID = req.query.pageid
      user.organization = req.query.org.split(' ').join('').toLowerCase()
      user.pageAccessToken = req.query.access_token
      user.save((err, user) => {
        if (err) return console.error(err)

        // send this to subscribe the page to our webhook
        var webhookPromise = new Promise(function(resolve, reject) {
          var webhookOptions = {
            method: 'post',
            url: 'https://graph.facebook.com/v2.10/' + user.pageID + '/subscribed_apps?access_token=' + user.pageAccessToken
          }

          request(webhookOptions, (err, res, body) => {
            if (err) {
              console.error('error with webhook: ', err)
              throw err
            }
            var headers = res.headers
            var statusCode = res.statusCode
            console.log('headers: ', headers)
            console.log('statusCode: ', statusCode)
            console.log('body: ', body)
            resolve()
          })
        })
        var getStartedPromise = new Promise(function(resolve, reject) {
          // send this to implement a get started button
          var getStarted = {
            "get_started": {
              "payload": "GET_STARTED_PAYLOAD"
            }
          }
          var getStartedOptions = {
            method: 'post',
            body: getStarted,
            json: true,
            url: 'https://graph.facebook.com/v2.10/' + user.pageID + '/messenger_profile?access_token=' + user.pageAccessToken
          }

          request(getStartedOptions, (err, res, body) => {
            if (err) {
              console.error('error with get started button: ', err)
              throw err
            }
            var headers = res.headers
            var statusCode = res.statusCode
            console.log('headers: ', headers)
            console.log('statusCode: ', statusCode)
            console.log('body: ', body)
            resolve()
          })
        })

        var setGreetingPromise = new Promise(function(resolve, reject) {
          // send this to implement a get started button
          var setGreeting = {
            "setting_type": "greeting",
            "greeting": {
              "text": "Welcome {{user_first_name}}! Go ahead and tap Get Started to sign up!"
            }
          }
          var setGreetingOptions = {
            method: 'post',
            body: setGreeting,
            json: true,
            url: 'https://graph.facebook.com/v2.10/' + user.pageID + '/thread_settings?access_token=' + user.pageAccessToken
          }

          request(setGreetingOptions, (err, res, body) => {
            if (err) {
              console.error('error with greeting: ', err)
              throw err
            }
            var headers = res.headers
            var statusCode = res.statusCode
            console.log('headers: ', headers)
            console.log('statusCode: ', statusCode)
            console.log('body: ', body)
            resolve()
          })
        })

        webhookPromise.then(() => {
          console.log('subscribed to webhook')
          getStartedPromise.then(() => {
            console.log('new page should have get started button')
            setGreetingPromise.then(() => {
              console.log('greeting set! promises done! ')
            })
          })
        })
        res.redirect('/dashboard/' + user.organization)
      })
    })
  })
})

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname + '/views/index.html'))
})

app.get('/dashboard/:organization', (req, res) => {
  if (req.get('Host') === 'localhost:3000') {
    res.sendFile(path.join(__dirname + '/views/dashboard.html'))
  } else {
    if (req.session.user) {
      res.sendFile(path.join(__dirname + '/views/dashboard.html'))
      console.log('LOGGED IN: ' + JSON.stringify(req.session.user))
    } else {
      console.log('not logged in')
      res.redirect('/auth/facebook')
    }
  }
})

app.get('/commerce', (req, res) => {
  res.sendFile(path.join(__dirname + '/views/commerce.html'))
})


// SOCKET.IO
io.on('connection', (socket) => {

  console.log('Server connected to client!')

  socket.on('requestScheduledMsg', (data) => {
    Message.find({
      organization: data.data
    }, (err, msgs) => {
      socket.emit('scheduledMsgs', {
        data: msgs
      })
    })
  })

  socket.on('onboardUserAgain', (data) => {
    User.findOne({
      'organization': data.data
    }, (err, user) => {
      if (err) {
        console.log(err)
      }
      console.log(user)
      socket.emit('onboardingAgain', {
        data: user.username
      })
    })
  })

  socket.on('requestMsgs', (data) => {
    Message.find({
      organization: data.data
    }, (err, msgs) => {
      socket.emit('sendMsgs', {
        data: msgs
      })
    })
  })

  socket.on('getUsername', (data) => {
    User.findOne({
      organization: data.data
    }, (err, user) => {
      if (err) {
        console.log(err)
      }
      socket.emit('addToClipboard', {
        data: user.username
      })
    })
  })

  socket.on('sendData', (data) => {
    socket.emit('botMessage', {
      content: content[data.query]
    })
  })

  socket.on('requestMembers', (data) => {
    Member.find({
      organization: data.data
    }, (err, members) => {
      if (err) return console.error(err)
      for (var i = 0; i < members.length; i++) {
        socket.emit('addUser', {
          data: members[i]
        })
      }
    })
  })

  socket.on('requestMembersForMessage', (data) => {
    Group.find({
      organization: data.data
    }, (err, groups) => {
      if (err) return console.error(err)
      for (var i = 0; i < groups.length; i++) {
        socket.emit('showGroupsForMessage', {
          data: groups[i]
        })
      }
    })
  })

  socket.on('createGroup', (data) => {
    Group.findOne({
      groupName: data.groupName
    }, (err, group) => {
      if (err) {
        console.log(err)
      }

      if (group === null) {
        var newGroup = new Group({
          groupName: data.groupName,
          groupMembers: data.groupMembers,
          organization: data.org
        }).save((err, group) => {
          if (err) {
            return console.error(err)
          } else {
            console.log(group)
          }
        })
      } else {
        group.groupMembers = data.groupMembers
        group.save((err, updatedGroup) => {
          if (err) {
            console.log(err)
          }
          console.log(updatedGroup)
        })
      }
    })
  })

  socket.on('getList', (data) => {
    Group.find({
      organization: data.org
    }, (err, group) => {
      if (err) {
        return console.error(err)
      } else {
        socket.emit('showList', {
          data: group
        })
      }
    })
  })

  socket.on('getGroups', (data) => {
    Group.find({
      organization: data.org
    }, (err, group) => {
      if (err) {
        return console.error(err)
      } else {
        socket.emit('groups', {
          data: group
        })
      }
    })
  })

  socket.on('requestPages', (data) => {
    requestPages(data.userID, data.userAccessToken)
  })

  socket.on('requestDelete', (data) => {
    Message.findOneAndRemove({
      '_id': data.data
    }, (err) => {
      if (err) {
        console.log(err)
      }
      socket.emit('reloadPage')
    })
  })

  socket.on('isOnboarded?', (data) => {
    User.findOne({
      'organization': data.data
    }, (err, user) => {
      if (err) {
        console.log(err)
      }
      if (user.onboarded === true) {
        console.log('already onboarded')
      } else {
        socket.emit('onboardUser', {
          data: user.username
        })
      }
    })
  })

  socket.on('getMembersAndNewMsg', (data) => {
    Member.find({
      organization: data.data
    }, (err, members) => {
      if (err) {
        console.log(err)
      }
      let matchingMembers = []
      for (var i = 0; i < members.length; i++) {
        if (members[i].createdDate) {
          let day = members[i].createdDate.toString().split(" ")[2]
          let month = members[i].createdDate.toString().split(" ")[1]
          let year = members[i].createdDate.toString().split(" ")[3]
          if (moment(month + '-' + day + '-' + year, 'MMM-DD-YYYY').diff(moment(), 'days') >= -14) {
            matchingMembers.push(members[i])
          }
        }
      }
      socket.emit('quickViewMembers', {
        members: matchingMembers
      })
    })

    Message.find({
      organization: data.data
    }, (err, msgs) => {
      if (err) {
        console.log(err)
      }
      let nextMsg = undefined
      for (var i = 0; i < msgs.length; i++) {
        let day = msgs[i].date.split("-")[2]
        let month = msgs[i].date.split("-")[1]
        let year = msgs[i].date.split("-")[0]
        if (moment(month + '-' + day + '-' + year, 'MM-DD-YYYY').diff(moment(), 'days') >= 0) {
          if (moment(month + '-' + day + '-' + year, 'MM-DD-YYYY').format('MM-DD-YYYY') != moment().format('MM-DD-YYYY')) {
            if (nextMsg === undefined) {
              nextMsg = msgs[i]
            }
            if (moment(month + '-' + day + '-' + year, 'MM-DD-YYYY').diff(moment(), 'days') < moment(nextMsg.date.split("-")[1] + '-' + nextMsg.date.split("-")[2] + '-' + nextMsg.date.split("-")[0], 'MM-DD-YYYY').diff(moment(), 'days')) {
              nextMsg = msgs[i]
            }
          }
        }
      }
      socket.emit('quickViewNextMsg', {
        data: nextMsg
      })
      console.log(nextMsg)
    })
  })

  socket.on('promoteOnFacebook', (data) => {
    User.findOne({
      'organization': data.org
    }, (err, user) => {
      let options = {
        method: 'post',
        url: 'https://graph.facebook.com/v2.10/' + user.pageID + '/feed?message=' + data.post + '&access_token=' + user.pageAccessToken
      }

      request(options, (err, res, body) => {
        if (err) {
          console.error('error with webhook: ', err)
          throw err
        }
        var headers = res.headers
        var statusCode = res.statusCode
        console.log('headers: ', headers)
        console.log('statusCode: ', statusCode)
        console.log('body: ', body)
        let bodyResponse = JSON.parse(body)
        // link to the post
        // 'https://www.facebook.com/' + bodyResponse.id
      })
    })

    var webhookPromise = new Promise(function(resolve, reject) {
      var webhookOptions = {
        method: 'post',
        url: 'https://graph.facebook.com/v2.10/' + user.pageID + '/subscribed_apps?access_token=' + user.pageAccessToken
      }

      request(webhookOptions, (err, res, body) => {
        if (err) {
          console.error('error with webhook: ', err)
          throw err
        }
        var headers = res.headers
        var statusCode = res.statusCode
        console.log('headers: ', headers)
        console.log('statusCode: ', statusCode)
        console.log('body: ', body)
        resolve()
      })
    })
    console.log(data.post)
    console.log(data.org)

  })

  socket.on('onboardComplete', (data) => {
    User.findOne({
      'organization': data.data
    }, (err, user) => {
      if (err) {
        console.log(err)
      }
      user.onboarded = true
      user.save((err, user) => {
        if (err) {
          console.log(err)
        } else {
          console.log('are they onboarded? ' + user.onboarded)
        }
      })
    })
  })

  socket.on('findGroup', (data) => {
    Group.findOne({
      'groupName': data.name
    }, (err, group) => {
      if (err) {
        console.log(err)
      }
      Member.find({
        'organization': data.organization
      }, (err, members) => {
        socket.emit('editGroupMembers', {
          group: group,
          name: data.name,
          members: members
        })
      })
    })
  })

  socket.on('deleteGroup', (data) => {
    Group.findOneAndRemove({
      'groupName': data.groupName
    }, (err) => {
      if (err) {
        console.log(err)
      }
      Group.find({
        organization: data.org
      }, (err, group) => {
        if (err) {
          return console.error(err)
        } else {
          socket.emit('showList', {
            data: group
          })
        }
      })
    })
  })

  socket.on('savePaymentToken', (data) => {
    stripe.customers.create({
      email: data.stripeToken.email,
      source: data.stripeToken.id
    }, function(err, customer) {
      if (err) {
        console.log(err)
      }
      User.findOne({ userID: data.userID.toString() }, (err, user) => {
        if (err) {
          console.log(err)
        }
        user.stripeID = customer.id
        user.save((err, user) => {
          if (err) {
            console.log(err)
          }
          console.log('user info saved: ' + user.stripeID)
        })
      })
      stripe.subscriptions.create({
        customer: customer.id,
        items: [
          {
            plan: data.plan,
          },
        ],
      }, function(err, subscription) {
        if (err) {
          console.log(err)
          socket.emit('redirect', { data: false })
        }
        console.log(subscription)
        socket.emit('redirect', { data: true })
      })
    })
  })

  function requestPages(userID, userAccessToken) {
    var options = {
      method: 'get',
      url: "https://graph.facebook.com/v2.10/" + userID + "/accounts?access_token=" + userAccessToken
    }
    request(options, function(err, res, body) {
      if (err) {
        console.error(err)
      }
      console.log('BODY!!!! ' + body)
      var data = JSON.parse(body)

      if (data['error']) {
        console.log('no pages')
        socket.emit('noPages')
      }

      if (data['data']) {
        for (var i = 0; i < data.data.length; i++) {
          socket.emit('addPages', {
            page: data.data[i]
          })
        }
      }

    })
  }
})

// SET UP SERVER ENVIRONMENT
var port = process.env.PORT || 3000
server.listen(port, function() {
  console.log('Server running on port ' + port)
})

app.on('error', function() {
  console.log(error)
})

module.exports = app
