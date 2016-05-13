import Promise from 'bluebird';

var Cloudant = require('cloudant');
var config = require('./cloudant-config.json');
var cloudant = new Cloudant({
  account:  config.account, 
  password: config.password
});
var db = cloudant.db.use(config.db);

// Extract a subset of the full tweet data from the Twitter API, and store that in Cloudant.
export function insertTweet(tweet) {
  console.log(' ');
  console.log('[tweet-insert.saveTweet] saveTweet');

  var data = {};
  data.text = tweet.text.toLowerCase().replace('@owplan', '').trim();
  data.in_reply_to_screen_name = tweet.in_reply_to_screen_name;
  data.handle = tweet.user.screen_name;
  data.profile = tweet.user.description;
  data.tweet_id_str = tweet.id_str;
  data.state = 'tweeted'; // A single tweet instance has this lifecycle: 0->tweeted, 1->analyzed, 2->recommended, 3->rendered, 4->replied
  data.id = data.tweet_id_str;
  data.keywords = data.text.split(',');
  for (var i = 0; i < data.keywords.length; i++) data.keywords[i] = data.keywords[i].trim();

  console.log('[tweet-insert.saveTweet] saving to Cloudant');
  console.log(data.id);
  return new Promise((resolve, reject) => {
    db.insert({_id: data.id, handle: data.handle, profile: data.profile, keywords: data.keywords, tweet_id: data.tweet_id, state: data.state}, function (err, body, head) {
      if (err) {
        console.log('[tweet-insert.saveTweet] reject: ');
        if (err.statusCode == 409) {
          console.log('[tweet-insert.saveTweet] tweet has already been inserted' );
          data.state = 'replied';
          resolve(data);
        } else {
          console.log(err);
          reject(err);
        }
      } else {
        console.log('[tweet-insert.saveTweet] resolve: ');
        console.log(body);
        data.rev = body.rev;
        data._rev = body.rev;
        resolve(data);
      }
    })
  });
};

// After saving to Cloudant, invoke the analyze tweet action.
export function invokeTweetAnalyze(tweet) {
  console.log(' ');
  console.log('[tweet-insert.invokeTweetAnalyze] invokeTweetAnalyze');

  return new Promise((resolve, reject) => {
    if (tweet.state == 'tweeted') {
      // TODO: Extract this from a JSON file.
      whisk.invoke({'name': '/user@example.org_space/tweet-analyze', 'parameters': tweet });
      console.log('[tweet-insert.invokeTweetAnalyze] resolve: ');
      resolve(tweet);
    } else if (tweet.state == 'replied') {
      resolve('{"payload": "tweet has already been inserted"}');
    } else {
      console.log('[tweet-insert.invokeTweetAnalyze] reject: ');
      reject('{"payload": "could not invoke tweet-analyze"}');
    }
  }); 
};
