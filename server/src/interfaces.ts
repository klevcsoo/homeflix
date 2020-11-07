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

export interface ILibrary {
  films: { [ id: string ]: IFilmInfo; };
  collections: {
    [ id: string ]: {
      name: string,
      films: string[];
    };
  };
}

export interface IServerConfig {
  mediaDirPath: string;
  publicDirPath: string;
  databasePath: string;
  port: number;
}
