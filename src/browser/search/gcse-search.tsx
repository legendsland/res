import * as $ from 'jquery';
import Select, {SelectChangeEvent} from '@mui/material/Select';
import {FormControl, InputLabel, MenuItem} from '@mui/material';
import {useState} from 'react';
import {createRoot} from 'react-dom/client';

enum SearchEngines {
    google = 'a47d2a20d46db4877',
    douban = '97c555b677d12465f',
    zhihu = 'a4690bf98adbc4c10'
}

const search_engine_container_id = "gcse-search-container";

function changeEngineScript(engine: SearchEngines) {
    $(`#${search_engine_container_id} iframe`).hide();
    $(`#gcse-${engine}`).show();
}

const App = (props: any) => {

    const [currentEngine, setCurrentEngine] = useState(SearchEngines.google);

    const handleChange = (event: SelectChangeEvent) => {
        const engine = event.target.value as SearchEngines;
        setCurrentEngine(engine);
        changeEngineScript(engine);
    }

    return <div>
        <FormControl fullWidth>
            <InputLabel id="search-engines-select-label">Search of</InputLabel>
            <Select
                labelId="search-engines-select-label"
                id="search-engines-select"
                value={currentEngine}
                label="Search Engine"
                onChange={handleChange}
            >
                <MenuItem value={SearchEngines.google}>Google</MenuItem>
                <MenuItem value={SearchEngines.douban}>Douban</MenuItem>
                <MenuItem value={SearchEngines.zhihu}>Zhihu</MenuItem>
            </Select>
        </FormControl>
    </div>
}

export class GcseSearch {

    constructor(
        private readonly elementId: string
    ) {
        changeEngineScript(SearchEngines.google);
        createRoot(document.getElementById(this.elementId)).render(<App/>);
    }
}
