import React, { useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import AppButton from '../components/AppButton/AppButton';
import { routes } from '../utils/constants';

const NotFoundPage = () => {
  const history = useHistory();

  useEffect(() => {
    const e = document.getElementsByClassName('app-navbar').item(0) as any;
    if (!!e) e.style.display = 'none';
    return () => { if (!!e) e.style.display = 'grid'; };
  }, []);

  return (
    <div style={ {
      width: '80vw',
      position: 'absolute',
      top: '50%', left: '50%',
      transform: 'translate(-50%, -50%)'
    } }>
      <h1 style={ {
        fontSize: 120,
        margin: 0,
        opacity: 0.5
      } }>404</h1>
      <h2 style={ {
        margin: '0 0 50px 0',
        fontWeight: 300
      } }>Page not found<span role="img" aria-label="sad face">😢</span></h2>
      <AppButton type="secondary" text="Back to the library" onClick={ () => {
        history.replace(routes.LIBRARY);
      } } />
    </div>
  );
};

export default NotFoundPage;
