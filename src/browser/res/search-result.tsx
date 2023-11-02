/********************************************************************************
 * Copyright (C) 2023 Zhangyi
 ********************************************************************************/

import $ from 'jquery';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import { useState } from 'react';
import {
    Box, Collapse, ListItemText, Paper,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { unmountComponentAtNode } from 'react-dom';
import { createRoot } from 'react-dom/client';

const pagemap = require('pagemap');

export interface SearchResult {
    title: string,
    text: string;
    pos: number;
}

const CONTAINER_ID = 'book-search-results';
const CLOSE_ID = 'book-search-results-close-icon';

type SearchResultViewProps = {
    input: string,
    results: SearchResult[],
    mgr: SearchResultManager,
    spend: number,
}
const SearchResultView = ({
    input,
    results,
    mgr,
    spend,
}: SearchResultViewProps) => {
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
            />
            <div><span>{input}</span><span>&nbsp;</span>Results: {results.length} in {spend}ms</div>
            <List
                sx={{
                    textAlign: 'left',
                    overflowY: 'scroll',
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
                                {/* {expandedArray[index]? <ExpandLessOutlined /> : <ExpandMoreOutlined />} */}
                                {'['}{index + 1}{']'}<span>&nbsp;</span>
                                <ListItemText
                                    primaryTypographyProps={{ fontSize: '12px' }}
                                    primary={result.title}
                                />
                            </ListItem>
                            <Collapse
                                key={index}
                                in={expandedArray[index]}
                            >
                                <Box
                                    onClick={() => handleGoto(index)}
                                    sx={{
                                        fontSize: 10,
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
};

export class SearchResultManager {
    constructor(
        readonly dispose?: ()=>void,
    ) {
    }

    show(input: string, results: SearchResult[], spend: number) {
        const $container = $(`#${CONTAINER_ID}`);
        $container.remove(); // remove first
        $('body').append(`<div id="${CONTAINER_ID}"></div>`);
        createRoot($(`#${CONTAINER_ID}`)[0]).render(<SearchResultView
            input={input}
            results={results}
            mgr={this}
            spend={spend}
        />);
    }

    close() {
        this?.dispose();
        $(`#${CONTAINER_ID}`).remove();
    }
}
