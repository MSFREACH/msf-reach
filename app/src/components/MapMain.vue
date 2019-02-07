<template>
    <v-layout>
        <div id="map" class="map"></div>
        <v-layout class="mode-docker">
            <v-flex xs12 sm6 class="py-2">
                <p>Map mode</p>
                <v-btn-toggle v-model="toggle_mode" mandatory>
                  <v-btn flat value="thematic">
                    <v-icon>invert_colors</v-icon>
                  </v-btn>
                  <v-btn flat value="terrain">
                    <v-icon>terrain</v-icon>
                  </v-btn>
                  <v-btn flat value="satellite">
                    <v-icon>satellite</v-icon>
                  </v-btn>
                  <v-btn flat value="humanitarian">
                    <v-icon>accessibility_new</v-icon>
                  </v-btn>
                </v-btn-toggle>
              </v-flex>
          </v-layout>
    </v-layout>

</template>
<script>
/*eslint no-console: off*/
/*eslint no-unused-vars: off*/
/*eslint no-negated-condition: off*/
/*eslint no-debugger: off*/

import { mapGetters } from 'vuex';
import { MAPBOX_STYLES } from '@/common/map-fields';
import { STATUS_ICONS } from '@/common/map-icons';
import { FETCH_EVENTS } from '@/store/actions.type';

function getFeatures(topoJson, key) {
  return topoJson.objects[key].geometries.map(function(geom) {
    return {
      type: "Feature",
      id: geom.properties.id,
      properties: geom.properties || {},
      geometry: {
        type: geom.type,
        coordinates: geom.coordinates
      }
    };
  });
}
var map;

export default {
    name: 'map-main',
    props: {
        coordinates: {
            type: Array
        },
        eventId: {
            type: String,
            required: false
        }
    },
    data(){
        return{
            eventFeatureCollection:[],
            recentCoordinates: [],
            toggle_mode: 1
        };
    },
    mounted(){
        this.fetchEvents();
    },
    watch: {
        coordinates(newVal){
            this.map.setView([newVal[0], newVal[1]], 7);
            this.map.invalidateSize();
        },
        eventsGeoJson(val){
            if(val){
                this.initMap();
                this.loadEventsLayer();
            }
        },
        toggle_mode(val){
            map.setStyle(MAPBOX_STYLES[val]);
        }
    },
    computed: {
        ...mapGetters([
            'eventsCount',
            'isLoadingEvent',
            'eventsGeoJson',
            'fetchEventsError'
        ])
    },
    methods: {
        fetchEvents() {
            this.$store.dispatch(FETCH_EVENTS, {});
        },
        initMap(){
            var geojsonEvents = this.eventsGeoJson.objects.output;

            var eventFeatureCollection = getFeatures(this.eventsGeoJson, 'output');
            if(this.eventId){
                var eventObj = eventFeatureCollection.filter(item =>{
                    return item.properties.id == this.eventId;
                });
                var gotoCoordinates = eventObj[0].geometry.coordinates;
                this.recentCoordinates = gotoCoordinates;
            }else if(!_.isEmpty(this.recentCoordinates)){
                var gotoCoordinates = this.recentCoordinates; // to not lose center when refreshing
            }else{
                var gotoCoordinates = geojsonEvents.geometries[0].coordinates;
            }


            map = new mapboxgl.Map({
                container: 'map',
                style: MAPBOX_STYLES.thematic,
                center: gotoCoordinates,
                zoom: 10,
                minZoom: 4
            });

            map.on('load', function () {
                map.addSource("reach-events", {
                    type: "geojson",
                    data: {
                        "type": "FeatureCollection",
                        "features": eventFeatureCollection
                    },
                    cluster: true,
                    clusterMaxZoom: 14, // Max zoom to cluster points on
                    clusterRadius: 50
                });

                map.addLayer({
                    id: "event-epicenter",
                    type: "circle",
                    source: "reach-events",
                    paint: {
                       "circle-color": [
                           "step",
                           ["get", "point_count"],
                           "#A46664", // wine red , less than 100
                           100,
                           "#A9272D", // standard red, between 100 and 750
                           750,
                           "#EE0000" // bright red, greater than or equal to 750
                       ],
                       "circle-radius": [
                           "step",
                           ["get", "point_count"],
                           20,
                           100,
                           30,
                           750,
                           40
                       ]
                    },
                    "filter": ["==", "$type", "Point"],
                });
            });

            // Create a popup, but don't add it to the map yet.
             var popup = new mapboxgl.Popup({
                 closeButton: true,
                 closeOnClick: false
             });

             map.on('mouseenter', 'event-epicenter', function(e) {
                 // Change the cursor style as a UI indicator.
                 map.getCanvas().style.cursor = 'pointer';
                 var coordinates = e.features[0].geometry.coordinates.slice();

                 var evMeta = JSON.parse(e.features[0].properties.metadata);
                 var description = evMeta.description; // <<< missing feature.properties, need to convert GeometryCollection to FeatureCollection
                 var evName = evMeta.name;
                 // var evType = evMeta.types.join(',');
                 var evStatus = evMeta.event_status;

                 var cleanAreas = _.compact(evMeta.areas);
                 var evPlace;
                 if(!evMeta.areas || _.isEmpty(cleanAreas)){
                     evPlace = evMeta.country;
                 }else{
                     if(cleanAreas[0].region){
                         evPlace = cleanAreas[0].region + cleanAreas[0].country_code;
                     }else{
                         evPlace = cleanAreas[0].country;
                     }
                 }

                 var evLastUpdate = e.features[0].properties.updated_at

                 var contentStr = `<a href="#/events/${e.features[0].properties.id}">
                     <div class="primary-text">${evName}</div>
                     <div class="secondary-text">${evStatus} - \n ${evPlace} </div>
                     <label>${evLastUpdate} </label>
                     </a>
                 `;

                 // Ensure that if the map is zoomed out such that multiple
                 // copies of the feature are visible, the popup appears
                 // over the copy being pointed to.
                 while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
                     coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
                 }
                 // Populate the popup and set its coordinates
                 // based on the feature found.
                 popup.setLngLat(coordinates)
                     .setHTML(contentStr)
                     .addTo(map);
             });

             // map.on('mouseleave', 'event-epicenter', function() {
             //     map.getCanvas().style.cursor = '';
             //     popup.remove();
             // });
        },

        loadEventsLayer(){

        },
        zoomToEventCenter(){
            var eventObj = this.eventFeatureCollection.filter(item =>{
                return item.properties.id == this.eventId;
            });

            map.flyTo({center: [eventObj.geometry.coordinates]});
        }
    }

};

</script>

<style lang='scss'>
    #map{
        display: block;
        width: 100%;
        top: 64px;
        height: calc(100vh - 64px); // **height require by leaflet
    }

    .anchor-nav{
        z-index: 11;
        bottom: 12px;
    }

    .mapContainer{
        .leaflet-top, .leaflet-bottom {
            z-index: 5 !important;
        }
        .leaflet-pane {
            z-index: 10 !important;
        }
    }
    .mode-docker{
        position: absolute;
        bottom: 0;
        left: 0;
        margin: 30px;
    }

</style>
