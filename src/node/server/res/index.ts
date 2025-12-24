/********************************************************************************
 * Copyright (C) 2023 Zhangyi
 ********************************************************************************/

import { Db } from '../../../common/db';

import fs from 'fs';

export class NodeDb extends Db {
    override async load() {
        console.log(`load db ${this.dbPath}`);
        // await import(this.dbPath, {
        //     with: {
        //         type: 'json',
        //     },
        // }).then((d) => {
        //     this.db_ = d.default;
        // });
        this.db_ = JSON.parse(fs.readFileSync(this.dbPath, { encoding: 'utf-8' }));

        console.log('load done');

        const ann = this.db_.annotation;
        ann.records.forEach((record) => {
            this.anns.set(record.url, record.notes);
        });
    }

    save() {
        fs.writeFileSync(this.dbPath, this.toString());
    }
}
