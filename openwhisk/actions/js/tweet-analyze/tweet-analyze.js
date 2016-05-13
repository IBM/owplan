// Analyze tweet – An action invoked by the insert tweet action. It tokenizes the supplied tweet keywords, 
// and enhances the context with information found in both the user’s Twitter profile and recent tweets 
// to help infer information about their conference session interests beyond just the explicit keywords.

/*
npm install --save bluebird request@2.65.0 twit

cd /home/vagrant/oscon/actions/js/tweet-analyze && \
npm run build && \
wsk action update tweet-analyze dist/bundle.js
*/

import { analyzeTweet, updateTweet, invokeScheduleRecommend } from './model';
import Promise from 'bluebird';

global.main = ( tweet ) => {
  analyzeTweet(tweet)
  .then(tweet =>
    invokeScheduleRecommend(tweet)
  ).then(result =>
    whisk.done({ payload: '[tweet-analyze.main]: ' + JSON.stringify(result) })
  ).catch(e =>
    whisk.done(e)
  );
  return whisk.async();
};
