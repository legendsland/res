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
        <link rel="stylesheet" href="/res/dist/res/style.css" />
        <!-- Global site tag (gtag.js) - Google Analytics -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-WP965D476X"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'G-WP965D476X');
    </script>
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

