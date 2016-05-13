// Render schedule  – An action invoked after recommend schedule action which takes the generated schedule 
// recommendation and formats it for use on a responsive web page rendered by PHP with Bootstrap for both 
// mobile devices or computer screens.

/*
npm install --save bluebird request@2.65.0

cd /home/vagrant/oscon/actions/js/schedule-render && \
npm run build && \
wsk action update schedule-render dist/bundle.js
*/

import { renderSchedule, updateTweet, invokeTweetUpdate } from './model';
import Promise from 'bluebird';

global.main = ( tweet ) => {
  renderSchedule(tweet)
  .then(tweet =>
    invokeTweetUpdate(tweet)
  ).then(result =>
    whisk.done({ payload: '[schedule-render.main]: ' + JSON.stringify(result) })
  ).catch(e =>
    whisk.done(e)
  );
  return whisk.async();
};