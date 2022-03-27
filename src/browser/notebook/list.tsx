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
import {TextField} from '@mui/material';
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
    onOpen?: (idx: number) => void,
    onCreate?: () => void;
}

const defaultNotebook: Notebook = {
    open: 0,
    notes: [],
}

const NotebookContext = createContext(defaultNotebook);

const App = (props: any) => {

    const app: NotebookView = props.app;

    const [idx, setIdx] = useState(-1);

    // get notelist from server
    useEffect(() => {
        app.onGetNotes = (update: boolean) => {
            if (update) {
                setIdx(0);
            }
        }
    }, []);

    return (
        <Grid container spacing={2}>
            <Grid item xs={4}>
                <NoteListView app={app} idx={idx}/>
            </Grid>
            <Grid item xs={8}>
                {/*<NoteView idx={idx}/>*/}
                <div id={EDITOR_ID}/>
            </Grid>
        </Grid>
    );
}

const NoteListView = (props: any) => {
    const app: NotebookView = props.app;

    const [draftNotes, setDraftNotes] = useState([]);
    const [selected, setSelected] = useState(undefined);
    const [newDraftTitle, setNewDraftTitle] = useState('');

    const handleChange = (event: any) => {
        const title = event.target.value as string;
        setNewDraftTitle(title);
    }

    const selectNote = async (index: number, isDraft: boolean) => {
        console.log(`[${selected?.index}, ${selected?.isDraft}] -> [${index}, ${isDraft}]`);

        if ( selected !== undefined) {
            // not same note
            if (selected.index !== index || selected.isDraft !== isDraft) {

                // move away from new note
                if (selected.index === -1 && selected.isDraft) {
                    const content = await app.getContent();
                    // has content
                    if (content.blocks.length > 0) {
                        setDraftNotes([...draftNotes, {
                            title: newDraftTitle === '' ? 'Untitled' : newDraftTitle,
                            content: content
                        }]);
                        setNewDraftTitle('');
                        console.log(content);
                    }
                }

                // move into new note
                if (index === -1 && isDraft) {
                    app.clearEditor();
                }
            }
        }

        if (isDraft) {
            if (index !== -1) {
                app.renderEditorContent(draftNotes[index].content);
            }
        } else {
            app.renderEditor(index);
        }
        setSelected({index: index, isDraft: isDraft});
    }

    return (
        <List>
            <ListItem key='new-note'>
                <TextField
                    id="outlined-basic"
                    label="New Note"
                    variant="outlined"
                    placeholder='New Note'
                    value={newDraftTitle}
                    onChange={handleChange}
                    onFocus={() => selectNote(-1, true)}
                />
            </ListItem>
            {
                app.notebook.notes.map((note, index) => {
                    return (
                        <ListItem
                            key={'note-' + index}
                            onClick={() => {
                                selectNote(index, false);
                            }}
                        >
                            <ListItemButton>
                                <ListItemText primary={note.title}/>
                            </ListItemButton>
                        </ListItem>
                    )
                })
            }
            {
                draftNotes.map((note, index) => {
                    return (
                        <ListItem
                            key={'draft-' + index}
                            onClick={() => {
                                selectNote(index, true);
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
            onChange: (api: API, event: CustomEvent) => {
                console.log('Now I know that Editor\'s content changed!', event)
            }
        });

        ReactDOM.render(<App app={this}/>,
            document.getElementById(this.id));

        this.fetchNotes();
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

