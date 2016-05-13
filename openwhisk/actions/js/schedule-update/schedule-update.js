// Update schedule – An action that’s invoked hourly by an internal alarm trigger to retrieve the latest OSCON schedule 
// feed that is published by the conference organizers in iCal format. It parses the complete calendar of over 200 sessions, 
// enriches the metadata for easier analysis later, and saves the data to Cloudant. 

/* 
npm install --save bluebird request@2.65.0 cloudant ical keyword-extractor

cd /home/vagrant/oscon/actions/js/schedule-update && \
npm run build && \
wsk action update schedule-update dist/bundle.js

wsk action invoke --blocking --result schedule-update (To test. Not invoked directly. An OpenWhisk alarm will do this. See devops/create-schedule-rule.sh)
*/

import { fetchSchedule, updateSchedule } from './model';
import Promise from 'bluebird';

global.main = (  ) => {
  fetchSchedule()
  .then(schedule =>
  	updateSchedule(schedule)
  ).then(result =>
    whisk.done({ payload: '[schedule-update.main]: ' + JSON.stringify(result) })
  ).catch(e =>
    whisk.done(e)
  );
  return whisk.async();
};
