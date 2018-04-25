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
      leaderboard: [],
      firebase: null,
      turf: null,
      map: null
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
    initTurf: function () {
      this.turf = {
        helpers: require('@turf/helpers'),
        bbox: require('@turf/bbox').default
      }
    },
    initFirebase: function () {
      this.firebase = require('firebase')
      let config = {
        apiKey: process.env.fbApiKey,
        authDomain: process.env.fbAuthDomain,
        databaseURL: process.env.fbDatabaseUrl,
        projectId: process.env.fbProjectId,
        storageBucket: process.env.fbStorageBucket,
        messagingSenderId: process.env.fbMessagingSenderId
      }
      this.firebase.initializeApp(config)
    },
    initMapbox: function () {
      const mapboxgl = require('mapbox-gl')
      mapboxgl.accessToken = process.env.mbAccessToken

      this.map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/light-v9',
        zoom: 15
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
        this.firebase.database().ref('/participants_test')
        .on('value', function (snapshot) {
          let leaderboard = []

          snapshot.forEach(function (child) {
            leaderboard.push(child.val())
          }.bind(this))

          let collection = this.turf.helpers.featureCollection(leaderboard)
          let bbox = this.turf.bbox(collection)

          this.leaderboard = leaderboard
          this.map.fitBounds(bbox, {
            padding: { top: 100, bottom: 100, left: 100, right: 100 },
            maxZoom: 15
          })

          console.log('leaderboard', this.leaderboard.map(value =>
            value.properties.deviceId
          ))

          this.map.getSource('participantsSourceStatus1').setData({
            type: 'FeatureCollection',
            features: this.leaderboard.filter(participant =>
              participant.properties.status === 205
            )
          })
          this.map.getSource('participantsSourceStatus2').setData({
            type: 'FeatureCollection',
            features: this.leaderboard.filter(participant =>
              participant.properties.status === 204
            )
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
