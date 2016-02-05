'use strict';

let express = require('express');
let app = express();

let React = require('react');
let ReactDOMServer = require('react-dom/server');

let DOM = React.DOM;
let body = DOM.body;
let div = DOM.div;
let script = DOM.script;

let browserify = require('browserify');
let babelify = require("babelify");

app.set('port', (process.argv[2] || 3000));
app.set('view engine', 'jsx');
app.set('views', __dirname + '/views');
app.engine('jsx', require('express-react-views').createEngine({ transformViews: false }));

require('babel/register')({
  ignore: false
});
var TodoBox = require('./views/index.jsx');

let data = [
  { title: 'Shopping', detail: process.argv[3]},
  { title: 'Hair cut', detail: process.argv[4]}
];

app.use('/bundle.js', function (req, res) {
  res.setHeader('content-type', 'application/javascript');

  browserify({ debug: true })
  .transform(babelify.configure({
    presets: ["react", "es2015"],
    global: true,
    ignore: /\/node_modules\/(?!app\/)/,
    compact: true
  }))
  .require("./app.js", { entry: true })
  .bundle()
  .pipe(res);
});

app.use('/', function (req, res) {
  var initialData = JSON.stringify(data);
  var markup = ReactDOMServer.renderToString(React.createElement(TodoBox, {data: data}));

  res.setHeader('Content-Type', 'text/html');

  var html = ReactDOMServer.renderToStaticMarkup(body(null,
    div({id: 'app', dangerouslySetInnerHTML: {__html: markup}}),
    script({
        id: 'initial-data',
        type: 'text/plain',
        'data-json': initialData
    }),
    script({src: '/bundle.js'})
  ));

  res.end(html);
});

// app.use('/', function(req, res) {
//   res.render('index', {data: data});
// });

app.listen(app.get('port'), function() {});