import React from 'react';
import './AppMediaCard.scss';
import { IFilmInfo } from '../../utils/interfaces';
import { useHistory } from 'react-router-dom';
import { routes } from '../../utils/constants';
import { formatTime } from '../../utils/functions';

const AppFilmCard = (props: IFilmInfo & {
  grayOutWatched?: boolean;
  progressIndicator?: boolean;
}) => {
  const history = useHistory();

  return (
    <div className={ `app-media-card${ props.grayOutWatched && props.progress === props.duration ? ' grayed-out' : '' }` }
      onClick={ () => {
        setTimeout(() => history.push(routes.FILM_DETAILS.replace(':media_id', props.id)), 200);
      } }>
      {/* Add fallback image to img element with the onError attribute*/ }
      <img src={ props.metadata.poster } alt="" />
      <h2>
        { props.title }
        { props.progress === props.duration ? <span><br />Watched</span> : null }
        { props.progressIndicator ? <span><br />{ `${ formatTime(props.duration - props.progress) } left` }</span> : null }
      </h2>
      {!props.progressIndicator || !props.progress || props.progress === props.duration ? null : (
        <div>
          <div style={ { width: `${ (props.progress / props.duration) * 100 }%` } }></div>
        </div>
      ) }
    </div>
  );
};

export default AppFilmCard;
