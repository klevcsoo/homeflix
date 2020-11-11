import { useEffect, useState } from 'react';
import { IFilmInfo, ILibrary, IShowInfo } from './interfaces';

const serverUrl = `http://${ window.location.hostname }:7800`;

// ---------- CALLABLES ----------
export async function getLibrary() {
  return await fetch(`${ serverUrl }/media`).then((res) => {
    return res.json();
  }).then((j) => j.data) as ILibrary;
}

export async function getMediaInfo<MediaType = IFilmInfo | IShowInfo>(id: string) {
  return await fetch(`${ serverUrl }/media/${ id }/info`).then((res) => {
    return res.json();
  }).then((j) => j.data) as MediaType;
}

export async function syncLibrary() {
  await fetch(`${ serverUrl }/sync-library`);
}

export async function addCollection(name: string) {
  await fetch(`${ serverUrl }/collections?name=${ name }`, {
    method: 'POST'
  });
}

export async function addMediaToCollection(cid: string, mid: string) {
  await fetch(`${ serverUrl }/collections/${ cid }?id=${ mid }`, {
    method: 'POST'
  });
}

export async function updateProgressOnFilm(mid: string, progress: number) {
  await fetch(`${ serverUrl }/media/${ mid }?progress=${ progress }`, {
    method: 'POST'
  });
}
export async function updateProgressOnShow(mid: string, s: number, e: number, progress: number) {
  await fetch(`${ serverUrl }/media/${ mid }/${ s }/${ e }?progress=${ progress }`, {
    method: 'POST'
  });
}
// ---------- CALLABLES ----------

// ---------- HOOKS ----------
export function useLibrary() {
  const [ lib, setLib ] = useState<ILibrary>();
  useEffect(() => { getLibrary().then(setLib); }, []);
  return lib;
}

export function useMediaDetails<MediaType = IFilmInfo | IShowInfo>(id: string) {
  const [ media, setMedia ] = useState<MediaType>();
  useEffect(() => { getMediaInfo<MediaType>(id).then(setMedia); }, [ id ]);
  return media;
}
// ---------- HOOKS ----------
