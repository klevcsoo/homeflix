import fs from 'fs';
import path from 'path';
import got from 'got';
import { JSDOM } from 'jsdom';
import { parseStringPromise as xmlToJSON } from 'xml2js';
import { serverConfig } from './constants';
import { ITitleMetadata } from './interfaces';
import { execSync, spawn } from 'child_process';
import { generateMediaID, getLibrary, setLibrary } from './utils';
import { fanartKey } from './constants';

export default async function synchroniseMediaDir() {
  const currentLib = getLibrary();
  const mediaDir = getMediaFiles();
  const titles = Object.keys(mediaDir);

  for (let t of titles) {
    const isFilm = !!Object.values(currentLib.films).find((f) => f.playablePath === mediaDir[ t ]);
    const isShow = !!Object.values(currentLib.shows).find((s) => s.title === t);

    if (!isFilm && !isShow) {
      if (typeof (mediaDir[ t ]) === 'string') {
        console.log(`Adding ${ t } to the library as a film...`);
        await addFilmToLibrary(mediaDir[ t ] as string, t);
      } else {
        console.log(`Adding ${ t } to the library as a tv show...`);
        let paths: string[];
        if (typeof (Object.values(mediaDir[ t ])[ 0 ]) === 'string') {
          paths = Object.values(mediaDir[ t ]);
        } else {
          console.log('Multiple season shows are not yet supported');
          return;
        }

        await addShowToLibrary(paths, t);
      }
    }
  }
}

/**
 * Extracts the film title from a torrent media file
 * @param filename name of the media file that contains the film
 * @param extras should the return value contain the release year, season and episode
 * @param force if not enough info was found in file, should the original name be returned
 */
function formatFilename(filename: string, extras?: boolean, force?: boolean): string {
  const ry = filename.match(/\.[0-9]{4}\./g); // Release year
  const s = filename.match(/\.S[0-9]{2}/g); // Season
  const title = `${ !!ry ? filename.slice(0, filename.indexOf(ry[ 0 ])) : !!s ? filename.slice(0, filename.indexOf(s[ 0 ])) : ''
    }`.replace(/\./g, ' ');

  if (!title && force) return filename;
  if (!title && !force) return '';
  if (!extras) return title;

  const e = filename.match(/E[0-9]{2}\./g);
  const ryFormatted = !!ry ? ` (${ ry[ 0 ].replace(/\./g, '') })` : ' ';
  const sFormatted = !!s ? `Season ${ parseInt(s[ 0 ].replace(/\./g, '').replace('S', '')) } ` : '';
  const eFormatted = !!e ? `Episode ${ parseInt(e[ 0 ].replace(/\./g, '').replace('E', '')) }` : '';

  return `${ title }${ ryFormatted }${ sFormatted }${ eFormatted }`;
}


/**
 * Get the media files in the MEDIA DIRECTORY
 * specified in the server config
 */
export function getMediaFiles() {
  type DirType = {
    [ itemname: string ]: string | {
      [ itemname: string ]: string;
    } | {
      [ itemname: string ]: {
        [ itemname: string ]: string;
      };
    };
  };

  const endsWithOneOf = (input: string, endings: string[]) => {
    const a: boolean[] = [];
    for (let ending of endings) {
      if (input.endsWith(ending)) a.push(true);
      else a.push(false);
    }; for (let b of a) {
      if (b) return true;
    } return false;
  };

  let dir: DirType = {};

  fs.readdirSync(serverConfig.mediaDirPath).forEach((rootItemName) => {
    const rootItemPath = path.resolve(serverConfig.mediaDirPath, rootItemName);
    const rootItemInfo = fs.lstatSync(rootItemPath);
    const rootItemTitle = formatFilename(rootItemName);

    if (rootItemInfo.isDirectory()) {
      dir[ rootItemTitle ] = {};
      fs.readdirSync(rootItemPath).forEach((childItemName) => {
        const childItemPath = path.resolve(rootItemPath, childItemName);
        const childItemInfo = fs.lstatSync(childItemPath);
        const childItemTitle = formatFilename(childItemName, true);
        if (!childItemTitle) return;

        if (childItemInfo.isDirectory()) {
          (dir[ rootItemTitle ] as any)[ childItemTitle ] = {};
          fs.readdirSync(childItemPath).forEach((subChildItemName) => {
            const subChildItemPath = path.resolve(childItemPath, subChildItemName);
            const subChildItemInfo = fs.lstatSync(subChildItemPath);
            const subChildItemTitle = formatFilename(subChildItemName, true, true);

            if (subChildItemInfo.isFile() && endsWithOneOf(subChildItemName, [ '.mp4', '.mkv' ])) {
              ((dir[ rootItemTitle ] as any)[ childItemTitle ] as any)[ subChildItemTitle ] = subChildItemPath;
            }
          });
        }
        else if (childItemInfo.isFile() && endsWithOneOf(childItemName, [ '.mp4', '.mkv' ])) {
          (dir[ rootItemTitle ] as any)[ childItemTitle ] = childItemPath;
        }
      });
    }
    else if (rootItemInfo.isFile() && endsWithOneOf(rootItemName, [ '.mp4', '.mkv' ])) {
      dir[ rootItemTitle ] = rootItemPath;
    }
  });

  Object.values(dir).forEach((title, i) => {
    if (typeof (title) === 'object' && Object.values(title).length === 1) {
      const onlyValue = Object.values(title)[ 0 ];
      if (typeof (onlyValue) === 'string') {
        dir[ Object.keys(dir)[ i ] ] = onlyValue;
      }
    }
  });

  return dir;
}

/**
 * Converts, extracts info from and adds media file to the library
 * @param mediaPath absolute path of the media file
 * @param mediaName name of the media file
 */
export async function addFilmToLibrary(mediaPath: string, mediaName: string) {
  const [ metadata, title ] = await getFilmInfo(mediaName);
  const p = mediaPath;
  const d = getMediaDuration(p);
  setLibrary((lib) => {
    lib.films[ generateMediaID() ] = {
      playablePath: p,
      title: title,
      progress: 0,
      duration: d,
      metadata: metadata
    }; return lib;
  }); return title;
}

async function addShowToLibrary(mediaPaths: string[], mediaName: string) {
  const metadata = await getShowInfo(mediaName);
  setLibrary((lib) => {
    lib.shows[ generateMediaID() ] = {
      title: mediaName,
      metadata: metadata,
      nextUp: [ 0, 0 ],
      seasons: [ mediaPaths.map((p) => {
        return {
          playablePath: p,
          progress: 0,
          duration: getMediaDuration(p)
        };
      }) ]
    }; return lib;
  });
}

/**
 * Get metadata info about a film
 * @param filename name of the media file that contains the film
 */
async function getFilmInfo(title: string): Promise<[ ITitleMetadata, string ]> {
  const info = await require('movie-info')(title);
  return [ {
    backdrop: info.imageBase + info.backdrop_path,
    poster: info.imageBase + info.poster_path,
    explicit: info.adult,
    imdbID: info.id,
    plot: info.overview,
    rating: info.vote_average,
    releaseDate: new Date(info.release_date).getTime(),
  }, info.title as string ];
}

async function getShowInfo(title: string) {
  return new Promise<ITitleMetadata>((resolve, reject) => {
    if (!title) { reject('MISSING SHOW TITLE'); return; }
    console.log(`SHOW_TITLE=${ title }`);
    got(`https://www.imdb.com/search/title/?title=${ title }&title_type=tv_series,tv_miniseries`).then((res) => {
      const dom = new JSDOM(res.body);
      const url = dom.window.document.getElementsByClassName("lister list detail sub-list").item(0)?.querySelector("a")?.href;
      if (!url) { reject('ELEMENT NOT FOUND'); return; }

      const imdbID = url.substring(url.lastIndexOf('tt'), url.lastIndexOf('/'));
      console.log(`IMDB_ID=${ imdbID }`);

      got(`https://thetvdb.com/api/GetSeriesByRemoteID.php?imdbid=${ imdbID }`).then((res) => {
        xmlToJSON(res.body).then(({ Data }) => Data.Series[ 0 ]).then((data) => {
          const thetvDBID = data.id[ 0 ] as string;
          const fa = data.FirstAired[ 0 ] as string;
          const o = data.Overview[ 0 ] as string;
          console.log(`THETVDB_ID=${ thetvDBID }`);

          got(`http://webservice.fanart.tv/v3/tv/${ thetvDBID }?api_key=${ fanartKey }`).then((res) => JSON.parse(res.body)).then((res) => {
            resolve({
              releaseDate: new Date(fa).getTime(),
              plot: o,
              poster: res.tvposter[ 0 ].url as string,
              backdrop: res.showbackground[ 0 ].url as string,
              explicit: false,
              imdbID: 0,
              rating: 0
            });
          });
        });
      });
    });
  });
}

/**
 * Get the duration of media
 * @param mediaPath absolute path of the media file of which duration needs to be returned
 */
function getMediaDuration(mediaPath: string) {
  const command = execSync(`ffprobe -v error -show_entries format=duration -of \
  default=noprint_wrappers=1:nokey=1 ${ mediaPath }`);
  return Math.floor(parseInt(command.toString()));
}

/**
 * Converts to the H.264 video and the AAC audio codec
 * @param mediaPath absolute path of the media file to be converted
 * 
 * @alpha
 */
async function convertToX264AACMP4(mediaPath: string, title: string) {
  return new Promise<string>((resolve, reject) => {
    console.log(`[${ mediaPath }] Converting...`);
    const newPath = mediaPath.endsWith('.mp4') ? mediaPath.replace('.mp4', '.c.mp4') : mediaPath.replace('.mkv', '.c.mp4');
    spawn(`ffmpeg -i ${ mediaPath } -c:v libx264 ${ newPath }`).on('exit', () => {
      // fs.unlinkSync(mediaPath);
      console.log(`[${ title }] Convert complete`); resolve(newPath);
    }).on('error', (err) => reject(err));

  });
}
