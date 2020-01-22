const fs = require('fs');

class Instructions {
  constructor() {
    this.readerNameList = [];
    this.readerIpList = [];
    this.readers = [];
    this.readerAgentToken = null;
    this.itemsenseHost = null;
    this.itemsenseCap = null;
    this.itemsenseCert = null;
  }

  load(path) {
    const f = fs.readFileSync(path, 'utf8');
    const lines = f.split('\n');
    for (const line of lines) {
      let inst = line.trim();
      if (inst[0] === '#') continue;
      const kv = inst.split('=');
      if (kv.length !== 2) continue;
      const [k, v] = kv;
      switch (k.toUpperCase()) {
        case 'READER':
          const [name, ip, username, password] = v.split(',');
          if (!name || !ip) {
            throw new Error('Invalid reader definition');
          }
          if (this.readerNameList.indexOf(name) >= 0) {
            throw new Error(`Duplicate reader name [ ${name} ]`);
          }
          if (this.readerIpList.indexOf(ip) >= 0) {
            throw new Error(`Duplicate reader IP [ ${ip} ]`);
          }
          this.readers.push({
            name,
            ip,
            username: username ? username : 'root',
            password: password ? password : 'impinj'
          });
          this.readerNameList.push(name);
          this.readerIpList.push(ip);
          break;
        case 'READER_AGENT_TOKEN':
          if (v.length === 0) {
            throw new Error('ReaderAgent token missing');
          }
          this.readerAgentToken = v;
          break;
        case 'ITEMSENSE_HOST':
          if (v.length === 0) {
            throw new Error('ItemSense host missing');
          }
          this.itemsenseHost = v;
          break;
        case 'ITEMSENSE_CAP':
          if (!fs.existsSync(v)) {
            throw new Error(`ItemSense cap file not found`);
          }
          this.itemsenseCap = v;
          break;
        case 'ITEMSENSE_CERT':
          if (!fs.existsSync(v)) {
            throw new Error(`ItemSense sever certificate not found`);
          }
          this.itemsenseCert = fs.readFileSync(v);
          break;
      }
    }
    if (
      !this.itemsenseHost ||
      !this.itemsenseCap ||
      !this.itemsenseCert ||
      !this.readerAgentToken
    ) {
      throw new Error(
        `Missing ItemSense server host, cap file, cert, or ReaderAgent token`
      );
    }
    if (this.readers.length === 0) {
      throw new Error(`No reader definitions found`);
    }
  }
}

module.exports = Instructions;
