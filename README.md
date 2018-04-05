# MemCachier and Express.js on Heroku tutorial

This is an example Express.js 4 app that uses the
[MemCachier add-on](https://addons.heroku.com/memcachier) on
[Heroku](http://www.heroku.com/). A running version of this app can be
found [here](http://memcachier-examples-expressjs.herokuapp.com).

Detailed instructions for developing this app are available
[here](https://devcenter.heroku.com/articles/expressjs-memcache).

## Deploy to Heroku

You can deploy this app yourself to Heroku to play with.

[![Deploy](https://www.herokucdn.com/deploy/button.png)](https://heroku.com/deploy)

## Running Locally

Run the following commands to get started running this app locally:

```sh
$ git clone https://github.com/memcachier/examples-expressjs.git
$ cd examples-expressjs
$ npm install
$ memcached &  # run a local memcached server instance
$ node app.js
```

Then visit `http://localhost:3000` to play with the app.

Note: instead of running a local `memcached` server you can also create a
[MemCachier](https://www.memcachier.com/) cache and add the `MEMCACHIER_*`
variables to the environment (e.g., via
[`.env`](https://github.com/motdotla/dotenv)).

## Deploying to Heroku

Run the following commands to deploy the app to Heroku:

```sh
$ git clone https://github.com/memcachier/examples-expressjs.git
$ cd examples-expressjs
$ heroku create
Creating app... done, ⬢ rocky-chamber-17110
https://rocky-chamber-17110.herokuapp.com/ | https://git.heroku.com/rocky-chamber-17110.git
$ heroku addons:create memcachier:dev
$ heroku config:add NODE_ENV=production
$ git push heroku master
$ heroku open
```

## Configuring MemCachier

Install `memjs` and configure it in Express.js as follows to use it with
MemCachier:

```js
var memjs = require('memjs')
var mc = memjs.Client.create(process.env.MEMCACHIER_SERVERS, {
  failover: true,  // default: false
  timeout: 1,      // default: 0.5 (seconds)
  keepAlive: true  // default: false
})
```

## Get involved!

We are happy to receive bug reports, fixes, documentation enhancements,
and other improvements.

Please report bugs via the
[github issue tracker](http://github.com/memcachier/examples-expressjs/issues).

Master [git repository](http://github.com/memcachier/examples-expressjs):

* `git clone git://github.com/memcachier/examples-expressjs.git`

## Licensing

This example is open-sourced software licensed under the
[MIT license](https://opensource.org/licenses/MIT).
