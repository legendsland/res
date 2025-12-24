import * as yargs from 'yargs';
import { Argv } from 'yargs';
import * as path from 'path';
import { add, checkDci, checkFiles, del, decorate } from './cli/dci';
import { createIndex } from './cli/gen';
import { Epub } from './cli/epub';
import { startServer } from './server';
import { merge } from './cli/merge';
import { Archive } from './cli/archive';

const ROOT = '/home/zy/ws/res/';

(async () => {
    const args: Argv = yargs
        .usage('Usage: $0 [-a <filename>]')
        .option('index', {
            alias: 'i',
            describe: 'Create index.html',
            boolean: true,
            default: false,
        })
        .option('add', {
            alias: 'a',
            describe: 'Add files to index',
            type: 'string',
        })
        .option('update', {
            alias: 'u',
            describe: 'Update file with css and js',
            type: 'string',
        })
        .option('delete', {
            alias: 'd',
            describe: 'Delete a file from index and git',
            type: 'string',
        })
        .option('merge', {
            alias: 'm',
            describe: 'Merge two html files',
            type: 'array',
        })
        .option('test', {
            alias: 't',
            describe: 'Test html files having dc identifier',
            type: 'array',
        })
        .option('output', {
            alias: 'o',
            describe: 'Output filename',
            type: 'string',
        })
        .option('convert', {
            alias: 'c',
            describe: 'Convert epub to a single html',
            type: 'string',
        })
        .option('server', {
            alias: 's',
            describe: 'Start web server',
            type: 'string',
        })
        .option('embedded', {
            alias: 'e',
            describe: 'Embed script code into html',
            boolean: true,
            default: false,
        })
        .command(
            'frame [dir]',
            'merge multiple html files into single one as iframes',
            (_yargs: any) => {
                _yargs.positional('dir', {
                    type: 'string',
                });
            },
            ({ dir }) => {
                let p;
                if (typeof dir === 'string') {
                    p = path.join(ROOT, dir);
                }
                new Archive(p);
            },
        );
    const { argv } = args as any;
    console.log(argv);

    if (argv.i) {
        await createIndex();
    } else if (argv.t !== undefined) {
        checkDci(argv.t);
        await checkFiles();
    } else if (argv.a !== undefined) {
        await add(argv.a);
        await createIndex();
    } else if (argv.u !== undefined) {
        decorate(argv.u, argv.e, argv.o || argv.u);
    } else if (argv.d !== undefined) {
        await del(argv.d);
        await createIndex();
    } else if (argv.c !== undefined) {
        const epub = new Epub(argv.c, argv.o);
        await epub.convert();
    } else if (argv.s !== undefined) {
        startServer();
    } else if (argv.m) {
        await merge(argv.m[0], argv.m[1]);
    }
})();
