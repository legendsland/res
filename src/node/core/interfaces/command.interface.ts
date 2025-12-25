import type { Argv } from 'yargs';

/**
 * The standard contract for all CLI commands.
 * @template T The type of the arguments the command accepts.
 * @template R The return type of the execution.
 */
export interface Command<T = any, R = void> {
    readonly name: string;
    readonly description: string;

    /** Configures the flags and options for this specific command */
    configure(yargs: Argv): Argv<T>;

    /** The core logic execution */
    execute(args: T): Promise<R>;
}
