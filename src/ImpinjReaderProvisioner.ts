import { EventEmitter } from 'events';
import Instructions from './Instructions';
import * as HttpReaderHelpers from './HttpReaderHelpers';
import { ReaderDefinition } from './types/ReaderDefinition';

const READER_BATCH_SIZE = 5;

async function wait(time: number) {
  return new Promise(resolve => {
    setTimeout(resolve, time);
  });
}

/**
 * Manages the provisioning of multiple readers and emits events
 */
export default class ImpinjReaderProvisioner extends EventEmitter {
  public instructions: Instructions;
  /**
   * Creates a new ImpinjReaderProvisioner
   * @param {Instructions} instructions An Instructions type object that contains the provisioning instructions
   */
  constructor(instructions: Instructions) {
    super();
    this.instructions = instructions;
  }

  async provisionReaders() {
    let batch: ReaderDefinition[] = [];
    for (let i = 0; i < this.instructions.readers.length; i++) {
      if (batch.length === 0) {
        console.log('building reader batch...');
      }
      batch.push(this.instructions.readers[i]);
      if (i !== this.instructions.readers.length - 1) {
        if (batch.length < READER_BATCH_SIZE) {
          continue;
        }
      }
      console.log('provisioning reader batch...');
      await Promise.all(
        batch.map(reader => {
          return new Promise(resolve => {
            console.log(`uploading upg file to ${reader.ip}`);
            HttpReaderHelpers.uploadUpg(
              reader.ip,
              this.instructions.itemsenseCap,
              reader.username,
              reader.password
            )
              .then(() => {
                console.log(`upg upload to ${reader.ip} complete`);
                resolve();
              })
              .catch(err => {
                console.log(`error uploading upg to ${reader.ip}: ${err}`);
                //  remove the reader from the batch
                batch.splice(batch.indexOf(reader), 1);
                resolve();
              });
          });
        })
      );
      console.log('remaining in batch', batch.length);
      if (batch.length === 0) {
        console.log('upg upload failed for all readers');
        continue;
      }
      // wait 30 seconds
      console.log('waiting 30 seconds for upg commit...');
      await wait(30000);
      await Promise.all(
        batch.map(reader => {
          return new Promise(resolve => {
            HttpReaderHelpers.restartReader(
              reader.ip,
              reader.username,
              reader.password
            )
              .then(() => {
                console.log(`restarting reader ${reader.ip}`);
                resolve();
              })
              .catch(err => {
                console.log(`error restarting reader ${reader.ip}: ${err}`);
                resolve();
              });
          });
        })
      );
      console.log('waiting 90 seconds for readers to fully reboot...');
      // wait 90 seconds
      await wait(90000);
      await Promise.all(
        batch.map(reader => {
          return new Promise(resolve => {
            HttpReaderHelpers.provisionReader(
              reader.ip,
              reader.name,
              this.instructions.readerAgentToken,
              this.instructions.itemsenseHost,
              this.instructions.itemsenseCert
            )
              .then(() => {
                console.log(`reader ${reader.ip} provisioned successfully`);
                resolve();
              })
              .catch(err => {
                console.log(`error provisioning reader ${reader.ip}: ${err}`);
                resolve();
              });
          });
        })
      );
      console.log(`reader batch complete`);
      batch = [];
    }
  }
}
