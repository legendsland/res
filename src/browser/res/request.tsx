import * as React from 'react';
import * as ReactDOM from 'react-dom';

import {
    Autocomplete,
    Box,
    Button,
    TextField,
    FormControl,
} from '@mui/material';
import {post} from '../server/request';

interface Req {
    name: string,
}

const App = () => {

    const [name, setName] = React.useState('');
    const [options, setOptions] = React.useState([]);

    const onChange = (event:any, value: any) => {
        console.log(value);//s
        if (value !== undefined && value !== null) {
            setName(value.name);
        }
    };

    const submit = () => {
        post('/res', {
            method: name,
            params: [],
        }).then(data => {
            // console.log(data);
        }).catch(error => {
            console.log(error);
        });
    };

    React.useEffect(() => {

        post('/res', {
            method: 'reqlist',
            params: [],
        }).then(data => {
            console.log(data);
            setOptions((data as Req[]).map((item: Req) => {
                return {...item, label: item.name};
            }));
        });

    }, []);

    return (

        <FormControl
        >
            {/* @ts-ignore */}
            <Autocomplete
                onChange={onChange}
                options={options as Req[]}
                getOptionLabel={(option: Req) => option.name}
                renderInput={(params) =>
                    <TextField
                        {...params}
                        type='text'
                        label="Requests"
                    />
                }
                sx={{
                    width: 500
                }}
            >
            </Autocomplete>

            <Button
                onClick={submit}
            >
                Submit
            </Button>

        </FormControl>


    )

}

export class Request {

    constructor(private containerId: string) {

    }

    create() {
        ReactDOM.render(<App/>, document.querySelector(`#${this.containerId}`));
    }
}
