import path from 'path';
import express, { json as requestJSON } from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { address as getLocalIP } from 'ip';
import { serverConfig } from './constants';
import { addSubtitlestoFilm, generateCollectionID, getLibrary, printRequestInfo, setLibrary } from './utils';
import synchroniseMediaDir, { addFilmToLibrary, getMediaFiles } from './sync-media';

const app = express();
const httpServer = createServer(app);

app.use(cors());
app.use(requestJSON({ limit: '2mb' }));
app.use(express.static(serverConfig.publicDirPath));
app.use('/subtitles', express.static(serverConfig.subtitlesDirPath));

// Get full library
app.get('/media', (req, res) => {
  printRequestInfo(req);
  res.status(200).send({ data: getLibrary() });
});

// Refresh the media library, by syncing
// database with file system
app.get('/sync-library', (req, res) => {
  printRequestInfo(req);
  synchroniseMediaDir().then(() => {
    res.sendStatus(200);
  }).catch((err) => res.status(501).send(err));
});

// Get specific film from the library
app.get('/media/:media_id', (req, res) => {
  printRequestInfo(req);
  const info = getLibrary().films[ req.params.media_id as string ];
  if (!info) res.status(404).send('Media not found');
  else res.status(200).sendFile(info.playablePath);
});

// Get specific show from the library
app.get('/media/:media_id/:season/:episode', (req, res) => {
  printRequestInfo(req);
  const s = parseInt(req.params.season);
  const e = parseInt(req.params.episode);
  if (!s || !e) res.status(406).send('Invalid season or episode format');
  else {
    const info = getLibrary().shows[ req.params.media_id as string ];
    if (!info) res.status(404).send('Media not found');
    else res.status(200).sendFile(info.seasons[ s - 1 ][ e - 1 ].playablePath);
  }

});

// Update the progress on a specific film
app.post('/media/:media_id', (req, res) => {
  printRequestInfo(req);
  const id = req.params.media_id;
  const p = parseInt(req.query.progress as string);

  if (!getLibrary().films[ id ]) { res.status(404).send('Media not found'); return; }
  if (!p && p !== 0) { res.status(406).send('Progress format incorrect'); return; }

  const margin = 10; // percent
  setLibrary((lib) => {
    const film = lib.films[ id ];
    if (p < film.duration * (margin / 100)) film.progress = 0;
    else if (p > film.duration * ((100 - margin) / 100)) film.progress = film.duration;
    else film.progress = p;
    return lib;
  });
  res.sendStatus(200);
});

app.post('/media/:media_id/:season/:episode', (req, res) => {
  printRequestInfo(req);
  const id = req.params.media_id;
  const s = parseInt(req.params.season);
  const e = parseInt(req.params.episode);
  if (!s || !e) { res.status(406).send('Invalid season or episode format'); return; }

  const p = parseInt(req.query.progress as string);
  if (!getLibrary().shows[ id ]) { res.status(404).send('Media not found'); return; }
  if (!p && p !== 0) { res.status(406).send('Progress format incorrect'); return; }

  const margin = 10; // percent
  setLibrary((lib) => {
    const ep = lib.shows[ id ].seasons[ s - 1 ][ e - 1 ];
    if (p < ep.duration * (margin / 100)) ep.progress = 0;
    else if (p > ep.duration * ((100 - margin) / 100)) ep.progress = ep.duration;
    else ep.progress = p;
    return lib;
  });
  res.sendStatus(200);
});

// Get information about a specific media
app.get('/media/:media_id/info', (req, res) => {
  printRequestInfo(req);
  const id = req.params.media_id as string;
  const lib = getLibrary();
  const info = !!lib.films[ id ] ? lib.films[ id ] : lib.shows[ id ];
  if (!info) res.status(404).send('Media not found');
  else res.status(200).send({ data: { id: id, ...info } });
});

// Remove media from library
app.post('/media/:media_id/remove', (req, res) => {
  printRequestInfo(req);
  const id = req.params.media_id as string;
  setLibrary((lib) => {
    if (!!lib.films[ id ]) delete lib.films[ id ];
    else if (!!lib.shows[ id ]) delete lib.shows[ id ];
    else res.status(404).send('Media not found');
    return lib;
  });
  res.sendStatus(200);
});

// Add subtitles to film
app.post('/media/:media_id/subtitles', (req, res) => {
  printRequestInfo(req);
  const id = req.params.media_id as string;
  addSubtitlestoFilm(id, req.body.file);
  res.sendStatus(200);
});

// Get all collections
app.get('/collections', (req, res) => {
  printRequestInfo(req);
  res.status(200).send({ data: getLibrary().collections });
});

// Add new collection
app.post('/collections', (req, res) => {
  printRequestInfo(req);
  setLibrary((lib) => {
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
    setLibrary((lib) => {
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
