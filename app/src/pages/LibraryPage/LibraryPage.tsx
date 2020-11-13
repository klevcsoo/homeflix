import React from 'react';
import './LibraryPage.css';
import AppFilmCard from '../../components/AppMediaCard/AppFilmCard';
import { useLibrary } from '../../utils/comms';
import LoadingSpinner from '../../components/LoadingSpinner';
import { ILibrary } from '../../utils/interfaces';
import AppShowCard from '../../components/AppMediaCard/AppShowCard';
import { getShowActiveEpisode, getShowProgress } from '../../utils/functions';

const LibraryPage = () => {
  const lib = useLibrary();
  const continueWatchingFilms = !lib ? null : Object.keys(lib.films).filter((id) => {
    const m = lib.films[ id ];
    return !!m.progress && m.progress !== m.duration ? id : null;
  });
  const continueWatchingShows = !lib ? null : Object.keys(lib.shows).filter((id) => {
    const show = lib.shows[ id ];
    const aei = getShowActiveEpisode(getShowProgress(show.seasons));
    const ae = show.seasons[ aei[ 0 ] - 1 ][ aei[ 1 ] - 1 ];
    return !!ae.progress && ae.progress !== ae.duration ? id : null;
  });

  return !lib ? <LoadingSpinner /> : (
    <div>
      {!continueWatchingFilms && !continueWatchingShows ? null : (
        <React.Fragment>
          <h2 className="library-label">Continue watching</h2>
          <div className="library-continue-watching">
            { continueWatchingFilms?.map((id, ix) => (
              <AppFilmCard { ...lib.films[ id ] } id={ id } key={ ix } />
            )) }
            { continueWatchingShows?.map((id, ix) => (
              <AppShowCard { ...lib.shows[ id ] } id={ id } key={ ix } progressLabel />
            )) }
          </div>
        </React.Fragment>
      ) }
      <div className="library-all-media">
        { [ ...Object.keys(lib.films), ...Object.keys(lib.shows) ].sort((a, b) => {
          return fromLibrary(lib, a).title.localeCompare(fromLibrary(lib, b).title);
        }).map((id, ix) => {
          if (isFilm(lib, id)) return <AppFilmCard { ...lib.films[ id ] } id={ id } key={ ix } grayOutWatched />;
          else return <AppShowCard { ...lib.shows[ id ] } id={ id } key={ ix } grayOutWatched />;
        }) }
      </div>
    </div>
  );
};

const fromLibrary = (lib: ILibrary, id: string) => {
  return !!lib.films[ id ] ? lib.films[ id ] : lib.shows[ id ];
};

const isFilm = (lib: ILibrary, id: string) => {
  return !!lib.films[ id ];
};

export default LibraryPage;
