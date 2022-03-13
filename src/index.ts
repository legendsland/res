import * as yargs from 'yargs';
import {add, checkDci} from './dci';
import {createIndex} from './gen';
import { merge } from './merge';
import {Argv} from 'yargs';

const args: Argv = yargs
.usage('Usage: $0 [-a <filename>]')
.option('add', {
    alias: 'a',
    describe: 'Add files to index',
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
;

const argv: any = args.argv;
if (argv.t !== undefined) {
    checkDci(argv.t);
    process.exit(0);
}

else if (argv.a !== undefined) {
    add(argv.a, argv.o || argv.a);
}

else if (argv.m !== undefined) {
    merge(argv.m, argv.o || argv.m[0]);
    process.exit(0);
}

createIndex();
