

import * as express from "express";
import * as path from 'path';

export function startServer() {

    const app = express();
    const root = path.join(__dirname, '../../../../');

    const port = 3000
    app.use(express.static(root));

    app.get('/res', (req, res) => {
        res.sendFile('index.html', {root: root});
    })

    app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
    })

} 


