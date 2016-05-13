import Promise from 'bluebird';

var Cloudant = require('cloudant');
var config = require('./cloudant-config.json');
var cloudant = new Cloudant({
  account:  config.account, 
  password: config.password
});
var db = cloudant.db.use(config.db);

var icalParser = require('ical');
var months = months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

var keywordExtractor = require('keyword-extractor');

// Retrieves the iCal formatted schedule feed, enriches the schedule keywords, and creates a data structure to save in Cloudant.
export function fetchSchedule() {
  console.log(' ');
  console.log('[schedule-update.fetchSchedule] fetchSchedule');

  return new Promise((resolve, reject) => {
    icalParser.fromURL('http://conferences.oreilly.com/oscon/open-source-us/public/schedule/ical/public', {}, function(err, data) {
      if (err) {
        console.log('[schedule-update.fetchSchedule] reject: ');
        console.log(e);
        reject(e);
      } else {
        var schedule = [];
        console.log('[schedule-update.fetchSchedule] resolve: ');
        for (var k in data) {
          if (data.hasOwnProperty(k)) {
            var session = data[k];
            console.log(session.summary);
            
            // Remove punctuation, common words, and tokenize.
            // TODO: Enhance session information with metadata more intelligently to improve the matching algorithm.
            session.keywords = [];
            session.keywords = session.keywords.concat(keywordExtractor.extract(
              session.summary.replace(/[^a-zA-Z ]/g, ""), {
                language: "english",
                return_changed_case: true,
                remove_duplicates: true
              }
            ));
            session.keywords = session.keywords.concat(keywordExtractor.extract(
              session.description.replace(/[^a-zA-Z ]/g, ""), {
                language: "english",
                return_changed_case: true,
                remove_duplicates: true
              }
            ));

            schedule.push(session);
          }
        }
        resolve(schedule);
      }
    })
  });
};

// Store the schedule data in Cloudant.
export function updateSchedule(schedule) {
  console.log(' ');
  console.log('[schedule-update.updateSchedule] updateSchedule');

  console.log('[schedule-update.updateSchedule] saving to Cloudant');
  return new Promise((resolve, reject) => {
    cloudant.db.destroy('schedule', function(e) {
      cloudant.db.create('schedule', function() {
        db.bulk({"docs": schedule}, function (e, r, body) {
          if (e) {
            console.log('[schedule-update.updateSchedule] reject: ');
            console.log(e);
            reject(e);
          } else {
            console.log('[schedule-update.updateSchedule] resolve: ');
            console.log(r);
            resolve(r);
          }
        })
      });
    });
  });

};

