// Fetch tweet – An action that is invoked when @owplan receives a mention by an attendee 
// who has tweeted at it with keywords. Twitter sends an email notification to an address 
// managed by SendGrid which in turn invokes the action via a call to the OpenWhisk HTTP API. 
// This causes the action to call the Twitter API to check the timeline for @owplan and 
// invokes the tweet insert action for each mention.

/* 
npm install --save bluebird request@2.65.0 twit

cd /home/vagrant/oscon/actions/js/tweet-fetch && \
npm run build && \
wsk action update tweet-fetch dist/bundle.js

wsk action invoke --blocking --result tweet-fetch (To test. Not invoked directly. SendGrid will do this via web/tweet.php.)
*/

import { fetchTweets, invokeTweetInsert } from './model';

global.main = () => {
  fetchTweets()
  .then(tweets =>
  	invokeTweetInsert(tweets)
  ).then(result =>
  	whisk.done({ payload: '[tweet-fetch.main]: ' + JSON.stringify(result) })
  ).catch(e =>
    whisk.done(e)
  );
  return whisk.async();
};
