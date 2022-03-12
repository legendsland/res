const fs = require('fs');
const path = require('path');
const { exec } = require("child_process");
var os = require('os');

function processLineByLine(ignore: string) {
  const list: any[] = [];

  const check_str = '## files below will be committed';
  let start = false;
  ignore.split(os.EOL).forEach(line => {
    if(!start && line === check_str ) {
      start = true;
      return;
    }

    if(start && line.trim() !== '') {
      const p = path.parse(line.substring(1));
      list.push(p);
    }
  })

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

  return html;
}

export function gen() {
  const html = processLineByLine(fs.readFileSync('.gitignore').toString());
  console.log('index.html created');
  fs.writeFileSync('index.html', html);
}
