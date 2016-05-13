#!/bin/bash

# This script both creates and updates actions, assuming a Vagrant VM used as an OpenWhisk client. 
# Run it as is or modify to to update a specific action.
actions=( "schedule-update" "tweet-fetch" "tweet-insert" "tweet-analyze" "schedule-recommend" "schedule-render" "tweet-update" "tweet-reply")
for action in "${actions[@]}"
do
	cd /home/vagrant/owplan/actions/js/$action
	npm run build
	wsk action update $action dist/bundle.js
done