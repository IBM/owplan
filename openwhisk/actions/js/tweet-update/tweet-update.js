// Update tweet – An action invoked after render schedule to persist the final schedule recommendation 
// to Cloudant for use by the web page and mark the request as complete.

/* 
npm install --save bluebird request@2.65.0 cloudant

cd /home/vagrant/oscon/actions/js/tweet-update && \
npm run build && \
wsk action update tweet-update dist/bundle.js
*/

import { invokeTweetReply, updateTweet } from './model';
import Promise from 'bluebird';

global.main = ( tweet ) => {
  updateTweet(tweet)
  .then(tweet =>
  	invokeTweetReply(tweet)
  ).then(result =>
    whisk.done({ payload: '[tweet-update.main]: ' + JSON.stringify(result) })
  ).catch(e =>
    whisk.done(e)
  );
  return whisk.async();
};
