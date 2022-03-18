
import * as express from "express";
import * as path from 'path';
import * as fs from 'fs';
import * as util from 'util';
import * as cheerio from "cheerio";
const nlp = require('compromise');

export function startServer() {

    const app = express();
    const root = path.join(__dirname, '../../../../../');

    const port = 3000
    app.use(express.static(root));

    app.get('/res', (req, res) => {
        res.sendFile('index.html', {root: root});
    });

    /**
     * nlp process
     */
    app.get('/res/nlp', async (req, res) => {
        
        cleanText(path.join(root, '/res/res/thinking/A Rulebook for Arguments.18.html'))
            .then((result) => {
                
                res.send(getVerbs(result));
            
            }).catch(() => res.send('error'));

    })

    app.listen(port, () => {
        console.log(`Example app listening on port ${port}`)
    });

} 


async function cleanText(path: string): Promise<string> {

    const readFile = util.promisify(fs.readFile);

    return new Promise((resolve, reject) => {
        readFile(path).then((data) => {
            const $ = cheerio.load(data.toString());
            const text = $('body').text();

            // do the clean


            resolve(text);
 
        }).catch((error) => {
            reject();
        })
    });

}

function getVerbs(text: string) {
    return nlp(text).verbs().out('array');
}
