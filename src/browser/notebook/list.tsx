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

const EditorJS = require('@editorjs/editorjs');

const EditorJSHeader = require('@editorjs/header');
const EditorJSList = require ('@editorjs/list');

const EDITOR_ID = 'notebook-editor-container';

interface Note {
    title: string,
    content: any,
    draft?: boolean,
}

interface Notebook {
    open: number,
    notes: Note[],
}

const defaultNotebook: Notebook = {
    open: 0,
    notes: [],
}

const NotebookContext = createContext(defaultNotebook);

const App = (props: any) => {

    const app: NotebookView = props.app;

    const [idx, setIdx] = useState(undefined);

    // get notelist from server
    useEffect(() => {
        app.onGetNotes = (update: boolean) => {
            if (update) {
                setIdx(0);
            }
        }
    }, []);

    let title = '';
    const onSelectNote = async (index: number) => {
        if (idx !== index) {
            // save new note
            if (idx === -1) {
                const content = await app.getContent();
                // has content
                if (content.blocks.length > 0) {
                    app.addNote({title: title, content: content});
                    console.log(content);
                }
            }

            // update
            else {
                const title = app.notebook.notes[idx].title;
                const content = await app.getContent();
                // has content
                if (content.blocks.length > 0) {
                    app.updateNote(idx, {title: title, content: content});
                }
            }

            setIdx(index);
        }
    }

    const handleTitleChange = (index: number, newTitle: string) => {
        console.log(`update title: ${title} -> ${newTitle}`);
        title = newTitle;
        app.updateTitle(index, newTitle);
    }

    return (
        <Grid container spacing={2}>
            <Grid item xs={4}>
                <NoteListView app={app} idx={idx} onSelectNote={onSelectNote}/>
            </Grid>
            <Grid item xs={8}>
                <NoteView app={app} idx={idx} onTitleChanged={handleTitleChange}/>
            </Grid>
        </Grid>
    );
}

const NoteListView = (props: any) => {
    const app: NotebookView = props.app;

    const handleNewNote = () => {
        props.onSelectNote(-1);
    }

    const handleSelectNote = (index: number) => {
        props.onSelectNote(index);
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
                    app.notebook.notes.map((note, index) => {
                        return (
                            <ListItem
                                key={'note-' + index}
                                onClick={() => {
                                    handleSelectNote(index);
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
    const app: NotebookView = props.app;
    const index = props.idx;

    console.log(`index -> ${index}`);
    let title_ = (index !== undefined && index !== -1)?
        app.notebook.notes[index].title : 'Untitled';

    console.log(title_);

    const [title, setTitle] = useState(title_);

    if (index === -1) {
        app.clearEditor();
    } else if (index > -1) {
        app.renderEditor(index);
    }

    const handleChange = (event: any) => {
        const newTitle = event.target.value;
        setTitle(newTitle);
        title_ = newTitle;
        props.onTitleChanged(index, newTitle);
    }

    return (
        <Box>
            <TextField
                id="outlined-basic"
                variant="outlined"
                label="Title"
                placeholder="Untitled"
                value={title_}
                onChange={handleChange}
            />
            <div id={EDITOR_ID}/>
        </Box>
    );
}

export class NotebookView {

    private editor;
    private nb: Notebook;

    onGetNotes: (update: boolean) => any;

    constructor(private id: string) {
        this.nb = {
            open: 0,
            notes: []
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
                console.log('Now I know that Editor\'s content changed!', event)
            }
        });

        ReactDOM.render(<App app={this}/>,
            document.getElementById(this.id));
    }

    fetchNotes() {
        post('/res', {
            method: 'notes',
            params: []
        }).then((notes: Note[]) => {
            this.notebook = {
                open: 0,
                notes: notes.map((note => {return {
                    title: note.title,
                    content: JSON.parse(note.content)}})),
            };

            this?.onGetNotes(this.notebook.notes.length>0);
        });
    }

    get notebook() {
        return this.nb;
    }

    set notebook(notebook: Notebook) {
        this.nb = notebook;
    }

    updateNote(index: number, note: Note) {
        this.nb.notes[index] = note;
    }

    updateTitle(index: number, title: string) {
        this.nb.notes[index].title = title;
    }

    addNote(note: Note) {
        this.nb.notes.push(note);
    }

    renderEditor(index: number) {
        this.editor.render(this.nb.notes[index].content);
    }

    renderEditorContent(content: any) {
        this.editor.render(content);
    }

    clearEditor() {
        this.editor.clear();
    }

    getContent() {
        return this.editor.save()
    }
}

