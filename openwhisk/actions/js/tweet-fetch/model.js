import Promise from 'bluebird';

var Twit = require('twit');
var config = require('./twitter-config.json');
var twitter = new Twit({
  consumer_key:         config.consumer_key,
  consumer_secret:      config.consumer_secret,
  access_token:         config.access_token,
  access_token_secret:  config.access_token_secret,
  timeout_ms:           config.timeout_ms
});

// When invoked, fetch the last 20 mentions from the Twitter API.
export function fetchTweets() {
  console.log(' ');
  console.log('[tweet-fetch.fetchTweets] fetchTweets');
  return new Promise((resolve, reject) => {
    twitter.get('statuses/mentions_timeline', { count: 20 }, function (err, body, head) {
      if (err) {
        console.log('[tweet-fetch.fetchTweets] reject: ');
        console.log(err);
        reject(err);
      } else {
        console.log('[tweet-fetch.fetchTweets] resolve: ');
        console.log(body.length);
        resolve(body);
      }
    })
  });
};

// For each of those most recent tweets, invoke the insert tweet action.
export function invokeTweetInsert(tweets) {
  console.log(" ");
  console.log("[tweet-fetch.invokeTweetInsert]");
  console.log(tweets.length);
  for (var i = 0; i < tweets.length; i++) {
      // TODO: Extract this from a JSON file.
      whisk.invoke({'name': '/user@example.org_space/tweet-insert', 'parameters': tweets[i] });
  }
  return { payload: 'done' };
};
