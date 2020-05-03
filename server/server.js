import path from 'path';
import fs from 'fs';
import express from 'express';
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import { StaticRouter as Router } from 'react-router-dom';

import App from '../src/containers/App';

const PORT = 8080;
const app = express();

app.use(express.static('./build'));

app.get('/*', (req, res) => {
  const context = {};
  // eslint-disable-next-line no-shadow
  const app = ReactDOMServer.renderToString(
    <Router location={req.url} context={context}>
      <App />
    </Router>
  );

  const indexFile = path.resolve('./build/index.html');
  fs.readFile(indexFile, 'utf-8', (err, data) => {
    if (err) {
      // eslint-disable-next-line no-console
      console.error('Oh No! Something went wrong: ', err);
      return res.status(500).send('Oops, better luck next time!');
    }

    // eslint-disable-next-line no-param-reassign
    data = data.replace('<div id="root"></div>', `<div id="root">${app}</div>`);

    return res.send(data);
  });
});

app.listen(PORT, () => {
  console.log(`Server-Side Rendered application running on port ${PORT}`);
});
