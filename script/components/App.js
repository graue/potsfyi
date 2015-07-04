"use strict";

import MainContentContainer from './MainContentContainer';
import Player from './Player';
import React from 'react';
import UIBar from './UIBar';

class App extends React.Component {
  render() {
    return (
      <div id="app">
        <UIBar />
        <MainContentContainer />
        <Player />
      </div>
    );
  }
}

export default App;
