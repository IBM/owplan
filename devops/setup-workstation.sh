#!/bin/bash

# Set up your Ubuntu Vagrant VM for OpenWhisk action development. 
# This may vary according to your own development environment preferences.

# Create a Node 0.12 environment for local development.
curl -sL https://deb.nodesource.com/setup_0.12 | sudo -E bash -
sudo apt-get install -y nodejs
sudo npm cache clean
sudo npm install npm -g

# Install some global prerequisite packages. You may have to do this per action when first building them.
sudo npm install -g webpack
npm install --save-dev webpack babel-core babel-loader babel-preset-es2015 json-loader
npm run build