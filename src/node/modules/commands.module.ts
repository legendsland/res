import { ContainerModule } from 'inversify';
import { TYPES } from '../core/types/index.js';
import { EpubCommand } from './epub/epub.command.js';

export const commandsModule = new ContainerModule(({ bind }) => {
    // We use multi-binding here so the Executor can find all of them
    bind(TYPES.Command).to(EpubCommand);
});
