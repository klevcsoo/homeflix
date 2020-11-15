export interface ITitleMetadata {
  poster: string;
  backdrop: string;
  rating: number;
  plot: string;
  releaseDate: number;
  explicit: boolean;
  imdbID: number;
}

export interface IFilmInfo {
  title: string;
  playablePath: string;
  progress: number;
  duration: number;
  metadata: ITitleMetadata;
  collection?: string;
}

export interface IShowInfo {
  title: string;
  metadata: ITitleMetadata;
  nextUp: [ number, number ];
  seasons: {
    playablePath: string;
    progress: number;
    duration: number;
  }[][];
}

export interface ILibrary {
  films: { [ id: string ]: IFilmInfo; };
  shows: { [ id: string ]: IShowInfo; };
  collections: {
    [ id: string ]: {
      name: string,
      films: string[];
    };
  };
}

export interface IServerConfig {
  mediaDirPath: string;
  subtitlesDirPath: string;
  publicDirPath: string;
  databasePath: string;
  port: number;
}
