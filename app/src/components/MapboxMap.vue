<template>
    <v-layout>
        <div id="map" class="map"></div>
    </v-layout>
</template>
<script>
/*eslint no-console: off*/
/*eslint no-unused-vars: off*/
/*eslint no-negated-condition: off*/
/*eslint no-debugger: off*/

import { mapGetters } from 'vuex';
import { TILELAYER_REACH } from '@/common/map-fields';
import { STATUS_ICONS } from '@/common/map-icons';
import { FETCH_EVENTS } from '@/store/actions.type';

function getFeatures(topology, key) {
  return topology.objects[key].geometries.map(function(geom) {
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


export default {
    name: 'map-annotation',
    props: {
        coordinates: {
            type: Array
        }
    },
    data(){
        return{
            map: {}
        };
    },
    mounted(){
        this.fetchEvents();
    },
    watch: {
        coordinates(newVal){
            console.log('newVal ---coordinates-- ', newVal);
            this.map.setView([newVal[0], newVal[1]], 7);
            this.map.invalidateSize();
        },
        eventsGeoJson(val){
            if(val){
                this.initMap();
                this.loadEventsLayer();
            }
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
            var featureEvents = getFeatures(this.eventsGeoJson, 'output');
            var recentCoordinate = geojsonEvents.geometries[0].coordinates;
            var map = new mapboxgl.Map({
                container: 'map',
                style: 'mapbox://styles/usergroup/cjqgq0x5m81vc2soitj9bem5u',
                center: recentCoordinate,
                zoom: 10,
                minZoom: 4
            });

            map.on('load', function () {
                map.addSource("reach-events", {
                    type: "geojson",
                    data: {
                        "type": "FeatureCollection",
                        "features": featureEvents
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
                 closeButton: false,
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

             map.on('mouseleave', 'places', function() {
                 map.getCanvas().style.cursor = '';
                 popup.remove();
             });
        },

        loadEventsLayer(){

        },
        onEachFeature(feature, layer) {

            var popupContent = '';

            if (feature.properties && feature.properties.properties) {
                popupContent = 'Full name: <a href="#" onclick="onContactLinkClick(' +
            feature.properties.id +
            ')" data-toggle="modal" data-target="#contactDetailsModal">' +
          (typeof(feature.properties.properties.title)==='undefined' ? '' : feature.properties.properties.title) + ' ' + feature.properties.properties.name + '</a>' +
          '<br>Private contact? ' + (feature.private ? 'yes' : 'no') +
          '<br>Email address: '+(typeof(feature.properties.properties.email)==='undefined' ? '' : '<a href="mailto:'+feature.properties.properties.email+'">'+feature.properties.properties.email+'</a>') +
          '<br>Mobile: '+(typeof(feature.properties.properties.cell)==='undefined' ? '' : feature.properties.properties.cell) +
          '<br>Type of contact: '+(typeof(feature.properties.properties.type)==='undefined' ? '' : feature.properties.properties.type) +
          '<br>Organisation: '+(typeof(feature.properties.properties.employer)==='undefined' ? '' : feature.properties.properties.employer) +
          '<br>Job title: '+(typeof(feature.properties.properties.job_title)==='undefined' ? '' : feature.properties.properties.job_title);
            }

            layer.bindPopup(new L.Rrose({ autoPan: false, offset: new L.Point(0,0)}).setContent(popupContent));
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

</style>
