import {Db} from '../../common/db';

export class BrowserDb extends Db {

    override async load() {
        //@ts-ignore
        await import('../../common/db.json', {
            assert: {
                type: 'json'
            }
        }).then(d => this.db_ = d);

        const ann = this.db_.annotation;
        ann.records.forEach(record => {
            this.anns.set(record.url, record.notes);
        });
    }

}
