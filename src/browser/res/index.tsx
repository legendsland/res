import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as $ from 'jquery';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListSubheader from '@mui/material/ListSubheader';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Button from '@mui/material/Button';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import Collapse from '@mui/material/Collapse';

import Link from '@mui/material/Link';
import {Toc} from './book';
import {addTextSelectHandle} from './context-menu';
import {Cli} from './cli';
import {Shortcuts} from './shortcuts';
import {CommandShortcut} from './command';
import {StatusBar} from './statusbar';
import {ColorPicker} from './color-picker';
import {BrowserDb} from './db';
import {Ann, Tooltip} from './annotation';
import {addGoogScript} from '../google-analytics';

const pagemap = require('pagemap');

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

type FilePath = { dir: string, base: string, stars: number, note: number };
interface Config {
    containerId: string,
    data: FilePath[]
}

const Category = (props: any) => {

    const category: {name: string, data: FilePath[]} = props.category;
    const categoeyLabel = `${category.name} (${category.data.length})`;
    const [open, setOpen] = React.useState(true);

    const handleClick = () => {
      setOpen(!open);
    };

    return (
        <List>
            <ListItemButton onClick={handleClick}>
                <ListItemText primary={categoeyLabel} />
                {open ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>
            <Collapse in={open} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                {
                    category.data
                        .sort((a, b) => {
                            return a.base.localeCompare(b.base);
                        })
                        .map(p => {
                            const url = `${p.dir}/${p.base}`;
                            return (
                                    <ListItemButton key={url} sx={{ pl: 4 }}>
                                        {/* <ListItemText primary={p.base} /> */}
                                        <Link href={url} target="_blank" rel="noopener">{p.base} {p.stars>=5?`⭐(${p.note})`:p.note?`📝(${p.note})`:''}</Link>
                                    </ListItemButton>
                            )
                        })
                }
                </List>
            </Collapse>

        </List>
    );
}

const App = (props: any) => {

    const config: FilePath[] = props.config;

    const grouped: Map<string, FilePath[]> = new Map();

    config.forEach(item => {
        // item: res/aaa/bbb/....
        const parts = item.dir.split('/');
        const category = parts[1];

        let files = grouped.get(category);
        const file = [{dir: item.dir, base: item.base, stars: item.stars, note: item.note}];
        if ( files === undefined) {
            grouped.set(category, file);
        } else {
            files.push({dir: item.dir, base: item.base, stars: item.stars, note: item.note});
        }
    });

    return (
        <List>
            {
                Array.from(grouped)
                    .sort(([name1, category1], [name2, category2]) => {
                        return name1.localeCompare(name2);
                    })
                    .map(([name, category]) => (
                        <Category
                            category={{name: name, data: category}}
                        >
                        </Category>
                ))
            }
        </List>
    );
}

(async () => {

    // append css
    $('head').append('<link href="/res/dist/assets/fontawesome/css/all.css" rel="stylesheet">')

    const db = new BrowserDb('../../common/db.json');
    await db.load();

    const cli = new Cli();

    const $body = $('body');

    // table of content, res/ index page
    //@ts-ignore
    if (window.res_config !== undefined) {
        //@ts-ignore
        const config: Config = window.res_config;

        ReactDOM.render(<App config={config.data}/>,
            document.querySelector(`#${config.containerId}`));
    }

    // readings
    // all scripts should be creating on-the-fly
    // do not modify html file directly, the only exception is dc.identifier
    else {
        // add right-click menu options
        $body
            .prepend('<div id="context-menu-container"></div>')
            .prepend('<canvas id="res-pagemap"></canvas>')
        ;
        // addTextSelectHandle('context-menu-container');

        // update minimap
        pagemap($('#res-pagemap')[0], {
            styles: {
                '.book-search-matched': 'rgba(255,0,0,1)',
            },
        });

        // add toc
        const toc = new Toc();
        toc.generate();

        // add status bar
        const sb = new StatusBar('res-statusbar');
        const cp = new ColorPicker('book-container', sb);

        const ann = new Ann(db);

        //register keypress listener
        const shortcuts = new Shortcuts();
        shortcuts.add(new CommandShortcut(cli));
        shortcuts.listen();

        // load google script
    }

    addGoogScript($body);

    //@ts-ignore
    global.x = cli;
})();
