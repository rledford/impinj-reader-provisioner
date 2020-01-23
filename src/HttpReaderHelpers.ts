import rp from 'request-promise';
import fs from 'fs';

const READER_API_URL = '/cgi-bin/index.cgi';

function restartReader(
  readerIp: string,
  username: string = 'root',
  password: string = 'impinj'
): rp.RequestPromise {
  const url = `http://${readerIp}${READER_API_URL}`;
  return rp.post(url, {
    timeout: 5000,
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

function uploadUpg(
  readerIp: string,
  path: string,
  username: string = 'root',
  password: string = 'impinj'
): rp.RequestPromise {
  const url = `http://${readerIp}${READER_API_URL}`;

  return rp.post(url, {
    timeout: 5000,
    formData: {
      file: fs.createReadStream(path)
    },
    auth: {
      username,
      password
    }
  });
}

function provisionReader(
  readerIp: string,
  readerName: string,
  readerAgentToken: string,
  itemsenseHost: string,
  itemsenseCert: string
): rp.RequestPromise {
  const url = `https://${readerIp}:51505/provision`;
  const itemsenseUrl = `https://${itemsenseHost}/itemsense`;

  return rp.post(url, {
    timeout: 5000,
    followRedirect: false,
    strictSSL: false,
    headers: {
      Accept: 'application/json'
    },
    json: true,
    body: {
      BaseUrl: itemsenseUrl,
      AgentId: readerName,
      ApiKey: readerAgentToken,
      ServerCertificate: itemsenseCert
    }
  });
}

export { restartReader, uploadUpg, provisionReader };
