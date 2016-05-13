// Insert tweet – An action invoked one or more times for asynchronous storage of the tweets collected 
// by the fetch tweet action. When @owplan receives several tweets during peak usage, this helps to 
// parallelize the load. It also ensures that there are no duplicates in the Cloudant database so that 
// a specific tweet is replied to only once.

/* 
npm install --save bluebird request@2.65.0

cd /home/vagrant/oscon/actions/js/tweet-insert && \
npm run build && \
wsk action update tweet-insert dist/bundle.js
*/

import { insertTweet, invokeTweetAnalyze } from './model';
import Promise from 'bluebird';

global.main = ( tweet ) => {
  insertTweet(tweet)
  .then(tweet =>
  	invokeTweetAnalyze(tweet)
  ).then(result =>
    whisk.done({ payload: '[tweet-insert.main]: ' + JSON.stringify(result) })
  ).catch(e =>
    whisk.done(e)
  );
  return whisk.async();
};
