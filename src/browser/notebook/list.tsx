import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import CheckIcon from '@mui/icons-material/Check';
import DeleteIcon from '@mui/icons-material/Delete';
import {createContext, forwardRef, useContext, useEffect, useRef, useState} from 'react';
import {post} from '../server/request';
import {Button, IconButton, TextField} from '@mui/material';
import {API} from '@editorjs/editorjs';
import {RunTune} from './block-tunes/run';
import {Graph} from './block/graph';
import {createRoot} from 'react-dom/client';
const { v4: uuidv4 } = require('uuid');

const EditorJS = require('@editorjs/editorjs');

const EditorJSHeader = require('@editorjs/header');
const EditorJSList = require ('@editorjs/list');

const EDITOR_ID = 'notebook-editor-container';
//
interface Note {
    id: string,
    title: string,
    content: any,
    dirty: boolean,
}

interface Notebook {
    opened: string | undefined,
    notes: Map<string, Note>,
}

const App = (props: any) => {
    const app: NotebookView = props.app;

    const [currentId, setCurrentId] = useState(undefined);
    const [currentTitle, setcurrentTitle] = useState('Untitled');
    const [notes, setNotes] = useState(new Map());

    app.onGetNotes = (id: string) => {
        console.log(`setCurrentId ${id}`);
        setNotes(new Map(app.notebook.notes));
        setCurrentId(id);
    };

    app.onNoteContentChange = async () => {
        // save new note
        if (currentId === '') {
            const content = await app.getContent();
            // has content
            if (content.blocks.length > 0) {
                const newId = uuidv4();
                app.addNote({
                    id: newId,
                    title: currentTitle,
                    content: content,
                    dirty: true
                });
                setCurrentId(newId);
            }
        }

        // update
        else {
            const currentNode = app.getNote(currentId);
            //TODO: only get updated content
            const content = await app.getContent();
            // has content
            if (content.blocks.length > 0) {
                app.updateNote({
                    id: currentNode.id,
                    title: currentNode.title,
                    content: content,
                    dirty: true
                });
            }
        }

        setNotes(new Map(app.notebook.notes));
    };

    app.onNoteUpdated = (id: string) => {
        setNotes(new Map(app.notebook.notes));
    }

    const onSelectNote = async (selectedId: string) => {
        console.log(`${currentId} -> ${selectedId}`);
        if (selectedId !== currentId) {
            setCurrentId(selectedId);
        }
    }

    const handleSaveNote = async (id: string) => {
        app.saveNote(id);
    }

    const handleDelete = async (id: string) => {
        app.deleteNote(id);
    }

    const handleChangedTitle = (newTitle: string) => {
        console.log(`update title: ${currentTitle} -> ${newTitle}`);
        app.updateTitle(currentId, newTitle);
        setcurrentTitle(newTitle);
        setNotes(new Map(app.notebook.notes));
    }

    return (
        <Grid container spacing={2}>
            <Grid item xs={4}>
                <NoteListView
                    app={app}
                    notes={notes}
                    selected={currentId}
                    onSelectNote={onSelectNote}
                    onSaveNote={handleSaveNote}
                    handleDelete={handleDelete}
                />
            </Grid>
            <Grid item xs={8}>
                <NoteView app={app} selected={currentId} onChangedTitle={handleChangedTitle}/>
            </Grid>
        </Grid>
    );
}

const NoteListView = (props: any) => {
    const {
        selected,
        onSelectNote,
        onSaveNote,
        handleDelete,
        notes
    } = props;

    const handleNewNote = () => {
        onSelectNote('');
    }

    const handleSelectNote = (id: string) => {
        onSelectNote(id);
    }

    const handleSave = (id: string) => {
        onSaveNote(id);
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
                    Array.from(notes).map(([id, note]) => {
                        return (
                            <ListItem
                                key={'note-' + note.id}
                                onClick={() => {
                                    handleSelectNote(note.id);
                                }}
                            >
                                <ListItemButton>
                                    <ListItemText primary={note.title}/>
                                </ListItemButton>
                                <IconButton
                                    onClick={() => handleDelete(note.id)}
                                >
                                    <DeleteIcon />
                                </IconButton>
                                {
                                    note.dirty?
                                        <IconButton
                                            onClick={() => handleSave(note.id)}
                                        >
                                            <CheckIcon />
                                        </IconButton>
                                        : <></>
                                }
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
    const [title, setTitle] = useState('Untitled');

    console.log(`show note ${props.selected}`)

    useEffect(() => {
        const selectedNote = app.getNote(props.selected);
        const title = selectedNote?.title;
        setTitle(title || 'Untitled');

        if (props.selected === undefined) {

        } else if (props.selected === '') {
            app.clearEditor();
        } else {
            app.renderNote(selectedNote);
        }

    }, [props.selected])

    const handleChange = (event: any) => {
        const newTitle = event.target.value;
        setTitle(newTitle);
        props.onChangedTitle(newTitle);
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
    onNoteContentChange: () => any;
    onNoteUpdated: (id: string) => any;

    constructor(private id: string) {
        this.nb = {
            opened: undefined,
            notes: new Map()
        };

        this.editor = new EditorJS({
            holder: EDITOR_ID,
            tools: {
                paragraph: {
                    tunes: ['rungraph'],
                },
                graph: Graph,
                header: EditorJSHeader,
                list: EditorJSList,
                rungraph: RunTune
            },//
            onReady: () => {
                this.fetchNotes();
            },
            onChange: (api: API, event: CustomEvent) => {
                console.log('!! content changed!', event)
                this?.onNoteContentChange();
            }
        });

        createRoot(document.getElementById(this.id)).render(<App app={this}/>);
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
                    content: JSON.parse(note.content),
                    dirty: false
                });
            });

            if (this.nb.opened !== undefined) {
                this?.onGetNotes(this.nb.opened);
            }
        });
    }

    saveNotes() {
        this.nb.notes.forEach((node: Note, id: string) => {
            this.saveNote(id);
        });
    }

    saveNote(id: string) {
        const n = this.nb.notes.get(id);
        if (n!==undefined && n.dirty) {
            post('/res', {
                method: 'saveNote',
                params: [n]
            }).then((id_: string) => {
                // success
                if (id_ === id) {
                    n.dirty = false;
                    this?.onNoteUpdated(id);
                }
            }).catch(err => {
                console.log(err);
            });
        }
    }

    deleteNote(id: string) {
        const n = this.nb.notes.get(id);
        if (n!==undefined) {
            post('/res', {
                method: 'deleteNote',
                params: [id]
            }).then((id_: string) => {
                // success
                if (id_ === id) {
                    this.nb.notes.delete(id);
                    this?.onNoteUpdated(id);
                }
            }).catch(err => {
                console.log(err);
            });
        }
    }

    getNote(id: string) {
        return this.nb.notes.get(id);
    }

    get notebook() {
        return this.nb;
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
            n.dirty = true;
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

