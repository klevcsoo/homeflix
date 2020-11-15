import React, { useCallback, useEffect, useRef } from 'react';
import './ShowDetailsPage.scss';
import { updateProgressOnShow } from '../../utils/comms';

const ShowDetailsPlayer = (props: {
  id: string;
  season: number;
  episode: number;
  progress: number;
  backdrop: string;
}) => {
  const progress = useRef(props.progress);
  const setProgress = useCallback(() => {
    if (!progress.current) return;
    updateProgressOnShow(props.id, props.season, props.episode, progress.current);
  }, [ progress, props ]);

  useEffect(() => {
    return () => setProgress();
  }, [ props, setProgress ]);

  return (
    <video className="film-details-player" controls onTimeUpdate={ (event) => {
      progress.current = Math.round(event.currentTarget.currentTime);
    } } onLoadedMetadata={ (event) => {
      event.currentTarget.currentTime = progress.current;
    } } onPause={ () => setProgress() } poster={ props.backdrop }
      // @ts-ignore
      preload="none" controlsList="nodownload" type="video/mp4"
      src={ `http://${ window.location.hostname }:7800/media/${ props.id }/${ props.season }/${ props.episode }` }>
    </video>
  );
};

export default ShowDetailsPlayer;
