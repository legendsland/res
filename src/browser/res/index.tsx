/********************************************************************************
 * Copyright (C) 2023 Zhangyi
 ********************************************************************************/

import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import $ from 'jquery';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import Collapse from '@mui/material/Collapse';

import Link from '@mui/material/Link';
import * as React from 'react';
import { Toc } from './book';
import { Cli } from './cli';
import { Shortcuts } from './shortcuts';
import { CommandShortcut } from './command';
import { StatusBar } from './statusbar';
import { ColorPicker } from './color-picker';
import { BrowserDb } from './db';
import { Ann } from './annotation';
import { addGoogleScript } from '../google-analytics';
import { PDFView } from './pdf';
import { PDFAnn } from './pdf-annotation';

// check running in http server or opened in browser as local file.
function env(): string {
    const { href } = document.location;
    if (href.startsWith('file')) {
        return 'file';
    } if (href.startsWith('http')) {
        return 'http';
    }
    return 'unknown';
}

type FilePath = {
    dir: string,
    base: string,
    stars: number,
    note: number,
    review: string,
    percent: number,
    quality: number,
};
interface Config {
    containerId: string,
    data: FilePath[]
}

type CategoryProps = {
    category: {
        name: string,
        data: FilePath[],
    }
}
const Category = ({
    category,
}: CategoryProps) => {
    const categoeyLabel = `${category.name} (${category.data.length})`;
    const [open, setOpen] = useState(true);

    const handleClick = () => {
        setOpen(!open);
    };

    const handleOpen = (e: any, url: string) => {
        if (url.endsWith('.pdf')) {
            window.open(`/res/pdf.html?pdf=${url}`, '_blank');
            e.preventDefault();
            e.stopPropagation();
        }
    };

    const showReview = (id: string, _event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
        const tooltip = $(`#${id}`);
        // console.log(event.pageX, event.pageY);
        tooltip.show();
    };

    const hideReview = (id: string) => {
        const tooltip = $(`#${id}`);
        tooltip.hide();
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
                            .sort((a, b) => a.base.localeCompare(b.base))
                            .map((p, idx) => {
                                const url = `${p.dir}/${p.base}`;
                                const id = `res-index-tooltip-${category.name}-`;
                                return (
                                    <ListItemButton key={url} sx={{ pl: 4 }}>
                                        {/* <ListItemText primary={p.base} /> */}
                                        <Link
                                            href={url}
                                            target="_blank"
                                            rel="noopener"
                                            onClick={(e) => handleOpen(e, url)}
                                            onMouseEnter={(event) => showReview(id + idx, event)}
                                            onMouseLeave={() => hideReview(id + idx)}
                                        >
                                            {p.base}
                                        </Link>
                                        <span className="res-index-stat">
                                            {p.stars >= 5 ? `⭐(${p.note})`
                                                : p.review ? `📝(${p.note})` : p.note ? `(${p.note})` : ''}
                                        </span>
                                        <div
                                            className="res-index-progress-container"
                                        >
                                            <span
                                                className="res-index-progress-percent"
                                                title={`${(p.percent * 100).toFixed(1)}%`}
                                                style={{
                                                    width: p.percent * 100,
                                                }}
                                            />
                                            <span
                                                className="res-index-progress-quality"
                                                title={`${(p.quality * 100).toFixed(1)}%`}
                                                style={{
                                                    width: p.quality * 100,
                                                }}
                                            />
                                        </div>
                                        <div id={id + idx} className="res-index-tooltip">
                                            {p.review?.split('\n').map((line, idx) => (
                                                <p
                                                    key={idx}
                                                >{line}
                                                </p>
                                            ))}
                                        </div>
                                    </ListItemButton>
                                );
                            })
                    }
                </List>
            </Collapse>

        </List>
    );
};

type AppProps = {
    config: FilePath[],
}
const App = ({
    config,
}: AppProps) => {
    const grouped: Map<string, FilePath[]> = new Map();

    config.forEach((item) => {
        // item: res/aaa/bbb/....
        const parts = item.dir.split('/');
        const category = parts[1];

        const files = grouped.get(category);
        const file = [{
            dir: item.dir,
            base: item.base,
            stars: item.stars,
            note: item.note,
            review: item.review,
            percent: item.percent,
            quality: item.quality,
        }];
        if (files === undefined) {
            grouped.set(category, file);
        } else {
            files.push({
                dir: item.dir,
                base: item.base,
                stars: item.stars,
                note: item.note,
                review: item.review,
                percent: item.percent,
                quality: item.quality,
            });
        }
    });

    return (
        <List>
            {
                Array.from(grouped)
                    .sort(([name1], [name2]) => name1.localeCompare(name2))
                    .map(([name, category]) => (
                        <Category
                            key={name}
                            category={{ name, data: category }}
                        />
                    ))
            }
        </List>
    );
};

(async () => {
    // append css
    $('head').append('<link href="/res/dist/assets/fontawesome/css/all.css" rel="stylesheet">');

    const db = new BrowserDb('../../common/db.json');
    await db.load();

    const cli = new Cli();

    const $body = $('body');
    const url = new URL(window.location.href);
    const { pathname } = url;

    if (url.search.startsWith('?pdf=')) {
        const $pdf = $('#pdf-container');
        const idx = window.location.href.indexOf('pdf=');
        const pdfUrl = window.location.href.substring(idx + 4);
        console.log(pdfUrl);

        // check title
        const parts = window.location.href.split('/');
        const name = parts[parts.length - 1];
        window.document.title = decodeURI(name);

        createRoot($pdf[0])
            .render(
                <PDFView
                    url={pdfUrl}
                    onload={() => new PDFAnn('pdf-container', db, true)}
                />,
            );
    } else {
        // table of content, res/ index page
        // @ts-ignore
        if (window.res_config !== undefined) {
            // @ts-ignore
            const config: Config = window.res_config;

            createRoot(document.querySelector(`#${config.containerId}`))
                .render(<App config={config.data} />);
        }

        // readings
        // all scripts should be creating on-the-fly
        // do not modify html file directly, the only exception is dc.identifier
        else if (pathname.endsWith('.html')) {
            // add right-click menu options
            $body.prepend('<div id="context-menu-container"></div>');
            // addTextSelectHandle('context-menu-container');

            // add toc
            const toc = new Toc();
            try {
                toc.generate();
            } catch (e) {
                // stack overflow
            }

            // add status bar
            const sb = new StatusBar('res-statusbar');
            new ColorPicker('book-container', sb);
            new Ann('book-container', db);

            // register keypress listener
            const shortcuts = new Shortcuts();
            shortcuts.add(new CommandShortcut(cli));
            shortcuts.listen();

            // load google script
        } else {
            console.log(`cannot handle ${url.toString()}`);
        }
    }

    addGoogleScript($body.get()[0]);

    // @ts-ignore
    global.x = cli;
})();
