// update db.json schemas

import path from 'path';

import { Record } from '../../common/db';
import { NodeDb } from '../server/res';
import { ROOT } from '../common/util';

// const root = path.join(__dirname, '../../../../');
// console.log('__dirname:', __dirname, 'root:', root);
const dbPath = path.join(ROOT, 'src/common/db.json');

export async function updateDb() {
    const db = new NodeDb(dbPath);
    await db.load();
    const anns = db.db.annotation;

    // const addTags = () => {
    //     anns.records.forEach((record: Record) => {
    //         record.notes.forEach((n) => {
    //             if (n.tags === undefined) {
    //                 n.tags = [];
    //             }
    //         });
    //     });
    //     db.save();
    // };
    //
    // const addPos = () => {
    //     anns.records.forEach((record: Record) => {
    //         record.notes.forEach((n) => {
    //             if (n.pos === undefined) {
    //                 n.pos = { top: 0, left: 0 };
    //             }
    //         });
    //     });
    //     db.save();
    // };

    const addDoc = () => {
        anns.records.forEach((record: Record) => {
            record.notes.forEach((n) => {
                if (n.doc === undefined) {
                    if (record.url.endsWith('.pdf')) {
                        console.log(`update pdf: ${record.url}`);
                        n.doc = 'pdf';
                    } else {
                        console.log(`update html: ${record.url}`);
                        n.doc = 'html';
                    }
                }
            });
        });
        db.save();
    };

    const updatePos = () => {
        anns.records.forEach((record: Record) => {
            record.notes.forEach((n) => {
                if (typeof n.pos === 'object') {
                    // @ts-ignore
                    n.pos = [n.pos];
                }
            });
        });
        db.save();
    };

    const statTags = () => {
        const tags = new Map<string, number>();
        anns.records.forEach((record: Record) => {
            record.notes.forEach((n) => {
                n.tags?.forEach((tag) => {
                    const count = tags.get(tag) || 0;
                    tags.set(tag, count + 1);
                });
            });
        });
        Array.from(tags.keys())
            .sort((a, b) => a.localeCompare(b))
            .forEach((key) => {
                console.log(`${key}: ${tags.get(key)}`);
            });
    };

    statTags();

    return {
        db,
    };
}
