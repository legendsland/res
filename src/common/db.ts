/********************************************************************************
 * Copyright (C) 2023 Zhangyi
 ********************************************************************************/

export type Database = {
    annotation: Annotation
}

export type Note = {
    id: string | undefined,
    selected: string,
    selector: {
        path: string,
    }
    pos: {
        top: number,
        left: number,
    }
    note: string,
    tags: string[]
}

export type Record = {
    url: string; /* to file */
    notes: Note[]
}

export type Annotation = {
    records: Record[];
}

export type IndexedAnnotation = Map<string, Note[]>;

/**
 * this is just hand-made nonsql db. maybe it's better to use
 * some popular browser db, IndexedDB?
 */

export abstract class Db {
    protected db_: Database;

    protected anns: IndexedAnnotation = new Map<string, Note[]>();

    constructor(
        readonly dbPath: string,
    ) {
    }

    abstract load(): void;

    getAnn(url: string): Note[] {
        const notes = this.anns.get(url);
        return notes === undefined ? [] : notes;
    }

    updateAnn(url: string, note: Note) {
        const notes = this.anns.get(url);
        const idx = notes?.findIndex((n) => n.id === note.id);
        if (idx !== -1) {
            notes[idx] = note;
        }
    }

    updateAnnotationTag(url: string, id: string, tag: string) {
        const notes = this.anns.get(url);
        const n = notes?.find((n) => n.id === id);
        if (n !== undefined) {
            if (n.tags === undefined) {
                n.tags = [];
            }
            n.tags.push(tag);
        }
    }

    delAnnotationTag(url: string, id: string, idx: number) {
        const notes = this.anns.get(url);
        const n = notes?.find((n) => n.id === id);
        if (n !== undefined) {
            if (n.tags !== undefined) {
                n.tags.splice(idx, 1);
            }
        }
    }

    addAnnotation(url: string, note: Note) {
        const notes = this.anns.get(url);
        if (notes === undefined) {
            this.anns.set(url, [note]);
        } else {
            notes.push(note);
        }
    }

    delAnnotation(url: string, id: string) {
        const notes = this.anns.get(url);
        if (notes !== undefined) {
            const idx = notes.findIndex((n) => n.id === id);
            if (idx !== -1) {
                notes.splice(idx, 1);
            }
        }
    }

    toString() {
        this.db_.annotation.records = Array.from(this.anns).map(([url, notes]) => ({
            url,
            notes,
        }));
        return JSON.stringify(this.db_, undefined, 2);
    }

    annotation(): IndexedAnnotation {
        return this.anns;
    }

    get db() {
        return this.db_;
    }
}
