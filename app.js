var express = require("express");
var memjs = require('memjs')
var session = require('express-session');
var MemcachedStore = require('connect-memjs')(session);
var bodyParser = require('body-parser');
var app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// bind the app to a specified port
var port = process.env.PORT || 3000;
app.listen(port);
console.log("Listening on port " + port);

// Session config
app.use(session({
  secret: 'ClydeIsASquirrel',
  resave: 'false',
  saveUninitialized: 'false',
  store: new MemcachedStore({
    servers: [process.env.MEMCACHIER_SERVERS],
    prefix: '_session_'
  })
}));

// Like storage (you should use a permanent storage like a database)
var likes = {}

var mc = memjs.Client.create(process.env.MEMCACHIER_SERVERS, {
  failover: true,  // default: false
  timeout: 1,      // default: 0.5 (seconds)
  keepAlive: true  // default: false
})

var validate = function(req, res, next) {
  if(req.query.n) {
    number = parseInt(req.query.n, 10);
    if(isNaN(number) || number < 1 || number > 10000){
      res.render('index', {error: 'Please submit a valid number between 1 and 10000.'});
      return;
    }
    req.query.n = number;
  }
  next();
}

var cacheView = function(req, res, next) {
  var view_key = '_view_cache_' + req.originalUrl || req.url;
  mc.get(view_key, function(err, val) {
    if(err == null && val != null) {
      // Found the rendered view -> send it immediately
      res.send(val.toString('utf8'));
      return;
    }
    // Cache the rendered view for future requests
    res.sendRes = res.send
    res.send = function(body){
      mc.set(view_key, body, {expires:0}, function(err, val){})
      res.sendRes(body);
    }
    next();
  });
}

var calculatePrime = function(n){
  var prime = 1;
  for (var i = n; i > 1; i--) {
    var is_prime = true;
    for (var j = 2; j < i; j++) {
      if (i % j == 0) {
        is_prime = false;
        break;
      }
    }
    if (is_prime) {
      prime = i;
      break;
    }
  }
  return prime;
}

// Set up the GET route
app.get('/', validate, cacheView, function (req, res) {
  if(req.query.n) {
    var prime;
    var prime_key = 'prime.' + req.query.n;
    // Look in cache
    mc.get(prime_key, function(err, val) {
      if(err == null && val != null) {
        // Found it!
        prime = parseInt(val)
      }
      else {
        // Prime not in cache (calculate and store)
        prime = calculatePrime(req.query.n)
        mc.set(prime_key, '' + prime, {expires:0}, function(err, val){})
      }
      // Render view with prime
      res.render('index', { n: req.query.n, prime: prime, likes: likes[req.query.n] || 0 });
    })
  }
  else {
    // Render view
    res.render('index', {});
  }
});

app.post('/', function (req, res) {
  mc.delete('_view_cache_/?n=' + req.body.n, function(err, val){});
  likes[req.query.n] = (likes[req.query.n] || 0) + 1
  res.redirect('/?n=' + req.query.n)
});
