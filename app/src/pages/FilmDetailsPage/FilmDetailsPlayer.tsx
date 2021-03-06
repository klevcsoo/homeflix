import React, { useCallback, useEffect, useRef } from 'react';
import './FilmDetailsPage.scss';
import { updateProgressOnFilm } from '../../utils/comms';
import { IFilmInfo } from '../../utils/interfaces';

const MediaDetailsPlayer = (props: IFilmInfo) => {
  const progress = useRef(props.progress);
  const setProgress = useCallback(() => {
    updateProgressOnFilm(props.id, progress.current);
  }, [ progress, props ]);

  useEffect(() => {
    return () => setProgress();
  }, [ props, setProgress ]);

  return (
    <video className="film-details-player" controls onTimeUpdate={ (event) => {
      progress.current = Math.round(event.currentTarget.currentTime);
    } } onLoadedMetadata={ (event) => {
      event.currentTarget.currentTime = progress.current;
    } } onPause={ () => setProgress() } poster={ props.metadata.backdrop }
      // @ts-ignore
      preload="none" controlsList="nodownload" type="video/mp4"
      src={ `http://${ window.location.hostname }:7800/media/${ props.id }` }
      crossOrigin="anonymus">
      <track label="English" kind="subtitles" srcLang="en"
        src={ `http://${ window.location.hostname }:7800/subtitles/${ props.id }.vtt` } />
    </video>
  );
};

export default MediaDetailsPlayer;
