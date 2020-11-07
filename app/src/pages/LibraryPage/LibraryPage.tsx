import React from 'react';
import './LibraryPage.css';
import AppMediaCard from '../../components/AppMediaCard/AppMediaCard';
import { useLibrary } from '../../utils/comms';
import LoadingSpinner from '../../components/LoadingSpinner';

const LibraryPage = () => {
  const lib = useLibrary();
  const continueWatching = !lib ? null : Object.keys(lib.films).filter((id) => {
    const m = lib.films[ id ];
    return !!m.progress && m.progress !== m.duration ? id : null;
  });

  return !lib ? <LoadingSpinner /> : (
    <div>
      {continueWatching?.length === 0 ? null : (
        <React.Fragment>
          <h2 className="library-label">Continue watching</h2>
          <div className="library-continue-watching">
            { continueWatching?.map((id, ix) => (
              <AppMediaCard { ...lib.films[ id ] } id={ id } key={ ix } />
            )) }
          </div>
        </React.Fragment>
      ) }
      <div className="library-all-media">
        { Object.keys(lib.films).map((id, ix) => (
          <AppMediaCard { ...lib.films[ id ] } id={ id } key={ ix } grayOutWatched />
        )) }
      </div>
    </div>
  );
};

export default LibraryPage;
