import { EventEmitter } from 'events';
import Instructions from './Instructions';
import * as HttpReaderHelpers from './HttpReaderHelpers';
import { ReaderDefinition } from './types/ReaderDefinition';

/**
 * Manages the provisioning of multiple readers and emits events
 */
export default class ProvisionManager extends EventEmitter {
  public instructions: Instructions;
  /**
   * Creates a new ProvisionManager
   * @param {Instructions} instructions An Instructions object that contains the provisioning instructions
   */
  constructor(instructions: Instructions) {
    super();
    this.instructions = instructions;
  }

  provisionReaders() {}
}
