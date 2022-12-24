import * as fs from 'fs';
import * as path from 'path';

import {Record} from '../../common/db';

// update db.json schemas
const dbPath = path.join(__dirname, '../../common/db.json');

const db = fs.readFileSync(dbPath, {encoding: 'utf-8'});
const json = JSON.parse(db);

const addTags = () => {
    json.annotation.records.forEach((record: Record) => {
        record.notes.forEach(n => {
            if (n.tags === undefined) {
                n.tags = [];
            }
        })
    });

    fs.writeFileSync(dbPath, JSON.stringify(json, undefined, 2), {encoding: 'utf-8'});
}


addTags();


