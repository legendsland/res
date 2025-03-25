import * as os from 'os';
import * as path from 'path';
import * as fs from 'fs';
import { ParsedPath } from 'path';

export function fromIgnoreFile(): ParsedPath[] {
    const check_str = '## files below will be committed';

    const ignoreFile = fs.readFileSync('.gitignore').toString();
    const includedFiles: ParsedPath[] = [];

    let start = false;
    ignoreFile.split(os.EOL).forEach((line) => {
        if (!start && line === check_str) {
            start = true;
            return;
        }

        if (start && line.trim() !== '') {
            // remove the leading char '!'
            const filename = line.substring(1);
            const p = path.parse(filename);
            includedFiles.push(p);
        }
    });

    return includedFiles;
}

export function delIgnore(filePath: ParsedPath) {
    const line = `\n!${filePath.dir}/${filePath.base}`;

    const ignoreFile = fs.readFileSync('.gitignore').toString();

    const idx = ignoreFile.indexOf(line);
    if (idx !== -1) {
        const newContent = ignoreFile.slice(0, idx) + ignoreFile.slice(idx + line.length);
        console.log(`${line} removed from ignore`);
        fs.writeFileSync('.gitignore', newContent);
    } else {
        console.log(`${line} not found`);
    }
}

export function appendIgnore(filePath: ParsedPath) {
    const added = fromIgnoreFile();
    const found = added.filter((path) => filePath.dir === path.dir
        && filePath.base === path.base).length > 0;

    if (!found) {
        let lines = '';

        // check if is a symbolic link
        const file = `${filePath.dir}/${filePath.base}`;
        const stat = fs.lstatSync(file);
        if (stat.isSymbolicLink()) {
            console.log(`symbol link: ${file}`);
            const real = fs.readlinkSync(file);
            const realFile = path.relative('.', path.resolve(filePath.dir, real));
            lines += `\n!${realFile}`;
        }

        lines += `\n!${file}`;
        fs.appendFileSync('.gitignore', lines);
        console.log(`++ ${lines}`);
    }
}
