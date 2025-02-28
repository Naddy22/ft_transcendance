
# Fastify

## [Routes](https://fastify.dev/docs/latest/Reference/Routes/)

## [Request](https://fastify.dev/docs/latest/Reference/Request/)

## [Reply](https://fastify.dev/docs/latest/Reference/Reply/)

## [Plugins](https://fastify.dev/docs/latest/Reference/Plugins/)

## [Fastify - TypeScript](https://fastify.dev/docs/latest/Reference/TypeScript/)

## HTTPS server

1. Create the following imports from @types/node and fastify
```js
import fs from 'node:fs'
import path from 'node:path'
import fastify from 'fastify'
```

2. Perform the following steps before setting up a Fastify HTTPS server to create the key.pem and cert.pem files:
```sh
openssl genrsa -out key.pem
openssl req -new -key key.pem -out csr.pem
openssl x509 -req -days 9999 -in csr.pem -signkey key.pem -out cert.pem
rm csr.pem
```

3. Instantiate a Fastify https server and add a route:
```js
const server = fastify({
  https: {
    key: fs.readFileSync(path.join(__dirname, 'key.pem')),
    cert: fs.readFileSync(path.join(__dirname, 'cert.pem'))
  }
})

server.get('/', async function (request, reply) {
  return { hello: 'world' }
})

server.listen({ port: 8080 }, (err, address) => {
  if (err) {
    console.error(err)
    process.exit(0)
  }
  console.log(`Server listening at ${address}`)
})
```

## Using A Reverse Proxy

### NGINX

```plaintext
# This upstream block groups 3 servers into one named backend fastify_app
# with 2 primary servers distributed via round-robin
# and one backup which is used when the first 2 are not reachable
# This also assumes your fastify servers are listening on port 80.
# more info: https://nginx.org/en/docs/http/ngx_http_upstream_module.html
upstream fastify_app {
  server 10.10.11.1:80;
  server 10.10.11.2:80;
  server 10.10.11.3:80 backup;
}

# This server block asks NGINX to respond with a redirect when
# an incoming request from port 80 (typically plain HTTP), to
# the same request URL but with HTTPS as protocol.
# This block is optional, and usually used if you are handling
# SSL termination in NGINX, like in the example here.
server {
  # default server is a special parameter to ask NGINX
  # to set this server block to the default for this address/port
  # which in this case is any address and port 80
  listen 80 default_server;
  listen [::]:80 default_server;

  # With a server_name directive you can also ask NGINX to
  # use this server block only with matching server name(s)
  # listen 80;
  # listen [::]:80;
  # server_name example.tld;

  # This matches all paths from the request and responds with
  # the redirect mentioned above.
  location / {
    return 301 https://$host$request_uri;
  }
}

# This server block asks NGINX to respond to requests from
# port 443 with SSL enabled and accept HTTP/2 connections.
# This is where the request is then proxied to the fastify_app
# server group via port 3000.
server {
  # This listen directive asks NGINX to accept requests
  # coming to any address, port 443, with SSL.
  listen 443 ssl default_server;
  listen [::]:443 ssl default_server;

  # With a server_name directive you can also ask NGINX to
  # use this server block only with matching server name(s)
  # listen 443 ssl;
  # listen [::]:443 ssl;
  # server_name example.tld;

  # Enable HTTP/2 support
  http2 on;

  # Your SSL/TLS certificate (chain) and secret key in the PEM format
  ssl_certificate /path/to/fullchain.pem;
  ssl_certificate_key /path/to/private.pem;

  # A generic best practice baseline for based
  # on https://ssl-config.mozilla.org/
  ssl_session_timeout 1d;
  ssl_session_cache shared:FastifyApp:10m;
  ssl_session_tickets off;

  # This tells NGINX to only accept TLS 1.3, which should be fine
  # with most modern browsers including IE 11 with certain updates.
  # If you want to support older browsers you might need to add
  # additional fallback protocols.
  ssl_protocols TLSv1.3;
  ssl_prefer_server_ciphers off;

  # This adds a header that tells browsers to only ever use HTTPS
  # with this server.
  add_header Strict-Transport-Security "max-age=63072000" always;

  # The following directives are only necessary if you want to
  # enable OCSP Stapling.
  ssl_stapling on;
  ssl_stapling_verify on;
  ssl_trusted_certificate /path/to/chain.pem;

  # Custom nameserver to resolve upstream server names
  # resolver 127.0.0.1;

  # This section matches all paths and proxies it to the backend server
  # group specified above. Note the additional headers that forward
  # information about the original request. You might want to set
  # trustProxy to the address of your NGINX server so the X-Forwarded
  # fields are used by fastify.
  location / {
    # more info: https://nginx.org/en/docs/http/ngx_http_proxy_module.html
    proxy_http_version 1.1;
    proxy_cache_bypass $http_upgrade;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;

    # This is the directive that proxies requests to the specified server.
    # If you are using an upstream group, then you do not need to specify a port.
    # If you are directly proxying to a server e.g.
    # proxy_pass http://127.0.0.1:3000 then specify a port.
    proxy_pass http://fastify_app;
  }
}
```

## Decorators

In **Fastify**, `decorate` is a built-in method that allows you to **attach custom properties, methods, or plugins** to the Fastify instance. \
It’s a way to **extend Fastify's core functionality**.

```ts
fastify.decorate('sqlite', db);
```
- This adds a new property (sqlite) to the Fastify instance.
- Now, anywhere in your app, you can access `fastify.sqlite` to interact with the database.

### Why Use decorate?

- ✅ Prevents polluting the global scope.
- ✅ Makes dependencies accessible throughout Fastify.
- ✅ Ensures proper lifecycle management (e.g., plugins load before routes).

Example: Using decorate for a Custom Logger:
```ts
fastify.decorate('customLogger', (msg: string) => {
  fastify.log.info(`[MyApp] ${msg}`);
});

// Now we can use it in routes!
fastify.get('/log', async (request, reply) => {
  fastify.customLogger('This is a test log.');
  reply.send({ success: true });
});
```
👆 Here, `fastify.customLogger()` is now available everywhere in your Fastify instance.

### Important Notes

- Decorators Must Be Added Before `fastify.ready()`
	- If you try to decorate Fastify after it has fully booted, you’ll get an error.
- You Can't Overwrite Existing Properties
	- If Fastify already has a `log` property, you cannot do `fastify.decorate('log', myLogger)`.
	- Instead, use `decorateRequest` or `decorateReply` if you want to extend `request` or `reply`.

