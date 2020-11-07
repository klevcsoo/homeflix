import path from 'path';
import express, { json as requestJSON } from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { address as getLocalIP } from 'ip';
import { serverConfig } from './constants';
import { addMediaFileToLibrary, generateCollectionID, generateMediaID, getFilmInfo, getLibrary, getMediaFiles, printRequestInfo, updateLibrary } from './utils';

const app = express();
const httpServer = createServer(app);

app.use(cors());
app.use(requestJSON());
app.use(express.static(serverConfig.publicDirPath));

// Get full library
app.get('/media', (req, res) => {
  printRequestInfo(req);
  res.status(200).send({ data: getLibrary() });
});

// Refresh the media library, by syncing
// database with file system
app.get('/sync-library', async (req, res) => {
  printRequestInfo(req);
  const mp4s = getMediaFiles();
  const lib = getLibrary();

  for (let i = 0; i < mp4s.length; i++) {
    const [ absolutePath, filename ] = mp4s[ i ];

    let found = false;
    Object.keys(lib.films).forEach((id) => {
      if (lib.films[ id ].playablePath === absolutePath) found = true;
    });

    try {
      if (!found) await addMediaFileToLibrary(absolutePath, filename).then((title) => {
        console.log(`Added ${ title } to the database`);
      });
    } catch (e) {
      console.error(e);
      res.sendStatus(501);
      return;
    }
  }

  res.sendStatus(200);
});

// Get specific film from the library
app.get('/media/:media_id', (req, res) => {
  printRequestInfo(req);
  const info = getFilmInfo(req.params.media_id as string);
  if (!info) res.status(404).send('Media not found');
  else res.status(200).sendFile(info.playablePath);
});

// Update the progress on a specific media
app.post('/media/:media_id', (req, res) => {
  printRequestInfo(req);
  const id = req.params.media_id;
  const p = parseInt(req.query.progress as string);

  if (!getLibrary().films[ id ]) { res.status(404).send('Media not found'); return; }
  if (!p && p !== 0) { res.status(406).send('Progress format incorrect'); return; }

  const margin = 5; // percent
  updateLibrary((lib) => {
    const film = lib.films[ id ];
    if (p < film.duration * (margin / 100)) film.progress = 0;
    else if (p > film.duration * ((100 - margin) / 100)) film.progress = film.duration;
    else film.progress = p;
    return lib;
  });
  res.sendStatus(200);
});

// Get information about a specific media
app.get('/media/:media_id/info', (req, res) => {
  printRequestInfo(req);
  const id = req.params.media_id as string;
  const info = getFilmInfo(id);
  if (!info) res.status(404).send('Media not found');
  else res.status(200).send({ data: { id: id, ...info } });
});

// Get all collections
app.get('/collections', (req, res) => {
  printRequestInfo(req);
  res.status(200).send({ data: getLibrary().collections });
});

// Add new collection
app.post('/collections', (req, res) => {
  printRequestInfo(req);
  updateLibrary((lib) => {
    lib.collections[ generateCollectionID() ] = {
      name: req.query.name as string,
      films: []
    }; return lib;
  });

  res.sendStatus(200);
});

// Add media to collection
app.post('/collections/:collection_id', (req, res) => {
  printRequestInfo(req);
  const cid = req.params.collection_id;
  const mid = req.query.id;

  if (!getLibrary().collections[ cid ]) {
    res.status(404).send('Collection not found');
  } else if (!mid) {
    res.status(406).send('Media ID missing');
  } else {
    updateLibrary((lib) => {
      lib.collections[ cid ].films.push(mid as string);
      return lib;
    });
    res.sendStatus(200);
  }
});

// If the path is not found, respond with the index.html,
// perhaps the React router can resolve the path
app.get('*', (req, res) => {
  printRequestInfo(req);
  res.sendFile(path.resolve(serverConfig.publicDirPath, 'index.html'));
});

httpServer.listen(serverConfig.port, () => {
  console.log(`Listening to ${ getLocalIP() }:${ serverConfig.port }`);
});
