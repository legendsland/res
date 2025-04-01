import { ParsedPath } from 'path';
import * as path from 'path';
import { fromIgnoreFile } from './ignorefile';
import { NodeDb } from '../server/res';
import { Note } from '../../common/db';

const fs = require('fs');

const AverageNoteMargin = 1600;

type NoteState = {
    top: number,
    tags: number,
    isNode: boolean,
    hasComment: boolean,
}

// only for html
function calcReadingProgress(length: number, notes: NoteState[]) {
    if (length === Number.POSITIVE_INFINITY
        || length < 0
        || notes.length === 0) {
        return {
            progress: 0,
            understand: 0,
        };
    }

    // notes.forEach((n) => console.log(n.top));

    // filter invalid
    const _notes = notes.filter((note) => note.top < Number.MAX_SAFE_INTEGER);
    let tops = _notes.map((n) => n.top);

    // normalization
    const max = tops.reduce((a, b) => Math.max(a, b), -Infinity);
    const min = tops.reduce((a, b) => Math.min(a, b), Infinity);
    tops = tops.map((top) => (top - min) / (max - min));

    // const expect = tops.reduce((acc, cur) => acc + cur) / _notes.length;
    const start = 0;
    const distanceToStart = tops.reduce((prev, curr) => prev + Math.abs(curr - start), 0) / _notes.length;

    const end = 1;
    const distanceToEnd = tops.reduce((prev, curr) => prev + Math.abs(curr - end), 0) / _notes.length;

    // const done = 0.5 * (1 - distanceToStart) + 0.5 * (1 - distanceToEnd);
    const done = 1 - distanceToEnd;

    const averageQuality = _notes.reduce((prev, curr) => prev + (curr.tags > 0 ? 0 : -0.1)
            + (curr.isNode ? 0 : -0.2)
            + (curr.hasComment ? 0 : -0.1), _notes.length) / _notes.length;

    const shouldHaveNotes = Math.round(length / AverageNoteMargin);
    const percent = _notes.length / shouldHaveNotes;

    console.log(`notes: ${_notes.length}, percent: ${percent} (${shouldHaveNotes}/${length}), quality: ${averageQuality}, done: ${done}`);

    const progress = 0.5 * percent + 0.5 * done; // weighted
    return {
        progress,
        understand: averageQuality * progress,
    };
}

export async function createIndex() {
    const list = fromIgnoreFile();

    const config = {
        containerId: 'container',
        data: list,
    };

    const db_: { db: NodeDb } = await require('./db');
    const { db } = db_;

    list.forEach((l: ParsedPath & {
        stars: number,
        note: number,
        review: string,
        progress: number,
        understand: number,
    }) => {
        let notes: Note[] = [];
        let review = '';
        if (l.base?.endsWith('.html')) {
            const htmlUrl = encodeURI(path.join('/res/', l.dir, l.base));
            notes = db.getAnn(htmlUrl);
        }
        if (l.base?.endsWith('.pdf')) {
            const pdfUrl = encodeURI(path.join(`/res/pdf.html?pdf=${l.dir}`, l.base));
            notes = db.getAnn(pdfUrl);
        }
        let maxStars = 0;
        let start = 0;
        let end = Number.POSITIVE_INFINITY;
        const noteStats: NoteState[] = [];
        notes.forEach((n) => {
            const noteStat: NoteState = {
                top: 0,
                tags: 0,
                isNode: false,
                hasComment: false,
            };
            noteStat.top = n.pos[0]?.top || 0;
            noteStat.tags = n.tags?.length || 0;

            let stars = 0;
            if (n.note !== undefined && n.note.length > 0) {
                noteStat.hasComment = true;
            }
            if (n.tags?.includes('#N')) {
                noteStat.isNode = true;
            }
            if (n.tags?.includes('#R')) {
                // console.log(`add review ${n.note}`);
                start = n.pos[0].top;
                review = n.note;
                for (let i = 0; i < n.note.length; ++i) {
                    if (n.note[i] === '⭐') {
                        // debug
                        // console.log(l.base);
                        ++stars;
                    }
                }
            }
            if (n.tags?.includes('#F')) {
                end = n.pos[0].top;
            }
            maxStars = Math.max(maxStars, stars);
            noteStats.push(noteStat);
        });
        l.note = notes.length;
        l.stars = maxStars;
        l.review = review;
        const { progress, understand } = calcReadingProgress(end - start, noteStats);
        l.progress = progress;
        l.understand = understand;
    });

    const config_json = JSON.stringify(config);

    const html = `
<!DOCTYPE html>
<html>
    <head>
        <meta charset="utf-8" />
        <title>Res</title>
        <link rel="stylesheet" href="/res/dist/res/style.css" />
    </head>
    <body>
    <div id="${config.containerId}"></div>
    <script>var res_config = ${config_json};</script>
    <script src="/res/dist/res/main.js"></script>
    </body>
</html>
`;

    console.log('index.html created');
    fs.writeFileSync('index.html', html);
}
