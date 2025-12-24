import { ParsedPath } from 'path';
import * as path from 'path';
import { fromIgnoreFile } from './ignorefile';
import { NodeDb } from '../server/res';
import { Note } from '../../common/db';

import fs from 'fs';

const expectedAverageNoteDistance = 1600;
const expectedAverageNotePage = 1;

interface NoteState {
    pos: number;
    tags: number;
    isNode: boolean;
    hasComment: boolean;
}

function calcReadingProgressPdf(file: string, pages: number, notes: NoteState[]) {
    // console.log(`pdf: ${pages}`);
    if (pages === Number.POSITIVE_INFINITY || pages < 0 || notes.length === 0) {
        return {
            progress: 0,
            understand: 0,
        };
    }

    // notes.forEach((n) => console.log(n.top));

    // filter invalid
    const _notes = notes.filter((note) => note.pos < Number.MAX_SAFE_INTEGER);

    const shouldHaveNotes = Math.round(pages / expectedAverageNotePage);
    const percentNotes = _notes.length / shouldHaveNotes;

    const averageNoteQuality =
        _notes.reduce(
            (prev, curr) => prev + (curr.tags > 0 ? 0 : -0.1) + (curr.isNode ? 0 : -0.2) + (curr.hasComment ? 0 : -0.1),
            _notes.length,
        ) / _notes.length;

    // console.log(`notes: ${_notes.length}, percent: ${percentNotes} (${_notes.length}/${shouldHaveNotes}/${pages}), quality: ${averageNoteQuality} [${file}]`);

    // const progress = 0.5 * percentNotes + 0.5 * density; // weighted
    const progress = percentNotes;
    return {
        progress,
        understand: averageNoteQuality * progress,
    };
}

// only for html
function calcReadingProgress(file: string, pages: number, notes: NoteState[]) {
    if (pages === Number.POSITIVE_INFINITY || pages < 0 || notes.length === 0) {
        return {
            progress: 0,
            understand: 0,
        };
    }

    // notes.forEach((n) => console.log(n.top));

    // filter invalid
    const _notes = notes.filter((note) => note.pos < Number.MAX_SAFE_INTEGER);
    let tops = _notes.map((n) => n.pos);

    // normalization
    const max = tops.reduce((a, b) => Math.max(a, b), -Infinity);
    const min = tops.reduce((a, b) => Math.min(a, b), Infinity);

    tops = tops.map((top) => (top - min) / (max - min)).sort((a, b) => a - b);

    // const expect = tops.reduce((acc, cur) => acc + cur) / _notes.length;
    const start = 0;
    const averageDistanceToStart = tops.reduce((prev, curr) => prev + Math.abs(curr - start), 0) / _notes.length;

    const end = 1;
    const averageDistanceToEnd = tops.reduce((prev, curr) => prev + Math.abs(curr - end), 0) / _notes.length;

    // const done = 0.5 * (1 - distanceToStart) + 0.5 * (1 - distanceToEnd);

    // calculate evenness between notes
    const averageNoteDistance =
        tops.reduce(
                (prev, curr) => {
                    prev.push(curr - prev[prev.length - 1]);
                    return prev;
                },
                [0],
            )
            .reduce((prev, curr) => prev + curr, 0) *
        ((max - min) / _notes.length);

    const density = expectedAverageNoteDistance / averageNoteDistance;

    const averageNoteQuality =
        _notes.reduce(
            (prev, curr) => prev + (curr.tags > 0 ? 0 : -0.1) + (curr.isNode ? 0 : -0.2) + (curr.hasComment ? 0 : -0.1),
            _notes.length,
        ) / _notes.length;

    const shouldHaveNotes = Math.round(pages / expectedAverageNoteDistance);
    const percentNotes = _notes.length / shouldHaveNotes;

    // console.log(`notes: ${_notes.length}, percent: ${percentNotes} (${_notes.length}/${shouldHaveNotes}/${pages}), quality: ${averageNoteQuality} [${file}]`);

    // const progress = 0.5 * percentNotes + 0.5 * density; // weighted
    const progress = percentNotes;
    return {
        progress,
        understand: averageNoteQuality * progress,
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

    list.forEach(
        (
            l: ParsedPath & {
                stars: number;
                note: number;
                review: string;
                progress: number;
                understand: number;
                reading: boolean;
            },
        ) => {
            let notes: Note[] = [];
            let review = '';
            let isPDF = false;
            if (l.base?.endsWith('.html')) {
                const htmlUrl = encodeURI(path.join('/res/', l.dir, l.base));
                notes = db.getAnn(htmlUrl);
            }
            if (l.base?.endsWith('.pdf')) {
                const pdfUrl = encodeURI(path.join(`/res/pdf.html?pdf=${l.dir}`, l.base));
                notes = db.getAnn(pdfUrl);
                isPDF = true;
            }
            let maxStars = 0;
            let start = Number.NEGATIVE_INFINITY;
            let end = Number.POSITIVE_INFINITY;
            const startPage = Number.NEGATIVE_INFINITY;
            const endPage = Number.POSITIVE_INFINITY;
            const noteStats: NoteState[] = [];
            let reading = false;
            notes.forEach((n) => {
                const noteStat: NoteState = {
                    pos: 0,
                    tags: 0,
                    isNode: false,
                    hasComment: false,
                };
                noteStat.pos = isPDF ? n.pos[0].pageIndex : n.pos[0]?.top || 0;
                noteStat.tags = n.tags?.length || 0;

                let stars = 0;
                if (n.note !== undefined && n.note.length > 0) {
                    noteStat.hasComment = true;
                }
                // nodes in graph
                if (n.tags?.includes('#N')) {
                    noteStat.isNode = true;
                }
                // review
                if (n.tags?.includes('#R')) {
                    // console.log(`add review ${n.note}`);
                    start = isPDF ? n.pos[0].pageIndex : n.pos[0].top;
                    review = n.note;
                    for (let i = 0; i < n.note.length; ++i) {
                        if (n.note[i] === '⭐') {
                            // debug
                            // console.log(l.base);
                            ++stars;
                        }
                    }
                }
                // current reading
                if (n.tags?.includes('#!')) {
                    reading = true;
                }
                // final point
                if (n.tags?.includes('#F')) {
                    end = isPDF ? n.pos[0].pageIndex : n.pos[0].top;
                }
                maxStars = Math.max(maxStars, stars);
                noteStats.push(noteStat);
            });
            l.note = notes.length;
            l.stars = maxStars;
            l.review = review;
            const { progress, understand } = isPDF
                ? calcReadingProgressPdf(l.base, end - start, noteStats)
                : calcReadingProgress(l.base, end - start, noteStats);
            l.progress = progress;
            l.understand = understand;
            l.reading = reading;
        },
    );

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
