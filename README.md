# Racetracker frontend
Loads the track for a race in GeoJSON format and updates the participants locations in realtime.

## Development setup
``` bash
# install dependencies
$ npm install # Or yarn install

# serve with hot reload at localhost:3000
$ npm run dev
```

## Specify files to deploy
The `public` attribute included in the default `firebase.json` file defines which files in your project directory should be deployed to your Firebase project. Set this field to `frontend/dist` so Firebase can pick up the static files generated by Nuxt in the next step. 

## Generate and deploy
``` bash
# generate static project
$ npm run generate

# deploy the static site to firebase
$ firebase deploy
```
