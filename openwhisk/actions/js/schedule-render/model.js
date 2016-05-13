import Promise from 'bluebird';

var Cloudant = require('cloudant');
var config = require('./cloudant-config.json');
var cloudant = new Cloudant({
  account:  config.account, 
  password: config.password
});
var db = cloudant.db.use(config.db);

// TODO: Use this to externalize conference templates.
// var scheduleTemplate = require('./oscon-template.json');

// Format the recommended schedule for consumption by the web UI. 
export function renderSchedule(tweet) {
  console.log(' ');
  console.log('[schedule-render.renderSchedule] renderSchedule');

  return new Promise((resolve, reject) => {    
    console.log(tweet.state);
    if (tweet.state == 'recommended') {

      // Get schedule data, grouped by timeslot
      var roomStatus = {};

      // Query for the last 60 room data points in order by timestamp (there are 18 rooms, but we need to account for double records)
      db.list({'include_docs': true, 'descending': true, 'limit': 60}, function (err, body, head) {
        if (err) {
          console.log('[schedule-render.renderSchedule rooms] reject: ');
          reject(err);
        } else {
          console.log('[schedule-render.renderSchedule rooms] resolve: ');
          body.rows.forEach(function(row) {
            // 2. Correlate the rooms to the latest sensor data for the rooms
            // TODO: Fetch room_status data for the current time and current room (how relevant is future data?)
            // Only want the latest result, so if there are older results that would be duplicates, discard.
            if (!roomStatus.hasOwnProperty(row.doc.location)) {
              roomStatus[row.doc.location] = row.doc;
            }
          });

          // 3. Create a bitmap with the schedule data? Using what render library? HTML Canvas? node-canvas? Just used a Bluemix PHP/Cloudant app for now.

          console.log('[schedule-render.renderSchedule] rendering: ');

          for (var i = 0; i < tweet.schedule.length; i++) {
            // For each item in the schedule, intersect on the room value, and add the data and calculations.   
            tweet.schedule[i].conditions = roomStatus[tweet.schedule[i].location];
          }

          // Sort everything once by confidence score.
          tweet.schedule.sort(function(a, b) {
            if (b.confidence < a.confidence) {
              return -1;
            } else if (b.confidence > a.confidence) {
              return 1;
            } else {
              return 0;
            }
          });

          // TODO: Externalize this structure, which is hardcoded for OSCON.
          var schedule = [

            // Gold/Silver Tutorials Monday 5/16
            {
              "name": "Monday",
              "description": "Gold/Silver Tutorials",
              "schedule": [
                {
                  "timeslot" : "7:30 - 9:00", 
                  "sessions": [{"summary": "Morning Coffee Service", "description": "Morning Coffee Service", "location": "TBD", "confidence": 0}]
                },
                {
                  "timeslot" : "9:00 - 12:30", 
                  "sessions": tweet.schedule.filter(function(session) { return session.start == '2016-05-16T09:00:00.000Z' })
                },
                {
                  "timeslot" : "12:30 - 1:30", 
                  "sessions": [{"summary": "Lunch", "description": "Lunch", "location": "Exhibit Hall 2-3", "confidence": 0}]
                },
                {
                  "timeslot" : "1:30 - 3:00", 
                  "sessions": tweet.schedule.filter(function(session) { return session.start == '2016-05-16T09:00:00.000Z' }) // Same as 9:00 - 12:30
                },
                {
                  "timeslot" : "3:00 - 3:30", 
                  "sessions": [{"summary": "Afternoon Break", "description": "Afternoon Break", "location": "Exhibit Hall 2-3", "confidence": 0}]
                },
                {
                  "timeslot" : "3:30 - 5:00", 
                  "sessions": tweet.schedule.filter(function(session) { return session.start == '2016-05-16T09:00:00.000Z' }) // Same as 9:00 - 12:30
                },
                {
                  "timeslot" : "5:00 - 6:30", 
                  "sessions": tweet.schedule.filter(function(session) { return session.start == '2016-05-16T17:00:00.000Z' })
                },
                {
                  "timeslot" : "7:00 - 9:00", 
                  "sessions": tweet.schedule.filter(function(session) { return session.start == '2016-05-16T19:00:00.000Z' })
                },
                {
                  "timeslot" : "7:30 - 9:00", 
                  "sessions": tweet.schedule.filter(function(session) { return session.start == '2016-05-16T19:30:00.000Z' })
                }
              ]
            },

            // Gold/Silver Tutorials Tuesday 5/17
            {
              "name": "Tuesday",
              "description": "Gold/Silver Tutorials",
              "schedule": [
                {
                  "timeslot" : "7:30 - 9:00", 
                  "sessions": [{"summary": "Morning Coffee Service", "description": "Morning Coffee Service", "location": "TBD", "confidence": 0}]
                },
                {
                  "timeslot" : "9:00 - 12:30", 
                  "sessions": tweet.schedule.filter(function(session) { return session.start == '2016-05-17T09:00:00.000Z' })
                },
                {
                  "timeslot" : "12:30 - 1:30", 
                  "sessions": [{"summary": "Lunch", "description": "Lunch", "location": "Exhibit Hall 2-3", "confidence": 0}]
                },
                {
                  "timeslot" : "1:30 - 3:00", 
                  "sessions": tweet.schedule.filter(function(session) { return session.start == '2016-05-17T13:30:00.000Z' }) 
                },
                {
                  "timeslot" : "3:00 - 3:30", 
                  "sessions": [{"summary": "Afternoon Break", "description": "Afternoon Break", "location": "Exhibit Hall 2-3", "confidence": 0}]
                },
                {
                  "timeslot" : "3:30 - 5:00", 
                  "sessions": tweet.schedule.filter(function(session) { return session.start == '2016-05-17T13:30:00.000Z' })  // Same as 1:30 - 3:00
                },
                {
                  "timeslot" : "5:00 - 6:00", 
                  "sessions": tweet.schedule.filter(function(session) { return session.start == '2016-05-17T17:00:00.000Z' }) 
                },
                {
                  "timeslot" : "6:30 - 9:00", 
                  "sessions": tweet.schedule.filter(function(session) { return session.start == '2016-05-17T18:30:00.000Z' }) 
                }
              ]
            },

            // Keynotes and Sessions for all Wednesday 5/18
            {
              "name": "Wednesday",
              "description": "Keynotes and Sessions",
              "schedule": [
                {
                  "timeslot" : "7:30 - 8:45", 
                  "sessions": [{"summary": "Morning Coffee Service", "description": "Morning Coffee Service", "location": "Ballroom D Foyer", "confidence": 0}]
                },
                {
                  "timeslot" : "8:45 - 8:55", 
                  "sessions": tweet.schedule.filter(function(session) { return session.start == '2016-05-18T08:45:00.000Z' }) 
                },
                {
                  "timeslot" : "8:55 - 9:05", 
                  "sessions": tweet.schedule.filter(function(session) { return session.start == '2016-05-18T08:55:00.000Z' }) 
                },
                {
                  "timeslot" : "9:05 - 9:20", 
                  "sessions": tweet.schedule.filter(function(session) { return session.start == '2016-05-18T09:05:00.000Z' }) 
                },
                {
                  "timeslot" : "9:20 - 9:30", 
                  "sessions": tweet.schedule.filter(function(session) { return session.start == '2016-05-18T09:20:00.000Z' }) 
                },
                {
                  "timeslot" : "9:30 - 9:45", 
                  "sessions": tweet.schedule.filter(function(session) { return session.start == '2016-05-18T09:30:00.000Z' }) 
                },
                {
                  "timeslot" : "9:45 - 9:53", 
                  "sessions": tweet.schedule.filter(function(session) { return session.start == '2016-05-18T09:45:00.000Z' }) 
                },
                {
                  "timeslot" : "9:53 - 10:00", 
                  "sessions": tweet.schedule.filter(function(session) { return session.start == '2016-05-18T09:53:00.000Z' }) 
                },
                {
                  "timeslot" : "10:00 - 10:15", 
                  "sessions": tweet.schedule.filter(function(session) { return session.start == '2016-05-18T10:00:00.000Z' }) 
                },
                {
                  "timeslot" : "10:15 - 10:20", 
                  "sessions": tweet.schedule.filter(function(session) { return session.start == '2016-05-18T10:15:00.000Z' }) 
                },
                {
                  "timeslot" : "10:20 - 11:05", 
                  "sessions": [{"summary": "Morning Break", "description": "Morning Break", "location": "Exhibit Hall", "confidence": 0}]
                },
                {
                  "timeslot" : "11:05 - 11:45", 
                  "sessions": tweet.schedule.filter(function(session) { return session.start == '2016-05-18T11:05:00.000Z' }) 
                },
                {
                  "timeslot" : "11:55 - 12:35", 
                  "sessions": tweet.schedule.filter(function(session) { return session.start == '2016-05-18T11:55:00.000Z' }) 
                },
                {
                  "timeslot" : "12:35 - 1:50", 
                  "sessions": [{"summary": "Lunch", "description": "Lunch", "location": "Exhibit Hall", "confidence": 0}]
                },
                {
                  "timeslot" : "1:50 - 2:30", 
                  "sessions": tweet.schedule.filter(function(session) { return session.start == '2016-05-18T13:50:00.000Z' }) 
                },
                {
                  "timeslot" : "2:40 - 3:20", 
                  "sessions": tweet.schedule.filter(function(session) { return session.start == '2016-05-18T14:40:00.000Z' }) 
                },
                {
                  "timeslot" : "3:20 - 4:20", 
                  "sessions": [{"summary": "Afternoon Break", "description": "Afternoon Break", "location": "Exhibit Hall", "confidence": 0}]
                },
                {
                  "timeslot" : "4:20 - 5:00", 
                  "sessions": tweet.schedule.filter(function(session) { return session.start == '2016-05-18T16:20:00.000Z' }) 
                },
                {
                  "timeslot" : "5:10 - 5:50", 
                  "sessions": tweet.schedule.filter(function(session) { return session.start == '2016-05-18T17:10:00.000Z' }) 
                },
                {
                  "timeslot" : "5:50 - 7:15", 
                  "sessions": tweet.schedule.filter(function(session) { return session.start == '2016-05-18T17:50:00.000Z' }) 
                },
                {
                  "timeslot" : "7:00 - 9:00", 
                  "sessions": tweet.schedule.filter(function(session) { return session.start == '2016-05-18T17:00:00.000Z' })  
                }
              ]
            },
            
            // Keynotes and Sessions for all Thursday 5/19
            {
              "name": "Thursday",
              "description": "Keynotes and Sessions",
              "schedule": [
                {
                  "timeslot" : "7:30 - 8:50", 
                  "sessions": [{"summary": "Morning Coffee Service", "description": "Morning Coffee Service", "location": "Ballroom D Foyer", "confidence": 0}]
                },
                {
                  "timeslot" : "8:50 - 8:55", 
                  "sessions": tweet.schedule.filter(function(session) { return session.start == '2016-05-19T08:50:00.000Z' }) 
                },
                {
                  "timeslot" : "9:05 - 9:20", 
                  "sessions": tweet.schedule.filter(function(session) { return session.start == '2016-05-19T09:05:00.000Z' }) 
                },
                {
                  "timeslot" : "9:20 - 9:30", 
                  "sessions": tweet.schedule.filter(function(session) { return session.start == '2016-05-19T09:20:00.000Z' }) 
                },
                {
                  "timeslot" : "9:30 - 9:45", 
                  "sessions": tweet.schedule.filter(function(session) { return session.start == '2016-05-19T09:30:00.000Z' }) 
                },
                {
                  "timeslot" : "9:45 - 9:55", 
                  "sessions": tweet.schedule.filter(function(session) { return session.start == '2016-05-19T09:45:00.000Z' }) 
                },
                {
                  "timeslot" : "9:55 - 10:00", 
                  "sessions": tweet.schedule.filter(function(session) { return session.start == '2016-05-19T09:55:00.000Z' }) 
                },
                {
                  "timeslot" : "10:10 - 10:15", 
                  "sessions": tweet.schedule.filter(function(session) { return session.start == '2016-05-19T10:10:00.000Z' }) 
                },
                {
                  "timeslot" : "10:15 - 10:20", 
                  "sessions": tweet.schedule.filter(function(session) { return session.start == '2016-05-19T10:15:00.000Z' }) 
                },
                {
                  "timeslot" : "10:20 - 11:05", 
                  "sessions": [{"summary": "Morning Break", "description": "Morning Break", "location": "TBD", "confidence": 0}] 
                },
                {
                  "timeslot" : "11:05 - 11:45", 
                  "sessions": tweet.schedule.filter(function(session) { return session.start == '2016-05-19T11:05:00.000Z' }) 
                },
                {
                  "timeslot" : "11:55 - 12:35", 
                  "sessions": tweet.schedule.filter(function(session) { return session.start == '2016-05-19T11:55:00.000Z' }) 
                },
                {
                  "timeslot" : "12:35 - 1:50", 
                  "sessions": [{"summary": "Lunch", "description": "Lunch", "location": "Exhibit Hall", "confidence": 0}]
                },
                {
                  "timeslot" : "1:50 - 2:30", 
                  "sessions": tweet.schedule.filter(function(session) { return session.start == '2016-05-19T13:50:00.000Z' }) 
                },
                {
                  "timeslot" : "2:40 - 3:20", 
                  "sessions": tweet.schedule.filter(function(session) { return session.start == '2016-05-19T14:40:00.000Z' }) 
                },
                {
                  "timeslot" : "3:20 - 4:20", 
                  "sessions": [{"summary": "Afternoon Break", "description": "Afternoon Break", "location": "TBD", "confidence": 0}]
                },
                {
                  "timeslot" : "4:20 - 5:00", 
                  "sessions": tweet.schedule.filter(function(session) { return session.start == '2016-05-19T16:20:00.000Z' }) 
                },
                {
                  "timeslot" : "5:10 - 5:40", 
                  "sessions": tweet.schedule.filter(function(session) { return session.start == '2016-05-19T17:10:00.000Z' }) 
                }
              ]
            }
          ];

          // Replace the schedule with the rendered version.
          tweet.schedule = schedule;

          console.log('tweet.id: ' + tweet.id);
          tweet.schedule_link = 'http://owplan.mybluemix.net/' + tweet.id;

          tweet.rendered_time = new Date().getTime();
          tweet.state = 'rendered'; // A single tweet has this lifecycle: 0->tweeted, 1->analyzed, 2->recommended, 3->rendered, 4->replied

          console.log('[schedule-render.renderSchedule] resolve: ');
          resolve(tweet);
        }
      }); 

    } else {
      console.log('[schedule-render.renderSchedule] resolve: ');
      resolve('{"payload": "no need to render"}');
    }
  }); 

};

// After saving the rendered schedule, invoke update tweet to save it to Cloudant and finalize the request.
export function invokeTweetUpdate(tweet) {
  console.log(' ');
  console.log('[schedule-render.invokeTweetUpdate] invokeTweetUpdate');

  return new Promise((resolve, reject) => {
    if (tweet.state == 'rendered') {
      // TODO: Extract this from a JSON file.
      whisk.invoke({'name': '/user@example.org_space/tweet-update', 'parameters': tweet });
      console.log('[schedule-render.invokeTweetUpdate] resolve: ');
      resolve(tweet);
    } else {
      console.log('[schedule-render.invokeTweetUpdate] reject: ');
      reject('{"payload": "could not invoke tweet-update"}');
    }
  }); 
};
