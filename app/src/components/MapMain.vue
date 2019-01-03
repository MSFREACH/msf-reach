<template>
    <v-layout>
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.3.4/dist/leaflet.css" integrity="sha512-puBpdR0798OZvTTbP4A8Ix/l+A4dHDD0DGqYW6RQ+9jxkRFclaxxQb/SJAWZfWAkuyeQUytO7+7N4QKrDh+drA==" crossorigin=""/>
        <div id="map" class="map"></div>
    </v-layout>
</template>
<script>
/*eslint no-console: off*/
/*eslint no-unused-vars: off*/
/*eslint no-negated-condition: off*/
/*eslint no-debugger: off*/

import L from 'leaflet';
import { mapGetters } from 'vuex';
// import 'leaflet/dist/leaflet.css';
import { TILELAYER_REACH } from '@/common/map-fields';
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
            map: null,
            tileLayer:{
                terrain: null,
                satellite: null,
                HotOSM: null
            },
            layers: [{
                id: 0,
                name: 'areas',
                active: false,
                features: [{

                }]
            }]
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
                this.initLayers();
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
            var mapID = this.mapId;
            this.map = L.map('map', {dragging: !L.Browser.mobile, tap:false, minZoom: 4});
            this.tileLayer.reachTiles = L.tileLayer(TILELAYER_REACH.URL);
            this.tileLayer.reachTiles.addTo(this.map);  // Defaul use OpenStreetMap_hot
            var lastCoordinate = this.eventsGeoJson.objects.output.geometries[0].coordinates;
            console.log('---- hey mate----- ', lastCoordinate);
            this.map.setView([lastCoordinate[1], lastCoordinate[0]], 10);

            // var bbox = this.eventsGeoJson.bbox;
            // this.map.fitBounds([ [bbox[0], bbox[1]], [bbox[2], bbox[1]]]);

            L.control.scale().addTo(this.map);
            // event Lat/Lng :: this.eventsGeoJson.objects.output.geometries
            var eventMarker = L.marker([lastCoordinate[0], lastCoordinate[1]]).addTo(this.map);
            var vm = this;
            setTimeout(function(){ vm.map.invalidateSize(); }, 1000); /// returns error
        },
        initLayers(){
            this.layers.forEach((layer) => {
                const markerFeatures = layer.features.filter(feature => feature.type === 'marker');
                const polygonFeatures = layer.features.filter(feature => feature.type === 'polygon');

                markerFeatures.forEach((feature) => {
                    feature.leafletObject = L.marker(feature.coords).bindPopup(feature.name);
                });

                polygonFeatures.forEach((feature) => {
                    feature.leafletObject = L.polygon(feature.coords).bindPopup(feature.name);
                });
            });
        },
        layerChanged(layerId, active){
            /* Show or hide the features in the layer */
            const layer = this.layers.find(layer => layer.id === layerId);
            layer.features.forEach((feature) => {
                /* Show or hide the feature depending on the active argument */
            });

            /// toggle layer accordingly
            if (active) {
                feature.leafletObject.addTo(this.map);
            } else {
                feature.leafletObject.removeFrom(this.map);
            }
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
