import React, { useState } from 'react';
import './CollectionsPage.scss';
import AppButton from '../../components/AppButton/AppButton';
import AppInput from '../../components/AppInput/AppInput';
import LoadingSpinner from '../../components/LoadingSpinner';
import { addCollection, useLibrary } from '../../utils/comms';
import CollectionCard from './CollectionCard';

const CollectionsPage = () => {
  const collections = useLibrary()?.collections;
  const [ collection, setCollection ] = useState('');

  const ac = () => {
    if (!collection) return;
    addCollection(collection);
    setCollection('');
  };

  return !collections ? <LoadingSpinner /> : (
    <div className="collections-container">
      <div className="collections-add-popup">
        <AppInput placeholder="Collection name" text={ collection } onTextChanged={ setCollection }
          onSubmit={ ac } />
        <AppButton type="primary" text="Add new collection" onClick={ ac } />
      </div>
      {Object.keys(collections).map((id, ix) => (
        <CollectionCard id={ id } key={ ix } />
      )) }
    </div>
  );
};

export default CollectionsPage;
