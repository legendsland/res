/********************************************************************************
 * Copyright (C) 2023 Zhangyi
 ********************************************************************************/

import {
    Autocomplete,
    Box,
    Button,
    TextField,
    FormControl,
} from '@mui/material';
import { createRoot } from 'react-dom/client';
import { useState, useEffect } from 'react';
import { post } from '../server/request';

interface Req {
    name: string,
}

const App = () => {
    const [name, setName] = useState('');
    const [options, setOptions] = useState([]);

    const onChange = (event:any, value: any) => {
        console.log(value);// s
        if (value !== undefined && value !== null) {
            setName(value.name);
        }
    };

    const submit = () => {
        post('/res', {
            method: name,
            params: [],
        }).then((data) => {
            // console.log(data);
        }).catch((error) => {
            console.log(error);
        });
    };

    useEffect(() => {
        post('/res', {
            method: 'reqlist',
            params: [],
        }).then((data) => {
            console.log(data);
            setOptions((data as Req[]).map((item: Req) => ({ ...item, label: item.name })));
        });
    }, []);

    return (

        <FormControl>
            {/* @ts-ignore */}
            <Autocomplete
                onChange={onChange}
                options={options as Req[]}
                getOptionLabel={(option: Req) => option.name}
                renderInput={(params) => (
                    <TextField
                        {...params}
                        type="text"
                        label="Requests"
                    />
                )}
                sx={{
                    width: 500,
                }}
            />

            <Button
                onClick={submit}
            >
                Submit
            </Button>

        </FormControl>

    );
};

export class Request {
    constructor(private containerId: string) {

    }

    create() {
        createRoot(document.querySelector(`#${this.containerId}`)).render(<App />);
    }
}
