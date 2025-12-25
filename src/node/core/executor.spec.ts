import { Container } from 'inversify';
import { describe, it, expect } from '@jest/globals';
import { mock } from 'jest-mock-extended';
import { CommandExecutor } from './executor.js';
import { TYPES } from './types/index.js';
import type { Command } from './interfaces/command.interface.js';

describe('CommandExecutor Integration', () => {
    it('should resolve all registered commands and execute the target', async () => {
        const container = new Container();

        const mockCommand = mock<Command>({
            name: 'test',
            description: 'description',
            configure: (y) => {
                return y.option('switch', {
                    alias: 's',
                    type: 'boolean',
                    describe: 'A switch',
                });
            },
        });
        process.argv = `_ _ ${mockCommand.name} -s`.split(/\s/);

        container.bind(TYPES.Command).toConstantValue(mockCommand);
        container.bind(CommandExecutor).toSelf();

        const executor = container.get(CommandExecutor);

        await executor.run();

        expect(mockCommand.execute).toHaveBeenCalledWith(
            expect.objectContaining({
                switch: true,
            }),
        );
    });
});
