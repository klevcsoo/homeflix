import React from 'react';
import AppFilmCard from '../../components/AppMediaCard/AppFilmCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useLibrary } from '../../utils/comms';

const CollectionCard = (props: {
  id: string;
}) => {
  const lib = useLibrary();
  const collection = lib?.collections[ props.id ];

  return !collection || !lib ? <LoadingSpinner /> : (
    <div className="collection-card">
      <h2>{ collection.name }</h2>
      <div>
        { collection.films.map((id, ix) => (
          <AppFilmCard { ...lib.films[ id ] } id={ id } key={ ix } grayOutWatched />
        )) }
      </div>
    </div>
  );
};

export default CollectionCard;
