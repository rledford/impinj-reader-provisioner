import yargs from 'yargs';
import Instructions from './Instructions';
import ImpinjReaderProvisioner from './ImpinjReaderProvisioner';
import * as HttpReaderHelpers from './HttpReaderHelpers';

const argv = yargs.option('ifile', {
  alias: 'i',
  type: 'string'
}).argv;

const instructions = new Instructions();

try {
  instructions.load(argv.ifile);
} catch (err) {
  console.log('Error loading instruction file:', err.message);
  process.exit(1);
}

if (argv.p) {
  instructions.provision = true;
}
if (argv.f) {
  instructions.force = true;
}
const irp = new ImpinjReaderProvisioner(instructions);
irp.provisionReaders();
