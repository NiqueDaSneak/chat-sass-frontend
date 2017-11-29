# Irrigate Front-End Setup

This repository is all of the code for the front-end website at www.irrigatemsg.com, the front-end code for the Irrigate tool at www.irrigatemsg.com/dashboard/org-name, as well as the back-end app.js that renders all routes and handles data passage to all views.

## Getting Started

Prerequisites needed are node.js/NPM, gulp.js, nodemon, and webpack.

### Check Node.js Install

Run this command to verify you have node.js and NPM installed on your machine.

```
node -v
```

```
npm -v
```

If these commands do not render any version numbers, use the links below to install:
* [Mac Install](https://treehouse.github.io/installation-guides/mac/node-mac.html)
* [Windows Install](http://blog.teamtreehouse.com/install-node-js-npm-windows)

### Install Gulp.js

Gulp is used to compile all SASS files into a single CSS file that the front-end can use. Install instructions below:

```
npm install gulp-cli -g
```

```
npm install gulp -D
```

### Install Nodemon

We use nodemon as our developent server. It listens for changes and automatically restarts the server so we don't have to. Install via NPM:

```
npm install -g nodemon
```

### Install Webpack

We use webpack to compile our Javascript files into one master frontend.js file. Webpack is a dev dependency, and will be installed with the entire repo. When modifying a file that will be compiled down, this is the command to make an update to it:

```
webpack
```

## Starting Server

Once you clone or download the repository to your machine, you need to install the node modules listed in the package.json file. Run this command to install them locally:

```
npm install
```

Now, make sure that you have gulp running, to update your production CSS file:

```
gulp
```

Last step is start nodemon to read the app.js file:

```
nodemon app.js
```

## Feature Building

We use Github on the command line for version control. When you first get into the directory you will be on the 'master' branch. WE DO NOT MAKE CHANGES ON THE MASTER BRANCH DIRECTLY.

Rant aside, any time you are in the 'master' branch, you should be pulling down the latest version of 'master':

```
git pull
```

Anytime you are starting a new feature you need to create a new git branch:

```
git checkout -b 'feature/name-of-feature'
```

As you are coding, you will want to make lots of commits. Feature branches are composed of various small changes that achieve the purpose of the branch. Make commits for these small changes that add to the whole branch:

```
git add path/to/file.js
git commit -m 'Describe commit in present tense'
```

When the coding is done for the feature branch/ all commits made, you need to push those changes up to Github:

```
git push origin feature/name-of-feature
```

You then need to come back to the Github website and make a pull request for your code! Great job!

After you make the pull request and it is approved, you will need to come back to the master branch and pull all new changes down. Remember, any time we are in the 'master' branch we need to run

```
git checkout master
git pull
```
