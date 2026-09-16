import http from 'node:http';
import https from 'node:https';

const listenPort = Number(process.env.GESTAOEVENTOS_PROXY_PORT ?? 8084);
const target = new URL(
  process.env.GESTAOEVENTOS_API_TARGET ?? 'https://sistema-eventos.seven-projetos.com',
);
const allowedOrigins = new Set([
  'http://localhost:8083',
  'http://127.0.0.1:8083',
  'http://localhost:8085',
  'http://127.0.0.1:8085',
  'http://localhost:19006',
  'http://127.0.0.1:19006',
]);

function corsHeaders(origin) {
  const headers = {
    'Access-Control-Allow-Headers': 'Authorization, Content-Type, If-None-Match',
    'Access-Control-Allow-Methods': 'DELETE, GET, OPTIONS, POST, PUT, PATCH',
    'Access-Control-Max-Age': '600',
    Vary: 'Origin',
  };

  if (allowedOrigins.has(origin)) headers['Access-Control-Allow-Origin'] = origin;
  return headers;
}

function proxyRequest(req, res) {
  const origin = req.headers.origin ?? '';
  const cors = corsHeaders(origin);

  if (req.method === 'OPTIONS') {
    res.writeHead(204, cors);
    res.end();
    return;
  }

  const headers = { ...req.headers, host: target.host };
  delete headers.origin;
  delete headers.referer;
  delete headers.connection;

  const request = (target.protocol === 'https:' ? https : http).request(
    {
      protocol: target.protocol,
      hostname: target.hostname,
      port: target.port || undefined,
      method: req.method,
      path: req.url ?? '/',
      headers,
    },
    (upstream) => {
      const responseHeaders = { ...upstream.headers, ...cors };
      delete responseHeaders['content-length'];
      res.writeHead(upstream.statusCode ?? 502, responseHeaders);
      upstream.pipe(res);
    },
  );

  request.on('error', (error) => {
    if (res.headersSent) {
      res.destroy(error);
      return;
    }

    res.writeHead(502, { 'Content-Type': 'application/json', ...cors });
    res.end(JSON.stringify({ error: 'Nao foi possivel conectar a API configurada.' }));
  });

  req.pipe(request);
}

const server = http.createServer(proxyRequest);
server.listen(listenPort, '127.0.0.1', () => {
  console.log(`API proxy ouvindo em http://localhost:${listenPort}`);
  console.log(`Destino da API: ${target.origin}`);
});

function shutdown() {
  server.close(() => process.exit(0));
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
