import React from 'react';
import { CircularProgress } from '@material-ui/core';

const LoadingSpinner = () => {
  return (
    <div style={ {
      width: 40, height: 40,
      fill: 'black',
      margin: '5px auto',
      transform: 'scale(0.8)'
    } }>
      <CircularProgress color="inherit" />
    </div>
  );
};

export default LoadingSpinner;
