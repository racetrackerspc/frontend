<template>
  <div id="map"></div>
</template>

<script>
export default {
  data () {
    return {
      leaderboard: [],
      firebase: null,
      mapboxgl: null,
      axios: null,
      turf: null,
      map: null
    }
  },
  mounted: function () {
    this.initAxios()
    this.initFirebase()
    this.initTurf()
    this.initMapbox()

    this.setupMap().then(() => this.setupParticipants())
  },
  methods: {
    initAxios: function () {
      this.axios = require('axios')
    },
    initTurf: function () {
      this.turf = {
        helpers: require('@turf/helpers'),
        center: require('@turf/center').default,
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
      this.mapboxgl = require('mapbox-gl')
      this.mapboxgl.accessToken = process.env.mbAccessToken
    },
    setupMap: function () {
      const storage = this.firebase.storage()
      const trackRef = storage.ref('km_vertical.geojson')

      let startPoint, endPoint, center, track, bbox

      return trackRef.getDownloadURL()
      .then(url => {
        return this.axios.get(url).then(({data}) => {
          console.log('track', data)

          let startCoords = data.features[0].geometry.coordinates[0]
          let endCoords = data.features[0].geometry.coordinates.slice(-1)[0]

          startPoint = this.turf.helpers.point(startCoords)
          endPoint = this.turf.helpers.point(endCoords)
          track = data

          center = this.turf.center(data)
          bbox = this.turf.bbox(data)
        })
      })
      .then(() => {
        this.map = new this.mapboxgl.Map({
            container: 'map',
            style: 'mapbox://styles/mapbox/light-v9',
            center: center.geometry.coordinates,
            zoom: 15
        })

        this.map.fitBounds(bbox, {
          padding: { top: 100, bottom: 100, left: 100, right: 100 },
          maxZoom: 15
        })

        this.map.on('load', () => {
          this.map.addSource('trackSource', {
            type: 'geojson',
            data: track
          })

          this.map.addSource('startPointSource', {
            type: 'geojson',
            data: startPoint
          })

          this.map.addSource('endPointSource', {
            type: 'geojson',
            data: endPoint
          })

          this.map.addSource('leaderboardSource', {
            type: 'geojson',
            data: null
          })

          this.map.addLayer({
            id: 'trackLayer',
            type:'line',
            source: 'trackSource',
            layout: {
                'line-join': 'round',
                'line-cap': 'round'
            },
            paint: {
                'line-opacity': 1,
                'line-color': '#888',
                'line-width': 5
            }
          })

          this.map.addLayer({
            id: 'startPointLayer',
            type: 'circle',
            source: 'startPointSource',
            paint: {
                'circle-radius': 7,
                'circle-color': '#8bc34a'
            }
          })

          this.map.addLayer({
            id: 'endPointLayer',
            type: 'circle',
            source: 'endPointSource',
            paint: {
                'circle-radius': 7,
                'circle-color': '#f44336'
            }
          })

          this.map.addLayer({
            id: 'leaderboardLayer',
            type: 'circle',
            source: 'leaderboardSource',
            paint: {
              'circle-radius': 5,
              'circle-color': '#03a9f4'
            }
          })
        })

        let popup = new this.mapboxgl.Popup({
          closeOnClick: false,
          closeButton: false
        })

        this.map.on('mouseenter', 'leaderboardLayer', e => {
          this.map.getCanvas().style.cursor = 'pointer'

          let coordinates = e.features[0].geometry.coordinates.slice()
          let description = Object.entries(e.features[0].properties)
                            .map(([key, value]) => `<li><b>${key}</b>: ${value}</li>`)
                            .join(' ')

          // Ensure that if the map is zoomed out such that multiple
          // copies of the feature are visible, the popup appears
          // over the copy being pointed to.
          while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
            coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360
          }

          popup.setLngLat(coordinates).setHTML(description).addTo(this.map)
        })

        this.map.on('mouseleave', 'leaderboardLayer', () => {
          this.map.getCanvas().style.cursor = ''
          popup.remove()
        })
      })
    },
    setupParticipants: function () {
      this.map.on('load', () => {
        let leaderboardRef = this.firebase.database()
                             .ref('/leaderboard')
                             .orderByChild('properties/location')

        leaderboardRef.on('value', snapshot => {
          this.leaderboard = []

          snapshot.forEach(child => {
            console.log(child.key, child.val().properties.location)
            this.leaderboard.push(child.val())
          })

          this.map.getSource('leaderboardSource').setData({
            type: 'FeatureCollection',
            features: this.leaderboard
          })
        })
      })
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
