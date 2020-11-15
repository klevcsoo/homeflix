import React, { useEffect, useState } from 'react';
import './FilmDetailsPage.scss';
import { useHistory, useParams } from 'react-router-dom';
import AppButton from '../../components/AppButton/AppButton';
import LoadingSpinner from '../../components/LoadingSpinner';
import FilmDetailsPlayer from './FilmDetailsPlayer';
import { removeMediaFromLibrary, useMediaDetails } from '../../utils/comms';
import { formatTime, getBackdropColour } from '../../utils/functions';
import { IFilmInfo } from '../../utils/interfaces';
import { routes } from '../../utils/constants';
import FilmDetailsSubtitleUpload from './FilmDetailsSubtitleUpload';

const MediaDetailsPage = () => {
  const id = (useParams() as any).media_id;
  const history = useHistory();
  const media = useMediaDetails<IFilmInfo>(id);
  const [ backColour, setBackColour ] = useState<[ string, boolean ]>();
  const [ removeConfirm, setRemoveConfirm ] = useState(false);
  const [ removing, setRemoving ] = useState(false);

  useEffect(() => {
    if (!media) return;
    getBackdropColour(media.metadata.backdrop).then(setBackColour);
  }, [ media ]);

  useEffect(() => {
    if (removeConfirm) setTimeout(() => setRemoveConfirm(false), 3000);
  }, [ removeConfirm ]);

  return !media ? <LoadingSpinner /> : (
    <React.Fragment>
      <div className="film-details-container" style={ {
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
        <span style={ { height: 20 } }></span>
        <div>
          <AppButton type="secondary" text="Add to collection" onClick={ () => { } } />
          <FilmDetailsSubtitleUpload id={ id } />
          <AppButton type="warning" text={ removeConfirm ? 'Are you sure?' : 'Remove from library' }
            onClick={ () => {
              if (removeConfirm) removeMediaFromLibrary(id).then(() => {
                history.replace(routes.LIBRARY);
              }).catch((err) => console.error(err)).finally(() => {
                setRemoveConfirm(false); setRemoving(false);
              });
              else setRemoveConfirm(true);
            } } working={ removing } />
        </div>
      </div>
      <FilmDetailsPlayer { ...media } />
    </React.Fragment>
  );
};

export default MediaDetailsPage;
