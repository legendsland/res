import * as $ from 'jquery';
import Select, {SelectChangeEvent} from '@mui/material/Select';
import {FormControl, InputLabel, MenuItem} from '@mui/material';
import {useState} from 'react';
import {createRoot} from 'react-dom/client';

const queryUrls = new Map<string, string>([
    ['douban', 'https://www.douban.com/search?cat=1001'],
    // ['cnki', 'https://kns.cnki.net']
    ['libz', 'https://en.kr1lib.org/s/'],
    ['libgen', 'https://libgen.is/search.php']
]);

const query_engine_container_id = "query-search-container";

function changeEngineScript(engine: string) {
    $(`#${query_engine_container_id} iframe`).hide();
    $(`#q-${engine}`).show();
}

const App = (props: any) => {

    const [currentEngine, setCurrentEngine] = useState('douban');

    const handleChange = (event: SelectChangeEvent) => {
        const engine = event.target.value as string;
        setCurrentEngine(engine);
        changeEngineScript(engine);
    }

    return <div>
        <FormControl fullWidth>
            <InputLabel>Search of</InputLabel>
            <Select
                labelId="query-engines-select-label"
                id="query-engines-select"
                value={currentEngine}
                label="Query Engine"
                onChange={handleChange}
            >
                {
                    Array.from(queryUrls).map(([site, url]) => (
                        <MenuItem value={site}>{site}</MenuItem>
                    ))
                }
            </Select>
        </FormControl>
    </div>
}

export class QuerySearch {

    constructor(
        private readonly elementId: string
    ) {
        const $container = $(`#${query_engine_container_id}`);
        queryUrls.forEach((url, key) => {
            $container.append(`<iframe id="q-${key}" src="${url}"></iframe>`);
        });

        changeEngineScript('douban');
        createRoot(document.getElementById(this.elementId)).render(<App/>);
    }
}
