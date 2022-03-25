import * as React from 'react';
import * as ReactDOM from 'react-dom';


const App = () => {
    return (
        <div></div>
    );
}


export class Neo4j {

    constructor(private containerId: string) {

    }

    create() {
        ReactDOM.render(<App/>, document.querySelector(`#${this.containerId}`));
    }
}
