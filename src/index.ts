import * as yargs from 'yargs';
import { addDci } from "./dci";
import { gen } from "./gen";
import { merge } from './merge';

const args: any = yargs
.usage('Usage: $0 [-d <filename>]')
.option('dci', {
    alias: 'd',
    describe: 'Add DCI to html',
    type: 'string',
})
.option('merge', {
    alias: 'm',
    describe: 'Merge two html files',
    type: 'array',
})
.option('output', {
    alias: 'o',
    describe: 'Output filename',
    type: 'string',
})
;

const argv = args.argv;
if (argv.d !== undefined) {
    addDci(argv.d, argv.o || argv.d);
}

else if (argv.m !== undefined) {
    merge(argv.m, argv.o || argv.m[0]);
    process.exit(0);
}

gen();
