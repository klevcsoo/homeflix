import React from 'react';
import { BrowserRouter, Switch, Route, Redirect } from 'react-router-dom';
import AppNavbar from './components/AppNavbar/AppNavbar';
import CollectionsPage from './pages/CollectionsPage/CollectionsPage';
import LibraryPage from './pages/LibraryPage/LibraryPage';
import MediaDetailsPage from './pages/MediaDetailsPage/MediaDetailsPage';
import NotFoundPage from './pages/NotFoundPage';
import { routes } from './utils/constants';

function App() {
  return (
    <BrowserRouter>
      <AppNavbar />
      <Switch>
        <Route exact path={ routes.HOME }><Redirect to={ routes.LIBRARY } /></Route>
        <Route exact path={ routes.LIBRARY } component={ LibraryPage } />
        <Route exact path={ routes.MEDIA_DETAILS } component={ MediaDetailsPage } />
        <Route exact path={ routes.COLLECTIONS } component={ CollectionsPage } />
        <Route path="*" component={ NotFoundPage } />
      </Switch>
    </BrowserRouter>
  );
}

export default App;
