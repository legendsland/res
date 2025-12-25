import { ContainerModule } from 'inversify';
import { TYPES } from './types/index.js';
import { CommandExecutor } from './executor.js';

export const coreModule = new ContainerModule(({ bind }) => {
    bind(TYPES.CommandExecutor).to(CommandExecutor).inSingletonScope();
});
