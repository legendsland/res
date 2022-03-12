import * as React from 'react';
import * as ReactDOM from 'react-dom';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Button from '@mui/material/Button';
import Link from '@mui/material/Link';

interface Config {
    containerId: string,
    data: [{ dir: string, base: string }]
}

//@ts-ignore
const config: Config = res_config;

function App() {
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
