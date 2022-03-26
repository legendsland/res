import * as React from 'react';
import * as ReactDOM from 'react-dom';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import {createContext, useContext, useEffect, useState} from 'react';
import {post} from '../server/request';

const EditorJS = require('@editorjs/editorjs');

const EditorJSHeader = require('@editorjs/header');
const EditorJSList = require ('@editorjs/list');

const EDITOR_ID = 'notebook-editor-container';

interface Note {
    title: string,
    content: string,
}

interface Notebook {
    open: number,
    onOpen: (idx: number) => void,
    notes: Note[],
}

const NotebookContext = createContext({
    open: 0,
    onOpen: (idx: number) => {},
    notes: [],
});

const App = (props: any) => {

    const app: NotebookView = props.app;

    const [notebook, setNotebook] = useState({
        open: 0,
        onOpen: (idx: number) => {},
        notes: [],
    });

    // const [idx, setIdx] = useState(0);

    // get notelist from server
    useEffect(() => {

        post('/res', {
            method: 'notes',
            params: []
        }).then((notes: Note[]) => {
            setNotebook({
                open: 0,
                notes: notes,
                onOpen: (idx: number) => {
                    // setIdx(idx);
                    const note = notes[idx];
                    app.renderEditor(note.content);
                },
            });
        });
    }, []);

    return (
        <NotebookContext.Provider value={notebook}>
            <Grid container spacing={2}>
                <Grid item xs={4}>
                    <NoteListView/>
                </Grid>
                <Grid item xs={8}>
                    {/*<NoteView idx={idx}/>*/}
                    <div id={EDITOR_ID}/>
                </Grid>
            </Grid>
        </NotebookContext.Provider>
    );
}

const NoteListView = () => {

    const notebook: Notebook = useContext(NotebookContext);

    return (
        <List>
            {
                notebook.notes.map((note, index) => {
                    return (
                        <ListItem
                            onClick={() => {
                                notebook.onOpen(index);
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
    );
}

const NoteView = (props: any) => {
    const idx = props.idx;

    const notebook = useContext(NotebookContext);
    const note = notebook.notes[idx];
    const id = `note-${idx}`;

    return (
        <div>
            {
                notebook.notes.length === 0?
                    <div/>:
                    <div id={id}/>
            }
        </div>
    );
}

export class NotebookView {

    private editor;

    constructor(private id: string) {
        this.editor = new EditorJS({
            holder: EDITOR_ID,
            tools: {
                header: EditorJSHeader,
                list: EditorJSList
            },
        });

        ReactDOM.render(<App app={this}/>,
            document.getElementById(this.id));
    }

    renderEditor(content: string) {
        this.editor.render(JSON.parse(content));
    }
}
//
