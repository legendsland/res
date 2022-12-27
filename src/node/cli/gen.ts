import {fromIgnoreFile} from './ignorefile';
import {Db} from '../../common/db';
import {ParsedPath} from 'path';
import * as path from 'path';

const fs = require('fs');

export async function createIndex() {
  const list = fromIgnoreFile();

  const config = {
    containerId: 'container',
    data: list
  };

  const db_ = await require('./db');
  const db: Db = db_.db;

  list.forEach((l: ParsedPath & {stars: number, note: number}) => {
    const url = encodeURI(path.join('/res/', l.dir, l.base));
    const notes = db.getAnn(url);
    let maxStars = 0;
    notes.forEach(n => {
      let stars = 0;
      for(let i=0; i<n.note.length; ++i) {
        if (n.note[i] === '⭐') {
          ++stars;
        }
      }
      maxStars = Math.max(maxStars, stars);
    });
    l.note = notes.length;
    l.stars = maxStars;
  })

  const config_json = JSON.stringify(config);

  const html = `
<!DOCTYPE html>
<html>
    <head>
        <meta charset="utf-8" />
        <title>Res</title>
        <link rel="stylesheet" href="/res/dist/res/style.css" />
    </head>
    <body>
    <div id="${config.containerId}"></div>
    <script>var res_config = ${config_json};</script>
    <script src="/res/dist/res/main.js"></script>
    </body>
</html>
`;

  console.log('index.html created');
  fs.writeFileSync('index.html', html);
}

