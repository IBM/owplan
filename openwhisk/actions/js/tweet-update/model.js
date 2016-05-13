import Promise from 'bluebird';

var Cloudant = require('cloudant');
var config = require('./cloudant-config.json');
var cloudant = new Cloudant({
  account:  config.account, 
  password: config.password
});
var db = cloudant.db.use(config.db);

// Saves the rendered tweet back to Cloudant to finalize the request.
export function updateTweet(tweet) {
  console.log(' ');
  console.log('[tweet-update.updateTweet] updateTweet');

  return new Promise((resolve, reject) => {
    console.log(tweet.state); 
    if (tweet.state == 'rendered') {
      tweet.replied_time = new Date().getTime();
      tweet.state = 'replied'; // A single tweet has this lifecycle: 0->tweeted, 1->analyzed, 2->recommended, 3->rendered, 4->replied
      db.insert(tweet, tweet.id, function(err, body, head) {
        if (err) {
          console.log('[tweet-update.updateTweet] reject: ');
          reject(err);
        } else {
          console.log('[tweet-update.updateTweet] resolve: ');
          resolve(tweet);
        } 
      }); 
    } else {
      console.log('[tweet-update.updateTweet] resolve: ');
      resolve('{"payload": "no need to update"}');
    }
  }); 
};

// Invoke the final action to call the Twitter API.
export function invokeTweetReply(tweet) {
  console.log(' ');
  console.log('[tweet-update.invokeTweetReply] invokeTweetReply');

  return new Promise((resolve, reject) => {
    if (tweet.state == 'replied') {
      // TODO: Extract this from a JSON file.
      whisk.invoke({'name': '/user@example.org_space/tweet-reply', 'parameters': tweet });
      console.log('[tweet-update.invokeTweetReply] resolve: ');
      resolve(tweet);
    } else {
      console.log('[tweet-update.invokeTweetReply] reject: ');
      reject('{"payload": "could not invoke tweet-reply"}');
    }
  });   
};
