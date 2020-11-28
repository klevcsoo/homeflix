import path from 'path';
import fs from 'fs';
import { IServerConfig } from './interfaces';

const isDevEnv = process.env.NODE_ENV === 'development';
const configPath = path.resolve('../server-config.json');

const DEF_PUBLIC_DIR = isDevEnv ? path.resolve(__dirname, '../../app/build') : path.resolve(__dirname, './public');
const DEF_MEDIA_DIR = isDevEnv ? '/mnt/d/Homeflix' : '/mnt/pi-storage1/homeflix/media';
const DEF_SUBTITLES_DIR = isDevEnv ? '/mnt/d/Homeflix/Subs' : '/mnt/pi-storage1/homeflix/subs';
const DEF_DATABASE_PATH = path.resolve(__dirname, '../index.json');

export const serverConfig: IServerConfig = fs.existsSync(configPath) ?
  JSON.parse(fs.readFileSync(configPath).toString()) as IServerConfig :
  {
    databasePath: DEF_DATABASE_PATH,
    mediaDirPath: DEF_MEDIA_DIR,
    subtitlesDirPath: DEF_SUBTITLES_DIR,
    publicDirPath: DEF_PUBLIC_DIR,
    port: 7800
  };

export const fanartKey = '54866c29d8011d283a87331372c86d06';
