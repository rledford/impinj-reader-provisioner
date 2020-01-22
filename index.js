const fs = require('fs');
const yargs = require('yargs');
const Instructions = require('./instructions');
const httpReaderHelpers = require('./httpReaderHelpers');

const argv = yargs
  .command(
    'provision',
    'Provision one or more Impinj readers using an instruction file'
  )
  .option('instruction', {
    alias: 'i',
    type: 'string'
  }).argv;

const instructions = new Instructions();

try {
  instructions.load(argv.instruction);
} catch (err) {
  console.log('Error loading instruction file:', err.message);
  process.exit(1);
}

async function start() {}
