# MemCachier and Express.js on DigitalOcean tutorial

This is an incomplete example Express.js 4 app that uses
[MemCachier](https://www.memcachier.com) on
[DigitalOcean](http://www.heroku.com/). A running version of this app can be
found [here](http://memcachier-examples-expressjs.herokuapp.com).

Detailed instructions for finishing and developing this app are available
[here](https://blog.memcachier.com/2018/02/24/express-on-digital-ocean).

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

## Deploying to DigitalOcean

Run the following commands to deploy the app to DigitalOcean:

```bash
$ doctl compute droplet create express-memcache --image nodejs-18-04 --region nyc1 --size s-1vcpu-1gb --ssh-keys <KEY_FINGERPRINT>
$ ssh root@<DROPLET_IP>
```

### Create a new user

For security reasons, we need to create another user besides `root`. Start by
logging (ssh'ing) into your droplet and typing the following commands:

```bash
root@express-memcache:~\# adduser linzjax # or whatever username you'd like.
# We'll need to give our new user sudo permissions:
root@express-memcache:~\# usermod -aG sudo linzjax
# Then finally switch over to that user
root@express-memcache:~\# su linzjax
# give the user ssh permission
linzjax@express-memcache:~$ mkdir .ssh
linzjax@express-memcache:~$ sudo cp /root/.ssh/authorized_keys .ssh/
linzjax@express-memcache:~$ sudo chown linzjax:linzjax .ssh/authorized_key
```

We can now login to our droplet with our new user from our terminal:
```bash
$ ssh linzjax@<DROPLET_IP>
linzjax@express-memcache:~$ git clone git@github.com:memcachier/examples-expressjs.git
```

<div class="alert alert-info">
   If you're getting a permission denied error, chances are you'll need to create
   a new set of ssh keys for your droplet.
   ```
   linzjax@express-memcache:~$ cd .ssh
   linzjax@express-memcache:~/.ssh$ ssh-keygen -t rsa -b 4096 -C "lindsey@memcachier.com"
   ```
   You'll be asked for a name, it can be whatever you like, but unless told
   otherwise, Github looks for `id_rsa` keys so it's easiest to leave your keyname
   as that. You'll also be prompted for a passcode. You can just hit enter to
   leave it blank.

   At this point you can copy the id_rsa.pub into your Github Account
   Settings > Security > SSH and GPG Keys. This will give your DigitalOcean
   droplet Github access.
   </div>

```bash
linzjax@express-memcache:~/$ cd examples-express
linzjax@express-memcache:~/examples-express$ sudo npm install -g pm2
linzjax@express-memcache:~/examples-express$ pm2 start app.js
# You'll get a message indicating that the application has started.
# To test this you can run `curl http://localhost:3000` in the root user window.
linzjax@express-memcache:~/examples-express$ pm2 startup systemd
# follow the directions to copy and paste the `sudo env PATH=$PATH` line into
# your terminal.

linzjax@express-memcache:~/examples-express$ cd ..
linzjax@express-memcache:~$ sudo apt-get update
linzjax@express-memcache:~$ sudo apt-get install nginx   
linzjax@express-memcache:~$ sudo ufw allow 'Nginx HTTP'
linzjax@express-memcache:~$ sudo vim /etc/nginx/sites-available/default
```

Copy and paste the following settings into the location section.

```
location \{
 proxy_set_header X-Real-IP $remote_addr;
 proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
 proxy_set_header Host $http_host;
 proxy_set_header X-NginX-Proxy true;
 proxy_pass http://localhost:8888/;
 proxy_redirect off;
}
```

Type `:wq` to save and exit vim. Now all that's left is to check that our
nginx configuration is correct, and restart it.

```bash
linzjax@express-memcache:~$ sudo nginx -t
# Should get the following message.
nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
nginx: configuration file /etc/nginx/nginx.conf test is successful

linzjax@express-memcache:~$ sudo systemctl restart nginx
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
