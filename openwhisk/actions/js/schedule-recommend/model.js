import Promise from 'bluebird';

var Cloudant = require('cloudant');
var config = require('./cloudant-config.json');
var cloudant = new Cloudant({
  account:  config.account, 
  password: config.password
});
var db = cloudant.db.use(config.db);

var intersection = require('array-intersection');

// Download the schedule data and intersect matching keywords against the tweet profile. Generate a confidence scored schedule for them.
export function recommendSchedule(tweet) {
  console.log(' ');
  console.log('[schedule-recommend.recommendSchedule] recommendSchedule');

  return new Promise((resolve, reject) => {    
    console.log(tweet.state);
    if (tweet.state == 'analyzed') {

      var conferenceSchedule = [];
      db.list({'include_docs': true}, function (err, body, head) {
        if (err) {
          console.log('[schedule-recommend.recommendSchedule conferenceSchedule] reject: ');
          reject(err);
        } else {
          console.log('[schedule-recommend.recommendSchedule conferenceSchedule] resolve: ');
          body.rows.forEach(function(row) {
            conferenceSchedule.push(row.doc);
          });

          // 1. Score all matches regardless of timeslot or type in a single array (time sensitive? do they want to see grayed out past events?) 
          console.log('[schedule-recommend.recommendSchedule] recommending: ' + conferenceSchedule.length);
          var recommendedSchedule = [];
          for (var i = 0; i < conferenceSchedule.length; i++) {   
            var session = conferenceSchedule[i];

            // For each keyword that is in the session keywords that matches user keywords, increment a confidence counter
            // TODO: Count the number of times it appears in session.keywords, not just unique matches (right now schedule-update deletes duplicates)
            var mergedKeywords = intersection(session.keywords, tweet.keywords);
            session.confidence = mergedKeywords.length;

            // Thin out the data structure before storing back to Cloudant
            session.keywords = [];

            recommendedSchedule.push(session);
          }

          tweet.schedule = recommendedSchedule;

          tweet.recommended_time = new Date().getTime();
          tweet.state = 'recommended'; // A single tweet has this lifecycle: 0->tweeted, 1->analyzed, 2->recommended, 3->rendered, 4->replied

          console.log('[schedule-recommend.recommendSchedule] resolve: ');
          resolve(tweet);
        } 
      }); 

    } else {
      console.log('[schedule-recommend.recommendSchedule] resolve: ');
      resolve('{"payload": "no need to recommend"}');
    }
  });  

};

// Invoke the schedule render action.
export function invokeScheduleRender(tweet) {
  console.log(' ');
  console.log('[schedule-recommend.invokeScheduleRender] invokeScheduleRecommend');

  return new Promise((resolve, reject) => {
    if (tweet.state == 'recommended') {
      // TODO: Extract this from a JSON file.
      whisk.invoke({'name': '/user@example.org_space/schedule-render', 'parameters': tweet });
      console.log('[schedule-recommend.invokeScheduleRender] resolve: ');
      resolve(tweet);
    } else {
      console.log('[schedule-recommend.invokeScheduleRender] reject: ');
      reject('{"payload": "could not invoke schedule-render"}');
    }
  }); 
};
