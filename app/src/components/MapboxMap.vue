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
            var recentCoordinate = geojsonEvents.geometries[0].coordinates;
            var map = new mapboxgl.Map({
                container: 'map',
                style: 'mapbox://styles/usergroup/cjqgq0x5m81vc2soitj9bem5u',
                center: recentCoordinate,
                zoom: 10
            });


            console.log(' geoJson ----- ',geojsonEvents );
            map.on('load', function () {
                map.addSource("reach-events", {
                    type: "geojson",
                    data: geojsonEvents
                    // cluster: true,
                    // clusterMaxZoom: 14, // Max zoom to cluster points on
                    // clusterRadius: 50
                });

                map.addLayer({
                    id: "event-epicenter",
                    type: "circle",
                    source: "reach-events",
                    paint: {
                        // Use step expressions (https://www.mapbox.com/mapbox-gl-js/style-spec/#expressions-step)
                       // with three steps to implement three types of circles:
                       //   * Blue, 20px circles when point count is less than 100
                       //   * Yellow, 30px circles when point count is between 100 and 750
                       //   * Pink, 40px circles when point count is greater than or equal to 750
                       "circle-color": [
                           "step",
                           ["get", "point_count"],
                           "#51bbd6",
                           100,
                           "#f1f075",
                           750,
                           "#f28cb1"
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
