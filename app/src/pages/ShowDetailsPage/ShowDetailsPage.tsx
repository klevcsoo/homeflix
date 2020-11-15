import React, { useEffect, useState } from 'react';
import './ShowDetailsPage.scss';
import { useParams } from 'react-router-dom';
import { useMediaDetails } from '../../utils/comms';
import { getShowActiveEpisode, getShowProgress } from '../../utils/functions';
import LoadingSpinner from '../../components/LoadingSpinner';
import { IShowInfo } from '../../utils/interfaces';
import ShowDetailsPlayer from './ShowDetailsPlayer';

const ShowDetailsPage = () => {
  const id = (useParams() as any).media_id;
  const media = useMediaDetails<IShowInfo>(id);
  const [ active, setActive ] = useState<[ number, number ]>();

  useEffect(() => {
    if (!!media) setActive(getShowActiveEpisode(getShowProgress(media.seasons)));
  }, [ media ]);

  return !media || !active ? <LoadingSpinner /> : (
    <React.Fragment>
      <div className="show-details-container">
        <div style={ {
          backgroundImage: `url(${ media.metadata.backdrop })`
        } } ></div>
        <div>
          <img src={ media.metadata.poster } alt="" />
          <h1>{ media.title }</h1>
          <p>{ media.metadata.plot }</p>
          <span style={ { height: 20 } }></span>
          <p><b>First aired: </b> { new Date(media.metadata.releaseDate).toLocaleDateString() }</p>
          <p><b>Number of seasons: </b> { media.seasons.length }</p>
        </div>
      </div>
      <div className="show-details-episode-roster">
        { media.seasons.map((s, si) => (
          <div className={ si === active[ 0 ] - 1 ? 'open' : '' } key={ si } onClick={ () => {
            setActive([ si + 1, 1 ]);
          } }>
            <h2>Season { si + 1 }</h2>
            <div><div style={ {
              width: `${ (getSeasonProgress(s)[ 0 ] / getSeasonProgress(s)[ 1 ]) * 100 }%`
            } }></div></div>
          </div>
        )) }
      </div>
      <div className="show-details-episode-roster">
        { media.seasons[ active[ 0 ] - 1 ].map((_, ei) => (
          <div className={ ei === active[ 1 ] - 1 ? 'open' : '' } key={ ei } onClick={ () => {
            setActive([ active[ 0 ], ei + 1 ]);
          } }>
            <h2>Episode { ei + 1 }</h2>
            <div><div style={ {
              width: `${ (media.seasons[ active[ 0 ] - 1 ][ ei ].progress / media.seasons[ active[ 0 ] - 1 ][ ei ].duration) * 100 }%`
            } }></div></div>
          </div>
        )) }
      </div>
      <ShowDetailsPlayer id={ id } backdrop={ media.metadata.backdrop }
        progress={ media.seasons[ active[ 0 ] - 1 ][ active[ 1 ] - 1 ].progress } season={ active[ 0 ] } episode={ active[ 1 ] } />
    </React.Fragment>
  );
};

const getSeasonProgress = (season: {
  playablePath: string;
  progress: number;
  duration: number;
}[]): [ number, number ] => {
  const tp: number = season.map((e) => e.progress).reduce((p, c) => p + c);
  const td: number = season.map((e) => e.duration).reduce((p, c) => p + c);
  return [ tp, td ];
};

export default ShowDetailsPage;
