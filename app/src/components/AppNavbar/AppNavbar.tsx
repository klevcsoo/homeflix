import React, { useState } from 'react';
import './AppNavbar.scss';
import { CollectionsRounded, RefreshRounded, SearchRounded, SettingsRounded } from '@material-ui/icons';
import { useHistory, useLocation } from 'react-router-dom';
import { routes } from '../../utils/constants';
import { syncLibrary } from '../../utils/comms';

const AppNavbar = () => {
  const history = useHistory();
  const path = useLocation().pathname;
  const [ refreshing, setRefreshing ] = useState(false);

  return (
    <div className="app-navbar acrylic-transparent">
      <h2 onClick={ () => {
        history.push(routes.HOME);
      } }>Homeflix</h2>
      <span className={ path === routes.SEARCH ? 'active' : '' } onClick={ () => {
        history.push(routes.SEARCH);
      } }><SearchRounded color="inherit" /></span>
      <span className={ path === routes.COLLECTIONS ? 'active' : '' } onClick={ () => {
        history.push(routes.COLLECTIONS);
      } }><CollectionsRounded color="inherit" /></span>
      <div className={ refreshing ? 'refreshing' : '' } onClick={ () => {
        setRefreshing(true);
        syncLibrary().then(() => window.location.reload()).finally(() => {
          setRefreshing(false);
        });
      } }><RefreshRounded color="inherit" /></div>
      <div className={ path === routes.SETTINGS ? 'active' : '' } onClick={ () => {
        history.push(routes.SETTINGS);
      } }><SettingsRounded color="inherit" /></div>
    </div>
  );
};

export default AppNavbar;
