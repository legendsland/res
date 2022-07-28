/**
 * Display text search result
 */

import * as $ from 'jquery';
import * as React from 'react';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import * as ReactDOM from 'react-dom';
import {useEffect, useState} from 'react';
import {Box, Collapse, Divider, ListItemText, Paper, Typography} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import {unmountComponentAtNode} from 'react-dom';

export interface SearchResult {
    title: string,
    text: string;
    pos: number;
}

const CONTAINER_ID = 'book-search-results';
const CLOSE_ID = 'book-search-results-close-icon';

const SearchResultView = (props: any) => {
    const input = props.input;
    const results: SearchResult[] = props.results;
    const mgr = props.mgr;

    const initExpandedArray: boolean[] = [];
    results.forEach(() => {
        initExpandedArray.push(true);
    });

    const [expandedArray, setExpandedArray] = useState(initExpandedArray);

    const handleExpand = (index: number) => {
        const newExpandedArray = [...expandedArray];
        newExpandedArray[index] = !expandedArray[index];
        setExpandedArray(newExpandedArray);
    };

    const handleClose = () => {
        console.log('SearchResultView handleClose')
        const $elem = $(`#${CONTAINER_ID}`);
        unmountComponentAtNode($elem[0]);
        mgr.close();
    };

    const handleGoto = (index: number) => {
        $(document).scrollTop(results[index].pos);
    };

    return (
        <Paper>
            <CloseIcon
                id={CLOSE_ID}
                onClick={handleClose}
            >
            </CloseIcon>
            <div><span>{input}</span><span>&nbsp;</span>results: {results.length}</div>
            <List
                sx={{
                    textAlign: 'left',
                    overflow: 'scroll',
                    height: '80vh',
                }}
            >
                {
                    results.map((result, index) => (
                        <div>
                            <ListItem
                                key={index}
                                // onClick={() => handleExpand(index)}
                            >
                                {/*{expandedArray[index]? <ExpandLessOutlined /> : <ExpandMoreOutlined />}*/}
                                {'['}{index+1}{']'}<span>&nbsp;</span>
                                <ListItemText
                                    primaryTypographyProps={{fontSize: '12px'}}
                                    primary={result.title}
                                >
                                </ListItemText>
                            </ListItem>
                            <Collapse
                                key={index}
                                in={expandedArray[index]}
                            >
                                <Box
                                    onClick={() => handleGoto(index)}
                                    sx={{
                                        fontSize: 10
                                    }}
                                >
                                    {result.text}
                                </Box>
                            </Collapse>
                        </div>
                    ))
                }
            </List>
        </Paper>
    );
}

export class SearchResultManager {

    constructor(
        readonly dispose?: ()=>void
    ) {
    }

    show(input: string, results: SearchResult[]) {
        const $container = $(`#${CONTAINER_ID}`);
        $container.remove(); // remove first
        $('body').append(`<div id="${CONTAINER_ID}"></div>`);
        ReactDOM.render(<SearchResultView
            input={input}
            results={results}
            mgr={this}
        />, $(`#${CONTAINER_ID}`)[0]);
    }

    close() {
        this?.dispose();
        $(`#${CONTAINER_ID}`).remove();
    }
}

//
// export function showSearchResults(input: string, results: SearchResult[]) {
//     closeSearchResults(); // remove first
//     $('body').append(`<div id="${CONTAINER_ID}"></div>`);
//     ReactDOM.render(<SearchResultView input={input} results={results}/>, $(`#${CONTAINER_ID}`)[0]);
// }
//
// export function closeSearchResults(dispose?: ()=>void) {
//     // $(`#${CLOSE_ID}`).trigger('click');
//     $(`#${CONTAINER_ID}`).remove();
// }
