import React, { useEffect, useState } from 'react';
import './MediaDetails.css';
import { useParams } from 'react-router-dom';
import FAC from 'fast-average-color';
import AppButton from '../../components/AppButton/AppButton';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useMediaDetails } from '../../utils/comms';
import MediaDetailsPlayer from './MediaDetailsPlayer';
import { formatTime } from '../../utils/functions';

const MediaDetailsPage = () => {
  const id = (useParams() as any).media_id;
  const media = useMediaDetails(id);
  const [ backColour, setBackColour ] = useState<[ string, boolean ]>();

  useEffect(() => {
    if (!media) return;
    getBackdropColour(media.metadata.backdrop).then(setBackColour);
  }, [ media ]);

  return !media ? <LoadingSpinner /> : (
    <React.Fragment>
      <div className="media-details-container" style={ {
        backgroundColor: !backColour ? 'transparent' : backColour[ 0 ],
        color: !backColour ? 'var(--colour-text)' : backColour[ 1 ] ? 'white' : '#2c2c2e'
      } }>
        <img src={ media.metadata.poster } alt="" />
        <h1>{ media.title }</h1>
        <p>{ media.metadata.plot }</p>
        <span style={ { height: 20 } }></span>
        <p><b>Duration: </b>{ formatTime(media.duration) }</p>
        <p><b>Rating: </b> { media.metadata.rating } / 10</p>
        <p><b>Release date: </b> { new Date(media.metadata.releaseDate).toLocaleDateString() }</p>
        <AppButton type="primary" text="Add to collection" onClick={ () => { } } />
      </div>
      <MediaDetailsPlayer { ...media } />
    </React.Fragment>
  );
};

const getBackdropColour = async (url: string): Promise<[ string, boolean ]> => {
  const c = (await new FAC().getColorAsync(url));
  return [ c.hex, c.isDark ];
};

export default MediaDetailsPage;
