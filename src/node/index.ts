import * as yargs from 'yargs';
import {add, checkDci, checkFiles, del, decorate} from './dci';
import {createIndex} from './gen';
import {Argv} from 'yargs';
import { Epub } from './epub';
import { startServer } from './server/server';
import { crawler } from './server/crawler/html/neo4j-docs';

(async () =>{

    const args: Argv = yargs
        .usage('Usage: $0 [-a <filename>]')
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
        .option('external', {
            alias: 'e',
            describe: 'Script as src link',
            boolean: true,
            default: false
        })
        .option('crawler', {
            alias: 'n',
            describe: 'Script as src link',
            boolean: true,
            default: false
        })
    ;

    const argv: any = args.argv;
    console.log(argv);


    if (argv.t !== undefined) {
        checkDci(argv.t);
        await checkFiles();
    }

    else if (argv.a !== undefined) {
        await add(argv.a);
        createIndex();
    }

    else if (argv.u !== undefined) {
        decorate(argv.u, argv.e, argv.o || argv.u);
    }

    else if (argv.d !== undefined) {
        await del(argv.d);
        createIndex();
    }

    else if (argv.c !== undefined) {
        const epub = new Epub(argv.c, argv.o);
        await epub.convert();
    }

    else if (argv.s !== undefined) {
        startServer();
    }

    else if (argv.n) {
        crawler();
    }

})();

