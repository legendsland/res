import * as fs from 'fs';
import * as path from 'path';

import {Record} from '../../common/db';

const root = path.join(__dirname, '../../../../');

// update db.json schemas
const dbPath = path.join(root, 'src/common/db.json');

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

const addPos = () => {
    json.annotation.records.forEach((record: Record) => {
        record.notes.forEach(n => {
            if (n.pos === undefined) {
                n.pos = {top:0, left:0};
            }
        })
    });

    fs.writeFileSync(dbPath, JSON.stringify(json, undefined, 2), {encoding: 'utf-8'});
}


addPos();

