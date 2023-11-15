/********************************************************************************
 * Copyright (C) 2023 Zhangyi
 ********************************************************************************/

import { Db } from '../../../common/db';

const fs = require('fs');

export class NodeDb extends Db {
    override async load() {
        console.log(`load db ${this.dbPath}`);
        // @ts-ignore
        await import(this.dbPath, {
            assert: {
                type: 'json',
            },
        }).then((d) => {
            this.db_ = d.default;
        });
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
