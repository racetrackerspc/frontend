<template>
  <div>
    <div id='map'></div>
  </div>
</template>

<script>
export default {
  components: {
  },
  data () {
    return {
      participantIndex: [],
      leaderboard: [],
      firebase: null,
      track: null,
      turf: null,
      map: null,
    }
  },
  mounted: function () {
    this.initFirebase()
    this.initMapbox()
    this.initTurf()

    this.setupParticipants()
  },
  methods: {
    fetchJSON: async function (url) {
      const response = await fetch(url)
      const json = await response.json()
      return json
    },
    initTurf: function (){
      this.turf = {
        booleanEqual: require('@turf/boolean-equal').default,
        lineSlice: require('@turf/line-slice').default,
        helpers: require('@turf/helpers'),
        length: require('@turf/length').default,
        along: require('@turf/along').default
      }
    },
    initFirebase: function () {
      this.firebase = require('firebase')
      let config = {
        apiKey: 'AIzaSyAEmdvZkn0AFar0jgKumQhIDtQRPzOr2n0',
        authDomain: 'racetracker-lpt.firebaseapp.com',
        databaseURL: 'https://racetracker-lpt.firebaseio.com',
        projectId: 'racetracker-lpt',
        storageBucket: 'racetracker-lpt.appspot.com',
        messagingSenderId: '696169792326'
      }
      this.firebase.initializeApp(config);
    },
    initMapbox: function () {
      const mapboxgl = require('mapbox-gl')
      mapboxgl.accessToken = 'pk.eyJ1IjoieWFyb3giLCJhIjoiY2o5aWVvMWRiM2R5aDJxcXlvc2FmcWhzbSJ9.-rOTs9UnhWazfkt6nwWDyg';

      this.map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/light-v9',
        center: [-17.763852895336896, 28.684245081499952],
        zoom: 16
      })

      this.map.on('load', function () {
        this.map.addSource('participantsSource', {
          type: 'geojson',
          data: null
        })

        this.map.addLayer({
          id: 'participantsLayer',
          type: 'circle',
          source: 'participantsSource',
          paint: {
            'circle-radius': 5,
            'circle-color': '#03a9f4'
          }
        })
      }.bind(this))
    },
    setupParticipants: async function () {
      let json = await this.fetchJSON('/track.geojson')
      this.track = {
        start: this.turf.helpers.point(json.features[1].geometry.coordinates),
        line: json.features[0],
        end: this.turf.helpers.point(json.features[2].geometry.coordinates)
      }

      this.map.on('load', function () {
        let participantsRef = this.firebase.database()
          .ref('/participants')
          .orderByChild('distance')

        participantsRef.on('value', function (snapshot) {
          let participantIndex = []
          let leaderboard = []

          snapshot.forEach(function (child) {
            let participant = child.val()

            leaderboard.push({
              type: 'Feature',
              geometry: {
                type: 'Point',
                coordinates: participant.coordinates
              },
              properties: {
                name: participant.name
              }
            })

            participantIndex.push(child.key)
          }.bind(this))

          this.participantIndex = participantIndex
          this.leaderboard = leaderboard

          console.log('setupParticipants', this.participantIndex)

          this.map.getSource('participantsSource').setData({
            type: 'FeatureCollection',
            features: this.leaderboard
          })
        }.bind(this))

      }.bind(this))
    }
  }
}
</script>

<style>
body {
  padding: 0;
  margin: 0;
}

#map {
  position: absolute;
  bottom: 0;
  width: 100%;
  top: 0;
}
</style>
