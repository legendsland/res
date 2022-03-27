import * as React from 'react';
import * as ReactDOM from 'react-dom';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import {createContext, forwardRef, useContext, useEffect, useRef, useState} from 'react';
import {post} from '../server/request';
import {Button, TextField} from '@mui/material';
import {API} from '@editorjs/editorjs';
const { v4: uuidv4 } = require('uuid');

const EditorJS = require('@editorjs/editorjs');

const EditorJSHeader = require('@editorjs/header');
const EditorJSList = require ('@editorjs/list');

const EDITOR_ID = 'notebook-editor-container';

interface Note {
    id: string,
    title: string,
    content: any,
    draft?: boolean,
}

interface Notebook {
    opened: string | undefined,
    notes: Map<string, Note>,
}

const App = (props: any) => {

    const app: NotebookView = props.app;

    const [currentId, setCurrentId] = useState(undefined);

    // get notelist from server
    useEffect(() => {
        app.onGetNotes = (id: string) => {
            console.log(`setCurrentId ${id}`);
            setCurrentId(id);
        }
    }, []);

    let title = 'xxxxx';
    const onSelectNote = async (selectedId: string) => {
        console.log(`${currentId} -> ${selectedId}`);

        if (selectedId !== currentId) {
            // save new note
            if (currentId === '') {
                const content = await app.getContent();
                // has content
                if (content.blocks.length > 0) {
                    app.addNote({
                        id: uuidv4(),
                        title: title,
                        content: content});
                    console.log(content);
                }
            }

            // update
            else {
                const currentNode = app.getNote(currentId);
                const content = await app.getContent();
                // has content
                if (content.blocks.length > 0) {
                    app.updateNote({
                        id: currentNode.id,
                        title: currentNode.title,
                        content: content
                    });
                }
            }

            setCurrentId(selectedId);
        }
    }

    const handleTitleChange = (newTitle: string) => {
        console.log(`update title: ${title} -> ${newTitle}`);
        title = newTitle;
        app.updateTitle(currentId, newTitle);
    }

    return (
        <Grid container spacing={2}>
            <Grid item xs={4}>
                <NoteListView app={app} selected={currentId} onSelectNote={onSelectNote}/>
            </Grid>
            <Grid item xs={8}>
                <NoteView app={app} selected={currentId} onTitleChanged={handleTitleChange}/>
            </Grid>
        </Grid>
    );
}

const NoteListView = (props: any) => {
    const app: NotebookView = props.app;

    console.log(`NoteListView`);

    const handleNewNote = () => {
        props.onSelectNote('');
    }

    const handleSelectNote = (id: string) => {
        props.onSelectNote(id);
    }

    return (
        <Box>
            <Button
                variant="contained"
                onClick={handleNewNote}
            >
                New Note
            </Button>
            <List>
                {
                    Array.from(app.notebook.notes).map(([id, note]) => {
                        return (
                            <ListItem
                                key={'note-' + id}
                                onClick={() => {
                                    handleSelectNote(id);
                                }}
                            >
                                <ListItemButton>
                                    <ListItemText primary={note.title}/>
                                </ListItemButton>
                            </ListItem>
                        )
                    })
                }
            </List>
        </Box>
    );
}

const NoteView = (props: any) => {
    const app = props.app;
    const selectedNote = app.getNote(props.selected);

    const [title, setTitle] = useState('Untitled');


    useEffect(() => {
        const selectedNote = app.getNote(props.selected);
        const title = selectedNote?.title;
        setTitle(title || 'Untitled');

    }, [props.selected])

    console.log(`show note ${props.selected}`)

    if (props.selected === undefined) {

    } else if (props.selected === '') {
        app.clearEditor();
    } else {
        app.renderNote(selectedNote);
    }

    const handleChange = (event: any) => {
        const newTitle = event.target.value;
        setTitle(newTitle);
        app.updateTitle(selectedNote?.id, newTitle);
    }

    return (
        <Box>
            <TextField
                id="outlined-basic"
                variant="outlined"
                label="Title"
                placeholder="Untitled"
                value={title}
                onChange={handleChange}
            />
            <div id={EDITOR_ID}/>
        </Box>
    );
}

export class NotebookView {

    private editor;
    private nb: Notebook;

    onGetNotes: (id: string) => any;

    constructor(private id: string) {
        this.nb = {
            opened: undefined,
            notes: new Map()
        };

        this.editor = new EditorJS({
            holder: EDITOR_ID,
            tools: {
                header: EditorJSHeader,
                list: EditorJSList
            },
            onReady: () => {
                this.fetchNotes();
            },
            onChange: (api: API, event: CustomEvent) => {
                console.log('!! content changed!', event)
            }
        });

        ReactDOM.render(<App app={this}/>,
            document.getElementById(this.id));
    }
//
    fetchNotes() {
        post('/res', {
            method: 'notes',
            params: []
        }).then((notes: Note[]) => {
            let isFirst = true;
            notes.forEach(note => {
                if (isFirst) {
                    this.nb.opened = note.id;
                    isFirst = false;
                }
                this.nb.notes.set(note.id, {
                    id: note.id,
                    title: note.title,
                    content: JSON.parse(note.content)
                });
            });

            if (this.nb.opened !== undefined) {
                this?.onGetNotes(this.nb.opened);
            }
        });
    }

    getNote(id: string) {
        return this.nb.notes.get(id);
    }

    get notebook() {
        return this.nb;
    }

    set notebook(notebook: Notebook) {
        this.nb = notebook;
    }

    updateNote(note: Note) {
        const n = this.nb.notes.get(note.id);
        if (n!==undefined) {
            this.nb.notes.set(n.id, note);
        }
    }

    updateTitle(id: string, title: string) {
        const n = this.nb.notes.get(id);
        if (n!==undefined) {
            n.title = title;
        }
    }

    addNote(note: Note) {
        const n = this.nb.notes.get(note.id);
        if (n === undefined && note.id !== undefined) {
            this.nb.notes.set(note.id, note);
        }
    }

    renderEditor(id: string) {
        const n = this.nb.notes.get(id);
        if (n!==undefined) {
            this.editor.render(n.content);
        }
    }

    renderNote(note: Note) {
        this.editor.render(note.content);
    }

    clearEditor() {
        this.editor.clear();
    }

    getContent() {
        return this.editor.save()
    }
}

