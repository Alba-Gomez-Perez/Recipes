const jsonServer = require('json-server');
const server = jsonServer.create();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();

server.use(middlewares);
// Rewrite rules for Vercel
server.use(jsonServer.rewriter({
    '/api/*': '/$1',
    '/recipes/:id': '/recipes/:id',
    '/recipes*': '/recipes$1'
}));
server.use(router);

module.exports = server;
