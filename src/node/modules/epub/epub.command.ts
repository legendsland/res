import { injectable } from 'inversify';
import type { Argv } from 'yargs';
import type { Command } from '../../core/interfaces/command.interface.js';
import type { EpubArgs } from './epub.dto.js';
import { Epub } from './epub.deprecated.js';

@injectable()
export class EpubCommand implements Command<EpubArgs, void> {
    public readonly name = 'epub';
    public readonly description = 'Process a epub file';

    public configure(yargs: Argv): Argv<EpubArgs> {
        return yargs
            .option('convert', {
                alias: 'c',
                describe: 'Input epub file path',
                type: 'string',
                nargs: 1,
            })
            .option('output', {
                alias: 'o',
                describe: 'Output html file path',
                type: 'string',
            });
    }

    public async execute(args: EpubArgs): Promise<void> {
        console.log(`Processing: ${args.convert} (output: ${args.output})`);
        const epub = new Epub(args.convert, args.output);
        return epub.convert();
    }
}
