import path from 'path';
import fs from 'fs';
import { IServerConfig } from './interfaces';

const isDevEnv = process.env.NODE_ENV === 'development';
const configPath = path.resolve('../server-config.json');

const DEF_PUBLIC_DIR = isDevEnv ? path.resolve(__dirname, '../../app/build') : path.resolve(__dirname, './public');
const DEF_MEDIA_DIR = isDevEnv ? '/mnt/d/Homeflix' : path.resolve(__dirname, '../media');
const DEF_DATABASE_PATH = path.resolve(__dirname, '../index.json');

export const serverConfig: IServerConfig = fs.existsSync(configPath) ?
  JSON.parse(fs.readFileSync(configPath).toString()) as IServerConfig :
  {
    databasePath: DEF_DATABASE_PATH,
    mediaDirPath: DEF_MEDIA_DIR,
    publicDirPath: DEF_PUBLIC_DIR,
    port: 7800
  };
