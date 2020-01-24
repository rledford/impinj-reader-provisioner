import Instructions from './Instructions';
import * as HttpReaderHelpers from './HttpReaderHelpers';
import { ReaderDefinition } from './types/ReaderDefinition';

const READER_UPG_COMMIT_WAIT_TIME = 30000;
const READER_RESTART_WAIT_TIME = 90000;

async function wait(time: number) {
  return new Promise(resolve => {
    setTimeout(resolve, time);
  });
}

/**
 * Manages the provisioning of multiple readers and emits events
 */
export default class ImpinjReaderProvisioner {
  public instructions: Instructions;
  /**
   * Creates a new ImpinjReaderProvisioner
   * @param {Instructions} instructions An Instructions type object that contains the provisioning instructions
   */
  constructor(instructions: Instructions) {
    this.instructions = instructions;
  }

  async provisionReaders() {
    let batch: ReaderDefinition[] = [];
    let batchCount = 0;
    let succeedCount = 0;
    let startTime = Date.now();
    for (let i = 0; i < this.instructions.readers.length; i++) {
      if (batch.length === 0) {
        batchCount++;
        console.log(`Building reader batch [ ${batchCount} ]`);
      }
      batch.push(this.instructions.readers[i]);
      if (i !== this.instructions.readers.length - 1) {
        if (batch.length < this.instructions.readerBatchSize) {
          continue;
        }
      }
      console.log(`Provisioning readers in batch [ ${batchCount} ]`);
      await Promise.all(
        batch.map(reader => {
          return new Promise(resolve => {
            console.log(`Uploading CAP file to [ ${reader.ip} ]`);
            HttpReaderHelpers.uploadUpg(
              reader.ip,
              this.instructions.itemsenseCap,
              reader.username,
              reader.password
            )
              .then(() => {
                console.log(`CAP file uploaded to [ ${reader.ip} ]`);
                resolve();
              })
              .catch(err => {
                console.log(
                  `Error uploading CAP file to [ ${reader.ip} ] - ${err.message}`
                );
                //  remove the reader from the batch
                batch.splice(batch.indexOf(reader), 1);
                resolve();
              });
          });
        })
      );
      if (batch.length === 0) {
        console.log(
          `CAP file upload failed for all readers in batch [ ${batchCount} ]`
        );
        continue;
      }
      // wait for CAP commit to complete
      console.log(
        `Waiting ${READER_UPG_COMMIT_WAIT_TIME /
          1000} seconds for CAP to commit`
      );
      await wait(READER_UPG_COMMIT_WAIT_TIME);
      await Promise.all(
        batch.map(reader => {
          return new Promise(resolve => {
            HttpReaderHelpers.restartReader(
              reader.ip,
              reader.username,
              reader.password
            )
              .then(() => {
                console.log(`Restarting reader [ ${reader.ip} ]`);
                resolve();
              })
              .catch(err => {
                console.log(
                  `Error restarting reader [ ${reader.ip} ] - ${err.message}`
                );
                resolve();
              });
          });
        })
      );
      console.log(
        `Waiting ${READER_RESTART_WAIT_TIME /
          1000} seconds for readers to fully reboot`
      );
      // wait for reader to restart
      await wait(READER_RESTART_WAIT_TIME);
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
                console.log(`Reader [ ${reader.ip} ] provisioned successfully`);
                succeedCount++;
                resolve();
              })
              .catch(err => {
                console.log(
                  `Error provisioning reader [ ${reader.ip} ] - ${err.message}`
                );
                resolve();
              });
          });
        })
      );
      console.log(`Reader batch [ ${batchCount} ] complete`);
      batch = [];
    }
    console.log('     REPORT     ');
    console.log('****************');
    console.log(`DURATION: ${Math.round((Date.now() - startTime) / 1000)}s`);
    console.log(`READERS: ${this.instructions.readers.length}`);
    console.log(`BATCHES: ${batchCount}`);
    console.log(`SUCCEEDED: ${succeedCount}`);
    console.log(`FAILED: ${this.instructions.readers.length - succeedCount}`);
    console.log('****************');
  }
}
