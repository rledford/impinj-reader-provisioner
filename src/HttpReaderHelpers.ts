import rp from 'request-promise';
import fs from 'fs';

const READER_API_URL = '/cgi-bin/index.cgi';

function restartReader(
  host: string,
  username: string = 'root',
  password: string = 'impinj'
): rp.RequestPromise {
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

function uploadUpg(
  host: string,
  path: string,
  username: string = 'root',
  password: string = 'impinj'
): rp.RequestPromise {
  const url = `http://${host}${READER_API_URL}`;

  return rp.post(url, {
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
  host: string,
  readerName: string,
  readerAgentToken: string,
  itemsenseHost: string,
  itemsenseCert: string
): rp.RequestPromise {
  const url = `https://${host}:51505/provision`;
  const itemsenseUrl = `https://${itemsenseHost}/itemsense`;

  return rp.post(url, {
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
