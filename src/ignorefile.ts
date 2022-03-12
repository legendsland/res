import * as os from 'os';
import * as path from 'path';
import * as fs from 'fs';
import {ParsedPath} from 'path';

export function fromIgnoreFile(): ParsedPath[] {
    const check_str = '## files below will be committed';

    const ignoreFile = fs.readFileSync('.gitignore').toString();
    const includedFiles: ParsedPath[] = [];

    let start = false;
    ignoreFile.split(os.EOL).forEach(line => {
        if(!start && line === check_str ) {
            start = true;
            return;
        }

        if(start && line.trim() !== '') {
            const p = path.parse(line.substring(1));
            includedFiles.push(p);
        }
    })

    return includedFiles;
}
