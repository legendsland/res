import {createRoot} from 'react-dom/client';

const App = () => {
    return (
        <div></div>
    );
}


export class Neo4j {

    constructor(private containerId: string) {

    }

    create() {
        createRoot(document.querySelector(`#${this.containerId}`)).render(<App/>);
    }
}
