import React from 'react';
import './AppMediaCard.css';
import { IShowInfo } from '../../utils/interfaces';
import { useHistory } from 'react-router-dom';
import { routes } from '../../utils/constants';

const AppShowCard = (props: IShowInfo & {
  grayOutWatched?: boolean;
  progressLabel?: boolean;
}) => {
  const history = useHistory();

  const ae = getActiveEpisode(props.seasons.map((s) => s.map((e) => {
    return e.progress === 0 ? 'none' : e.progress === e.duration ? 'watched' : 'active';
  }))); // Active episode
  const ws = ae === [ props.seasons.length, props.seasons.reverse()[ 0 ].length ]; // Watched show

  return (
    <div className={ `app-media-card show${ props.grayOutWatched && ws ? ' grayed-out' : '' }` }
      onClick={ () => {
        setTimeout(() => history.push(routes.SHOW_DETAILS.replace(':media_id', props.id)), 200);
      } }>
      {!props.progressLabel ? null : (
        <div><p>S{ ae[ 0 ] < 10 ? `0${ ae[ 0 ] }` : ae[ 0 ] } E{ ae[ 1 ] < 10 ? `0${ ae[ 1 ] }` : ae[ 1 ] }</p></div>
      ) }
      {/* Add fallback image to img element with the onError attribute*/ }
      <img src={ props.metadata.poster } alt="" />
      <h2>
        { props.title }<br />
        { ws ? <span>Watched</span> : null }
      </h2>
      {(() => {
        const info = props.seasons[ ae[ 0 ] - 1 ][ ae[ 1 ] - 1 ];
        if (!ws && ae !== [ 1, 1 ] && !!info.progress && info.progress !== info.duration) {
          return <div className="acrylic-transparent">
            <div style={ { width: `${ (info.progress / info.duration) * 100 }%` } }></div>
          </div>;
        } else return null;
      })() }
    </div>
  );
};

type EpisodeProgress = 'none' | 'active' | 'watched';

const getActiveEpisode = (seasons: EpisodeProgress[][]): [ number, number ] => {
  const activeEpisodeinSeasons: [ number, number | null ][] = [];

  for (let si in seasons) {
    if (seasons[ si ].every((e) => e === 'none')) { // Hasn't begun watching the season
      activeEpisodeinSeasons.push([ parseInt(si) + 1, 1 ]);
      continue;
    } else if (seasons[ si ].every((e) => e === 'watched')) { // Watched the entire season
      activeEpisodeinSeasons.push([ parseInt(si) + 1, null ]);
      continue;
    } else { // In the middle of watching the season
      const aei = Math.abs(seasons[ si ].reverse().findIndex((e) => e === 'active') - (seasons[ si ].length - 1));
      if (aei === -1) { // In the middle of the season, but not in the middle of an episode
        activeEpisodeinSeasons.push([ parseInt(si) + 1, seasons[ si ].findIndex((e) => e === 'none') + 1 ]);
      } else { // In the middle of the season, as well as an episode in that season
        activeEpisodeinSeasons.push([ parseInt(si) + 1, aei + 1 ]);
      }
    }
  }

  return activeEpisodeinSeasons.reverse().find(([ _, e ]) => !!e) as [ number, number ];
};

export default AppShowCard;
