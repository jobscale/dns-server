const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const { resolve } = require('path');

const logger = console;

const restartDNS = () => new Promise((resolve, reject) => {
  const proc = spawn('/etc/init.d/dnsmasq', ['restart'], { shell: true });
  proc.stdout.on('data', data => {
    logger.info(`DNS restart message: ${data}`);
  });
  proc.stderr.on('data', data => {
    logger.error(`DNS restart error: ${data}`);
  });
  proc.on('close', code => {
    if (code !== 0) {
      reject(new Error(`DNS restart process exited with code ${code}`));
      return;
    }
    resolve('DNS restarted successfully');
  });
});

const getDNSService = async () => {
  const dbPath = '/etc/dnsmasq.d/custom.conf';
  const dns = fs.readFileSync(dbPath, 'utf8');
  return { dns };
};

const getDNSController = async (req, res) => {
  await getDNSService()
  .then(payload => {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(payload));
  })
  .catch(e => {
    logger.error(e);
    res.writeHead(500);
    res.end('Internal Server Error');
  });
};

const reqBody = req => new Promise((resolve, reject) => {
  let data = '';
  req.on('data', chunk => { data += chunk; });
  req.on('end', async () => resolve(data));
  req.on('error', e => reject(e));
});

const postDNSService = async data => {
  const payload = JSON.parse(data);
  if (!payload.dns) {
    throw new Error('JSON do not valid');
  }
  const dbPath = '/etc/dnsmasq.d/custom.conf';
  fs.writeFileSync(dbPath, payload.dns);
  await restartDNS();
};

const postDNSController = async (req, res) => {
  const data = await reqBody(req);
  await postDNSService(data)
  .then(() => {
    res.writeHead(200);
    res.end('Zone file updated successfully');
  })
  .catch(e => {
    logger.error(e);
    if (e.message.match(/JSON/)) {
      res.writeHead(400);
      res.end('Bad Request');
      return;
    }
    res.writeHead(500);
    res.end('Internal Server Error');
  });
};

const route = (req, res) => {
  const { method, url } = req;
  const [, endpoint] = url.split('/');
  if (method === 'GET' && endpoint === 'ddns') {
    getDNSController(req, res);
  } else if (method === 'POST' && endpoint === 'ddns') {
    postDNSController(req, res);
  } else {
    res.writeHead(404);
    res.end('Not Found');
  }
};

const server = http.createServer(route);

const PORT = Number.parseInt(process.env.PORT, 10) || 3000;
server.listen(PORT, () => {
  logger.info(`Server running at http://127.0.0.1:${PORT}/`);
});
