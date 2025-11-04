#!/bin/bash
# Quick deployment script
echo "🚀 Deploying Firebase Functions..."
cd "/Users/akouvi/Desktop/Business strat/jack/functions"
npm install
cd ..
firebase deploy --only functions
