// server.js
// ----- koa session handler ------
require('isomorphic-fetch');
const dotenv = require('dotenv');
var serve = require('koa-static');
const Koa = require('koa');
const { default: createShopifyAuth } = require('@shopify/koa-shopify-auth');
const { verifyRequest } = require('@shopify/koa-shopify-auth');
const session = require('koa-session');

dotenv.config();
const { SHOPIFY_API_SECRET_KEY, SHOPIFY_API_KEY } = process.env;
// ******* koa session handler *******


const { createServer } = require('https');
const { parse } = require('url')
const next = require('next')
const fs = require('fs');

const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()
const port = parseInt(process.env.PORT, 10) || 3000;

const httpsOptions = {
  key: fs.readFileSync('./httpscertificate/103.102.234.108.key'),
  cert: fs.readFileSync('./httpscertificate/103.102.234.108.crt')
};

app.prepare().then(() => {
  const server = new Koa();
  server.use(session({ secure: true, sameSite: 'none' }, server));
  server.keys = [SHOPIFY_API_SECRET_KEY];

  server.use(
    createShopifyAuth({
      apiKey: SHOPIFY_API_KEY,
      secret: SHOPIFY_API_SECRET_KEY,
      scopes: ['read_products'],
      afterAuth(ctx) {
        const { shop, accessToken } = ctx.session;

        ctx.redirect('/');
      },
    }),
  );

  server.use(verifyRequest());
  server.use(async (ctx) => {
    await handle(ctx.req, ctx.res);
    ctx.respond = false;
    ctx.res.statusCode = 200;
    return
  });

  app.use(serve('./public'));
  
  const httpsServer = createServer(httpsOptions, server.callback()  )
  httpsServer.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`);
  });

  // createServer(httpsOptions, (req, res) => {
  //   // Be sure to pass `true` as the second argument to `url.parse`.
  //   // This tells it to parse the query portion of the URL.
  //   const parsedUrl = parse(req.url, true)
  //   const { pathname, query } = parsedUrl

  //   if (pathname === '/a') {
  //     app.render(req, res, '/a', query)
  //   } else if (pathname === '/b') {
  //     app.render(req, res, '/b', query)
  //   } else {
  //     handle(req, res, parsedUrl)
  //   }
  // }).listen(8080, (err) => {
  //   if (err) throw err
  //   console.log('> Ready on http://localhost:3000')
  // })
})