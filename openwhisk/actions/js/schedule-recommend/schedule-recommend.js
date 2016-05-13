// Recommend schedule – An action invoked by the analyze tweet action. It takes the analyzed tweet information 
// and scores matches against the conference schedule that was saved by the update schedule action earlier to 
// find relevant sessions ordered by a per session confidence rating.

/*
npm install --save bluebird request@2.65.0
npm install --save array-intersection

cd /home/vagrant/oscon/actions/js/schedule-recommend && \
npm run build && \
wsk action update schedule-recommend dist/bundle.js
*/

import { recommendSchedule, updateTweet, invokeScheduleRender } from './model';
import Promise from 'bluebird';

global.main = ( tweet ) => {
  recommendSchedule(tweet)
  .then(tweet =>
    invokeScheduleRender(tweet)
  ).then(result =>
    whisk.done({ payload: '[schedule-recommend.main]: ' + JSON.stringify(result) })
  ).catch(e =>
    whisk.done(e)
  );
  return whisk.async();
};
