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

// Extract hashtags from the given string.
function getHashTags(inputText) {  
    var regex = /(?:^|\s)(?:#)([a-zA-Z\d]+)/gm;
    var matches = [];
    var match;

    while ((match = regex.exec(inputText))) {
        matches.push(match[1].toLowerCase());
    }

    return matches;
}

// Extract handles from the given string.
// TODO: This only differs by one character from the other private function above. Merge.
function getMentions(inputText) {  
    var regex = /(?:^|\s)(?:@)([a-zA-Z\d]+)/gm;
    var matches = [];
    var match;

    while ((match = regex.exec(inputText))) {
        matches.push(match[1].toLowerCase());
    }

    return matches;
}

// Build context around the tweet and the tweeter. This looks for hashtags and mentions to use to add keywords to their search.
export function analyzeTweet(tweet) {
  console.log(' ');
  console.log('[tweet-analyze.analyzeTweet] analyzeTweet');

  // TODO: Look at Insights for Twitter or Personality profile services.
  return new Promise((resolve, reject) => {    

    console.log(tweet.state);
    if (tweet.state == 'tweeted') {
      twitter.get('statuses/user_timeline', { screen_name: tweet.handle, count: 30 }, function (err, body, head) {
        if (err) {
          console.log('[tweet-analyze.analyzeTweet] reject: ');
          console.log(err);
          reject(err);
        } else {

          // Find the hashtags and mentions in the user profile, and extract those.
          // TODO: Weight search keywords highest, profile keywords second, then timeline keywords third.
          tweet.keywords = tweet.keywords.concat(getHashTags(tweet.profile));
          tweet.keywords = tweet.keywords.concat(getMentions(tweet.profile));

          // Look at keywords in the user's timeline and grab the hashtags and mentions for the last few.
          // We could do the regex on the tweet, but instead we're looking at the pre-parsed collection.
          for (var i = 0; i < body.length; i++) { 
            var hashtags = body[i].entities.hashtags;
            for (var j = 0; j < hashtags.length; j++) {
              tweet.keywords = tweet.keywords.concat(hashtags[j].text.toLowerCase());
            };
          }  

          tweet.analyzed_time = new Date().getTime();
          tweet.state = 'analyzed'; // A single tweet has this lifecycle: 0->tweeted, 1->analyzed, 2->recommended, 3->rendered, 4->replied

          console.log('[tweet-analyze.analyzeTweet] resolve: ');
          resolve(tweet);
        }
      })
    } else {
      console.log('[tweet-analyze.analyzeTweet] resolve: ');
      resolve('{"payload": "no need to analyze"}');
    }      

  });  
};

// Invoke the schedule recommend action.
export function invokeScheduleRecommend(tweet) {
  console.log(' ');
  console.log('[tweet-analyze.invokeScheduleRecommend] invokeScheduleRecommend');

  return new Promise((resolve, reject) => {
    if (tweet.state == 'analyzed') {
      // TODO: Extract this from a JSON file.
      whisk.invoke({'name': '/user@example.org_space/schedule-recommend', 'parameters': tweet });
      console.log('[tweet-analyze.invokeScheduleRecommend] resolve: ');
      resolve(tweet);
    } else {
      console.log('[tweet-analyze.invokeScheduleRecommend] reject: ');
      reject('{"payload": "could not invoke schedule-recommend"}');
    }
  }); 
};
