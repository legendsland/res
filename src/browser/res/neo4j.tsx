/********************************************************************************
 * Copyright (C) 2023 Zhangyi
 ********************************************************************************/

import { createRoot } from 'react-dom/client';

const App = () => (
    <div />
);

export class Neo4j {
    constructor(private containerId: string) {

    }

    create() {
        createRoot(document.querySelector(`#${this.containerId}`)).render(<App />);
    }
}
