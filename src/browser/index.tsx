import * as React from 'react';
import * as ReactDOM from 'react-dom';
import $ from 'jquery';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Button from '@mui/material/Button';
import Link from '@mui/material/Link';
import {Toc} from './book';
import { Nlp } from './nlp';

// check running in http server or opened in browser as local file.
function env(): string {
    const href = document.location.href;
    if (href.startsWith('file')) {
        return 'file';
    } else if (href.startsWith('http')) {
        return 'http';
    } else {
        return 'unknown';
    }
}

interface Config {
    containerId: string,
    data: [{ dir: string, base: string }]
}

// index
//@ts-ignore
if (window.res_config !== undefined) {
    //@ts-ignore
    const config: Config = window.res_config;

    const App = () => {
        return (
            <List>
                {
                    config.data
                        .sort((a, b) =>
                            a.base.localeCompare(b.base))
                        .map(p => {
                            const url = `${p.dir}/${p.base}`;
                            return (
                                <ListItem key={url} disablePadding>
                                    <ListItemButton>
                                        {/* <ListItemText primary={p.base} /> */}
                                        <Link href={url} target="_blank" rel="noopener">{p.base}</Link>
                                    </ListItemButton>
                                </ListItem>
                            )
                        })
                }
            </List>
        );
    }

    ReactDOM.render(<App/>, document.querySelector(`#${config.containerId}`));
}

// other
else {

    // create cotainers
    $('body').append('<div id="nlp-container"></div>');

    const toc = new Toc();
    toc.generate();

    const nlp = new Nlp('nlp-container');
    nlp.create();
}
