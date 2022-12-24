import * as yargs from 'yargs';
import {add, checkDci, checkFiles, del, decorate} from './cli/dci';
import {createIndex} from './cli/gen';
import {Argv} from 'yargs';
import { Epub } from './cli/epub';
import { startServer } from './server/';
import { crawler } from './server/crawler/html/neo4j-docs';
import { fetch } from './server/hypothes.is';
import { words } from './server/nlp';
import {Neo4jClient} from './server/neo4j/client';
import {merge} from './cli/merge';

(async () =>{

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
            default: false
        })
        .option('crawler', {
            alias: 'n',
            describe: 'Script as src link',
            boolean: true,
            default: false
        })
        .option('hypothes.is', {
            alias: 'p',
            describe: 'Script as src link',
            boolean: true,
            default: false
        })
        .option('nlp', {
            alias: 'l',
            describe: 'nlp',
            type: 'string',
        })
    ;

    const argv: any = args.argv;
    console.log(argv);


    if (argv.i) {
        await createIndex();
    }

    else if (argv.t !== undefined) {
        checkDci(argv.t);
        await checkFiles();
    }

    else if (argv.a !== undefined) {
        await add(argv.a);
        await createIndex();
    }

    else if (argv.u !== undefined) {
        decorate(argv.u, argv.e, argv.o || argv.u);
    }

    else if (argv.d !== undefined) {
        await del(argv.d);
        await createIndex();
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

    else if (argv.p) {
        await fetch();
    }

    else if (argv.l) {
        const sent = words(argv.l);

        const client = new Neo4jClient();
        const result = await client.addSent(sent);

        console.log(result);

        await client.dispose();
    }

    else if (argv.m) {
        await merge(argv.m[0], argv.m[1]);
    }
})();

