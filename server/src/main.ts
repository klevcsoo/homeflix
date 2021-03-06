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
  if ((!s && s !== 0) || (!e && e !== 0)) res.status(406).send('Invalid season or episode format');
  else {
    const info = getLibrary().shows[ req.params.media_id as string ];
    if (!info) res.status(404).send('Media not found');
    else res.status(200).sendFile(info.seasons[ s ][ e ].playablePath);
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

// Update the progress on specific show
app.post('/media/:media_id/:season/:episode', (req, res) => {
  printRequestInfo(req);
  const id = req.params.media_id;
  const s = parseInt(req.params.season);
  const e = parseInt(req.params.episode);
  if ((!s && s !== 0) || (!e && e !== 0)) { res.status(406).send('Invalid season or episode format'); return; }

  const p = parseInt(req.query.progress as string);
  if (!getLibrary().shows[ id ]) { res.status(404).send('Media not found'); return; }
  if (!p && p !== 0) { res.status(406).send('Progress format incorrect'); return; }

  setLibrary((lib) => {
    const show = lib.shows[ id ];
    const season = show.seasons[ s ];
    const episode = season[ e ];

    if (p < episode.duration * 0.05) { // The progress is below 5%
      episode.progress = 0; show.nextUp = [ s, e ];
    } else if (p > episode.duration * 0.9) { // The progress is above 90%
      episode.progress = episode.duration;
      if (!!season[ e + 1 ]) { // This is another episode
        show.nextUp = [ s, e + 1 ];
      } else { // This is the end of the season
        if (!!show.seasons[ s + 1 ]) { // There is another season
          show.nextUp = [ s + 1, 0 ];
        } else { // There are no more seasons
          show.nextUp = [ 0, 0 ];
        }
      }
    }

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
