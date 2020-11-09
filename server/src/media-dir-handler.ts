import fs from 'fs';
import path from 'path';
import { serverConfig } from './constants';
import { ITitleMetadata } from './interfaces';
import { execSync, spawn } from 'child_process';
import { generateMediaID, setLibrary } from './utils';

/**
 * Get the media files in the MEDIA DIRECTORY
 * specified in the server config
 */
export function getMediaFiles() {
  const files: [ string, string ][] = []; // absolutePath, filename
  fs.readdirSync(serverConfig.mediaDirPath).forEach((item) => {
    const a = path.resolve(serverConfig.mediaDirPath, item);
    if (fs.lstatSync(a).isDirectory()) {
      fs.readdirSync(a).forEach((file) => {
        const b = path.resolve(a, file);
        if (fs.lstatSync(b).isFile() && (file.endsWith('.mp4') || file.endsWith('.mkv'))) {
          files.push([ b, file ]);
        }
      });
    } else if ((item.endsWith('.mp4') || item.endsWith('.mkv'))) {
      files.push([ a, item ]);
    }
  });
  return files;
}

/**
 * Extracts the film title from a torrent media file
 * @param filename name of the media file that contains the film
 */
function formatFilename(filename: string): [ string, number ] {
  const a = filename.split('.');
  const ry = a.filter((v) => !!parseInt(v) && v.length === 4)[ 0 ];
  return [ a.slice(0, a.indexOf(ry)).join(' '), parseInt(ry) ];
}

/**
 * Get metadata info about a film
 * @param filename name of the media file that contains the film
 */
async function getTitleInfo(filename: string): Promise<[ ITitleMetadata, string ]> {
  const [ t, ry ] = formatFilename(filename);
  const info = await require('movie-info')(t, ry);
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

/**
 * Converts, extracts info from and adds media file to the library
 * @param mediaPath absolute path of the media file
 * @param mediaName name of the media file
 */
export async function addMediaFileToLibrary(mediaPath: string, mediaName: string) {
  const [ metadata, title ] = await getTitleInfo(mediaName);
  // const p = await convertToX264AACMP4(mediaPath, title);
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
