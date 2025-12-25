import { injectable } from 'inversify';
import type { Argv } from 'yargs';
import type { Command } from '../../core/interfaces/command.interface.js';
import type { EpubArgs } from './epub.dto.js';

@injectable()
export class EpubCommand implements Command<EpubArgs, void> {
    public readonly name = 'epub';
    public readonly description = 'Processes a specific ebook file';

    public configure(yargs: Argv): Argv<EpubArgs> {
        return yargs
            .option('file', {
                alias: 'f',
                type: 'string',
                demandOption: true,
                describe: 'Path to the epub file',
            })
            .option('output', {
                type: 'string',
                describe: 'Path to the output file',
            }) as Argv<EpubArgs>;
    }

    public async execute(args: EpubArgs): Promise<void> {
        console.log(`Processing: ${args.file} (Force: ${args.output})`);
    }
}
