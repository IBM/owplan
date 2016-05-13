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

// Use the Twitter API to respond to the user.
export function replyTweet(tweet) {
  console.log('[tweet-reply.replyTweet] replyTweet');
  console.log(tweet.id);
  console.log(tweet.handle);
  return new Promise((resolve, reject) => {
    twitter.post('statuses/update', { in_reply_to_status_id: tweet.id, status: '@' + tweet.handle + ' Here\'s your OSCON schedule: ' + tweet.schedule_link }, function (err, body, head) {
      if (err) {
        console.log('[tweet-reply.replyTweet] reject: ');
        console.log(err);
        reject(err);
      } else {
        console.log('[tweet-reply.replyTweet] resolve: ');
        resolve(body);
      }
    })
  });
};
