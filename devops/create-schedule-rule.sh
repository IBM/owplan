#!/bin/bash

# This script is used to set up the alarm that runs at the top of each hour to load the conference schedule.
# An action is linked to a trigger by a rule.

# Create trigger to run once an hour. By default, the alarm will only run 1,000 times.
wsk trigger create schedule-trigger --feed /whisk.system/alarms/alarm --param cron '* 0 * * *' --param maxTriggers 10000

# Ensure the trigger is created before creating the rule.
sleep 1

# Create the rule linking the trigger to the action.
wsk rule create --enable schedule-update-rule schedule-trigger schedule-update

# Verify trigger and rule.
wsk trigger list
wsk rule list