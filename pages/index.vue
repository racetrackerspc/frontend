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
      leaderboard: {},
      firebase: null,
      lodash: null,
      turf: null,
      map: null,
    }
  },
  mounted: function () {
    this.initFirebase()
    this.initMapbox()
    this.initLodash()
    this.initTurf()

    this.setupParticipants()
  },
  methods: {
    fetchJSON: async function (url) {
      const response = await fetch(url)
      const json = await response.json()
      return json
    },
    initLodash: function () {
      this.lodash = require('lodash')
    },
    initTurf: function () {
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
        this.map.addSource('participantsSourceStatus1', {
          type: 'geojson',
          data: null
        })

        this.map.addSource('participantsSourceStatus2', {
          type: 'geojson',
          data: null
        })

        this.map.addLayer({
          id: 'participantsLayerStatus1',
          type: 'circle',
          source: 'participantsSourceStatus1',
          paint: {
            'circle-radius': 5,
            'circle-color': '#ffc107'
          }
        })

        this.map.addLayer({
          id: 'participantsLayerStatus2',
          type: 'circle',
          source: 'participantsSourceStatus2',
          paint: {
            'circle-radius': 5,
            'circle-color': '#03a9f4'
          }
        })
      }.bind(this))
    },
    setupParticipants: async function () {
      this.map.on('load', function () {
        let participantsRef = this.firebase.database().ref('/participants_test')

        participantsRef.on('value', function (snapshot) {
          let participantIndex = []
          let leaderboard = {}

          snapshot.forEach(function (child) {
            let geojson = child.val()
            leaderboard[child.key] = geojson
            participantIndex.push(child.key)

            this.map.flyTo({center: geojson.geometry.coordinates})
          }.bind(this))

          this.participantIndex = participantIndex
          this.leaderboard = leaderboard

          console.log('setupParticipants', this.participantIndex)

          let status1List = this.lodash.filter(this.leaderboard, function (o) {
            return o.properties.status === 205
          })
          let status2List = this.lodash.filter(this.leaderboard, function (o) {
            return o.properties.status === 204
          })

          this.map.getSource('participantsSourceStatus1').setData({
            type: 'FeatureCollection',
            features: status1List
          })
          this.map.getSource('participantsSourceStatus2').setData({
            type: 'FeatureCollection',
            features: status2List
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
