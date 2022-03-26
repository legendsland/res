const EditorJS = require('@editorjs/editorjs');

const Header = require('@editorjs/header');
const List = require ('@editorjs/list');

const editor = new EditorJS({
    /**
     * Id of Element that should contain the Editor
     */
    holder: 'notebook-editor-container',

    /**
     * Available Tools list.
     * Pass Tool's class or Settings object for each Tool you want to use
     */
    tools: {
        header: Header,
        list: List
    },
})


