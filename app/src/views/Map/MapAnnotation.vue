<template>
    <v-layout>
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.3.4/dist/leaflet.css" integrity="sha512-puBpdR0798OZvTTbP4A8Ix/l+A4dHDD0DGqYW6RQ+9jxkRFclaxxQb/SJAWZfWAkuyeQUytO7+7N4QKrDh+drA==" crossorigin=""/>
        <div :id="mapId" class="map"></div>
        <v-btn color="white" small class="anchor-nav" fab absolute bottom right>
            <v-icon>map</v-icon>
        </v-btn>
    </v-layout>
</template>
<script>
/*eslint no-console: off*/
/*eslint no-unused-vars: off*/
/*eslint no-negated-condition: off*/
/*eslint no-debugger: off*/

import L from 'leaflet';
// import 'leaflet/dist/leaflet.css';
import { TILELAYER_TERRAIN, TILELAYER_SATELLITE, TILELAYER_HOTOSM } from '@/common/map-fields';

export default {
    name: 'map-annotation',
    props: {
        coordinates: {
            type: Array
        },
        mapId:{
            type: String,
            required: true
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
        this.initMap();
        this.initLayers();
    },
    watch: {
        coordinates(newVal){
            console.log('newVal ---coordinates-- ', newVal);
            this.map.setView([newVal[0], newVal[1]], 10);
            this.map.invalidateSize();
        }
    },
    methods: {
        initMap(){
            var mapID = this.mapId;
            this.map = L.map(this.mapId, {dragging: !L.Browser.mobile, tap:false});
            // TILE LAYER OPTIONS
            this.tileLayer.terrain = L.tileLayer(TILELAYER_TERRAIN.URL, TILELAYER_TERRAIN.OPTIONS);
            this.tileLayer.satellite = L.tileLayer(TILELAYER_SATELLITE.URL, TILELAYER_SATELLITE.OPTIONS);
            this.tileLayer.HotOSM = L.tileLayer(TILELAYER_HOTOSM.URL, TILELAYER_HOTOSM.OPTIONS);
            // SWITCH CASES FROM USER PREFERENCE
            this.tileLayer.HotOSM.addTo(this.map);  // Defaul use OpenStreetMap_hot

            this.map.scrollWheelZoom.disable();
            this.map.doubleClickZoom.disable();
            this.map.setView([this.coordinates[0], this.coordinates[1]], 10);

            var eventMarker = L.marker([this.coordinates[0], this.coordinates[1]]).addTo(this.map);
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
    #map,
    #newEventEntry,
    #generalAnnotation{
        display: block;
        width: 100%;
        height: 500px; // **height require by leaflet
    }

    .anchor-nav{
        z-index: 11;
        bottom: 12px;
    }

    .generalContainer{
        .leaflet-top, .leaflet-bottom {
            z-index: 5 !important;
        }
        .leaflet-pane {
            z-index: 10 !important;
        }
    }

</style>
