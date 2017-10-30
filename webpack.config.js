var webpack = require('webpack')

module.exports = {
  context: __dirname,
  entry: "./public/js/frontend.js",
  output: {
    path: __dirname + "/public/prod",
    filename: "frontend.js"
  }
}
