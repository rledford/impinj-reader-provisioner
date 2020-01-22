const rp = require('request-promise');
const fs = require('fs');

const READER_API_URL = '/cgi-bin/index.cgi';

async function restartReader(host, username = 'root', password = 'impinj') {
  const url = `http://${host}${READER_API_URL}`;
  return rp.post(url, {
    form: {
      'reboot.x': '22',
      'reboot.y': '3'
    },
    auth: {
      username,
      password
    }
  });
}

async function uploadUpg(host, path, username = 'root', password = 'impinj') {
  const url = `http://${host}${READER_API_URL}`;
  let upg;

  try {
    upg = fs.createReadStream(path);
    console.log('created upg file stream');
  } catch (err) {
    console.log('invalid upg file path');
  }

  if (upg) {
    return rp.post(url, {
      formData: {
        file: upg
      },
      auth: {
        username,
        password
      }
    });
  }
}

async function provisionReader(
  host,
  readerName,
  readerAgentToken,
  itemsenseHost,
  itemsenseCert
) {
  const url = `https://${host}:51505/provision`;
  const itemsenseUrl = `https://${itemsenseHost}/itemsense`;
  const cert = itemsenseCert.toString('base64');
  return rp.post(url, {
    followRedirect: false,
    headers: {
      Accept: 'application/json'
    },
    json: true,
    body: {
      BaseUrl: itemsenseUrl,
      AgentId: readerName,
      ApiKey: readerAgentToken,
      ServerCertificate: cert
    }
  });
}

module.exports = {
  restartReader,
  uploadUpg,
  provisionReader
};
