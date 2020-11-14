import { Request } from 'express';
import fs from 'fs';
import path from 'path';
import { Readable } from 'stream';
import { serverConfig } from './constants';
import { ILibrary } from './interfaces';

export function printRequestInfo(req: Request) {
  const d = new Date();
  const time = `${ d.getDate() }/${ d.getMonth() + 1 }/${ d.getFullYear() } ${ d.getHours() }:${ d.getMinutes() }:${ d.getSeconds() }`;
  const ip = req.connection.remoteAddress?.substring(req.connection.remoteAddress.lastIndexOf(':') + 1);
  console.log(`[REQUEST at ${ time }] ${ ip }: ${ req.method } -> ${ req.url }`);
}

function generateID(radix: number): string {
  const raw = Date.now().toString(radix) + Math.random().toString(radix).substring(2, 10);
  const id = raw.match(/.{1,4}/g);

  if (!id) throw new Error('Failed to generate media ID');
  else return id.join('-');
}

/**
 * Generated a new unique ID for a media
 */
export function generateMediaID() {
  return generateID(34);
}

/**
 * Generated a new unique ID for a collection
 */
export function generateCollectionID() {
  return generateID(28);
}

/**
 * Get the current media library
 */
export function getLibrary() {
  return JSON.parse(fs.readFileSync(serverConfig.databasePath).toString()) as ILibrary;
}

/**
 * Replace media library
 * @param updater function that takes the current library as the only argument and needs to return the updated library
 */
export function setLibrary(updater: (lib: ILibrary) => ILibrary) {
  const newLib = updater(getLibrary());
  fs.writeFileSync(serverConfig.databasePath, JSON.stringify(newLib));
}

/**
 * Adds a subtitle to a given film
 * @param mid media ID
 * @param content subtitle file
 */
export function addSubtitlestoFilm(mid: string, content: string) {
  const r = Readable.from(content.toString());
  const vtt: Readable = r.pipe(require('srt-to-vtt')());
  const w = fs.createWriteStream(path.resolve(serverConfig.subtitlesDirPath, `${ mid }.vtt`));
  vtt.pipe(w);
}
