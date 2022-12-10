/**
 * show a menu when text is selected on web page.
 */

import * as $ from 'jquery';
import * as React from 'react';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import * as ReactDOM from 'react-dom';
import {useEffect, useState} from 'react';
import {post} from '../server/request';


const ContextMenu = () => {

    const [selectedText, setSelectedText] = useState('');
    const [contextMenu, setContextMenu] = React.useState<{
        mouseX: number;
        mouseY: number;
    } | null>(null);

    const handleContextMenu = (event: MouseEvent) => {
        // event.preventDefault();
        const text = window.getSelection().toString();

        if (text !== '') {
            setSelectedText(text);
            setContextMenu(
                contextMenu === null
                    ? {
                        mouseX: event.clientX - 2,
                        mouseY: event.clientY - 4,
                    }
                    : // repeated contextmenu when it is already open closes it with Chrome 84 on Ubuntu
                      // Other native context menus might behave different.
                      // With this behavior we prevent contextmenu from the backdrop to re-locale existing context menus.
                    null,
            );
        }
    };

    const handleClose = () => {
        console.log('clsoe');
        setSelectedText('');
        setContextMenu(null);
    };

    const handleSave = () => {
        console.log('save: ' + selectedText);

        post('/res', {
           method: 'nlpSentence',
           params: [selectedText]
        });

        setSelectedText('');
        setContextMenu(null);
    };

    useEffect(() => {

        document.addEventListener('contextmenu', handleContextMenu);

    }, []);

    return (
        <Menu
            open={contextMenu !== null}
            onClose={handleClose}
            anchorReference="anchorPosition"
            anchorPosition={
                contextMenu !== null
                    ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
                    : undefined
            }
        >
            <MenuItem onClick={handleSave}>Save</MenuItem>
        </Menu>
    );
}

export function addTextSelectHandle(containerId: string) {

    ReactDOM.render(<ContextMenu/>, document.querySelector(`#${containerId}`));
}
