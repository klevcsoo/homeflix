import React from 'react';
import './AppMediaCard.scss';
import { IFilmInfo } from '../../utils/interfaces';
import { useHistory } from 'react-router-dom';
import { routes } from '../../utils/constants';

const AppFilmCard = (props: IFilmInfo & { grayOutWatched?: boolean; }) => {
  const history = useHistory();

  return (
    <div className={ `app-media-card${ props.grayOutWatched && props.progress === props.duration ? ' grayed-out' : '' }` }
      onClick={ () => {
        setTimeout(() => history.push(routes.FILM_DETAILS.replace(':media_id', props.id)), 200);
      } }>
      {/* Add fallback image to img element with the onError attribute*/ }
      <img src={ props.metadata.poster } alt="" />
      <h2>
        { props.title }<br />
        { props.progress === props.duration ? <span>Watched</span> : null }
      </h2>
      {!props.progress || props.progress === props.duration ? null : (
        <div className="acrylic-transparent">
          <div style={ { width: `${ (props.progress / props.duration) * 100 }%` } }></div>
        </div>
      ) }
    </div>
  );
};

export default AppFilmCard;
