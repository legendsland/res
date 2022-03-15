import * as yargs from 'yargs';
import {add, checkDci, checkFiles, del} from './dci';
import {createIndex} from './gen';
import {Argv} from 'yargs';
import { Epub } from './epub';

(async () =>{

    const args: Argv = yargs
        .usage('Usage: $0 [-a <filename>]')
        .option('add', {
            alias: 'a',
            describe: 'Add files to index',
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
    ;

    const argv: any = args.argv;
    if (argv.t !== undefined) {
        checkDci(argv.t);
        await checkFiles();
    }

    else if (argv.a !== undefined) {
        await add(argv.a, argv.o || argv.a);
        createIndex();
    }

    else if (argv.d !== undefined) {
        await del(argv.d);
        createIndex();
    }

    else if (argv.c !== undefined) {
        const epub = new Epub(argv.c, argv.o);
        await epub.convert();
    }

})();

