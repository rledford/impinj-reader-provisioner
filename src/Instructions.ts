import fs from 'fs';
import { ReaderDefinition } from './types/ReaderDefinition';

export default class Instructions {
  public readerBatchSize: number = 5;
  public readerNameList: string[] = [];
  public readerIpList: string[] = [];
  public readers: ReaderDefinition[] = [];
  public readerAgentToken?: string;
  public itemsenseHost?: string;
  public itemsenseCap?: string;
  public itemsenseCert?: string;
  public force?: boolean = false;
  public provision?: boolean = false;

  /**
   * Creates a new Instructions object
   */
  constructor() {}

  /**
   * Loads the provision instructions from a file
   *
   * @param {String} path The path to an instructions file
   */
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
        case 'READER_BATCH_SIZE':
          let batchSize = parseInt(v);
          if (isNaN(batchSize) || batchSize < 1) {
            throw new Error(`Invalid reader batch size [ ${batchSize} ]`);
          }
          this.readerBatchSize = batchSize;
          break;
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
          this.itemsenseCert = fs.readFileSync(v).toString('base64');
          break;
      }
    }
    if (this.readers.length === 0) {
      throw new Error(`No reader definitions found`);
    }
    if (!this.itemsenseHost) {
      throw new Error('Missing ItemSense host');
    }
    if (!this.itemsenseCap) {
      throw new Error('Missing ItemSense cap file');
    }
    if (!this.itemsenseCert) {
      throw new Error('Missing ItemSense server certificate');
    }
    if (!this.readerAgentToken) {
      throw new Error('Missing ReaderAgent token');
    }
  }
}
