// Reply tweet – An action invoked after update tweet processing is complete in order to respond to the user 
// on using the Twitter API and to provide a link to the recommended schedule. 

/*
npm install --save bluebird request@2.65.0 twit

cd /home/vagrant/oscon/actions/js/tweet-reply && \
npm run build && \
wsk action update tweet-reply dist/bundle.js
*/

import { replyTweet } from './model';

global.main = ( tweet ) => {
  replyTweet(tweet)
  .then(result =>
    whisk.done({ payload: '[tweet-reply.main]: ' + JSON.stringify(result) })
  ).catch(e =>
    whisk.done(e)
  );
  return whisk.async();
};
