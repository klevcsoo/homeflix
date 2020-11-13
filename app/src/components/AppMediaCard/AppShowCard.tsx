import React from 'react';
import './AppMediaCard.css';
import { IShowInfo } from '../../utils/interfaces';
import { useHistory } from 'react-router-dom';
import { routes } from '../../utils/constants';
import { getShowActiveEpisode, getShowProgress } from '../../utils/functions';

const AppShowCard = (props: IShowInfo & {
  grayOutWatched?: boolean;
  progressLabel?: boolean;
}) => {
  const history = useHistory();

  const ae = getShowActiveEpisode(getShowProgress(props.seasons)); // Active episode
  const ws = ae === [ props.seasons.length, props.seasons.reverse()[ 0 ].length ]; // Watched show

  return (
    <div className={ `app-media-card show${ props.grayOutWatched && ws ? ' grayed-out' : '' }` }
      onClick={ () => {
        setTimeout(() => history.push(routes.SHOW_DETAILS.replace(':media_id', props.id)), 200);
      } }>
      {/* Add fallback image to img element with the onError attribute*/ }
      <img src={ props.metadata.poster } alt="" />
      <h2>
        { props.title }
        { ws ? <span><br />Watched</span> : null }
        { props.progressLabel ? <span>
          <br />S{ ae[ 0 ] < 10 ? `0${ ae[ 0 ] }` : ae[ 0 ] } E{ ae[ 1 ] < 10 ? `0${ ae[ 1 ] }` : ae[ 1 ] }
        </span> : null }
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

export default AppShowCard;
