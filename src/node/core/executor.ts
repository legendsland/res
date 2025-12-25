import { injectable, multiInject, postConstruct } from 'inversify';
import yargs, { Argv } from 'yargs';
import { hideBin } from 'yargs/helpers';
import { TYPES } from './types/index.js';
import type { Command } from './interfaces/command.interface.js';

@injectable()
export class CommandExecutor {
    private cli: Argv;

    constructor(@multiInject(TYPES.Command) private commands: Command[]) {
        // Constructor only handles the most basic setup
        this.cli = yargs(hideBin(process.argv));
    }

    /**
     * Automatically called by InversifyJS after all commands are injected.
     * This builds the CLI command registry exactly once.
     */
    @postConstruct()
    public init(): void {
        for (const cmd of this.commands) {
            this.cli.command(
                cmd.name,
                cmd.description,
                (y) => cmd.configure(y),
                async (argv) => {
                    try {
                        // Execute the matched command
                        console.log(argv);
                        await cmd.execute(argv);
                    } catch (error) {
                        console.info(`Error executing ${cmd.name}:`, error);
                    }
                },
            );
            console.info(`command ${cmd.name} added`);
        }

        // Set up global help and versioning once
        this.cli
            .demandCommand(1, 'You must specify a valid command.')
            .help()
            .alias('h', 'help')
            .strict()
            .exitProcess(false);
    }

    public async run(): Promise<void> {
        await this.cli.parseAsync();
    }
}
