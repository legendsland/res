import {fromIgnoreFile} from './ignorefile';

const fs = require('fs');

export function createIndex() {
  const list = fromIgnoreFile();

  const config = {
    containerId: 'container',
    data: list
  };
  const config_json = JSON.stringify(config);

  const html = `
<!DOCTYPE html>
<html>
    <head>
        <meta charset="utf-8" />
        <title>Res</title>
    </head>
    <body>
    <div id="${config.containerId}"></div>
    <script>var res_config = ${config_json};</script>
    <script src="dist/main.js"></script>
    </body>
</html>
`;

  console.log('index.html created');
  fs.writeFileSync('index.html', html);
}

