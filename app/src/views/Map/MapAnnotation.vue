<template>
    <v-layout>
        {{coordinates[0]}} : {{coordinates[1]}}
        <div id="map" class="map"></div>

    </v-layout>
</template>

<script>
/*eslint no-console: off*/
/*eslint no-unused-vars: off*/
/*eslint no-negated-condition: off*/
/*eslint no-debugger: off*/

import L from 'leaflet';
// import 'leaflet/dist/leaflet.css';

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
        this.initMap();
        this.initLayers();

    },
    watch:{
        map(newVal){
            setTimeout(function(){
                newVal.invalidateSize(true);
            }, 3000);
        }
    },
    methods: {

        initMap(){
            this.map = L.map('map', {dragging: !L.Browser.mobile, tap:false}).setView([this.coordinates[0], this.coordinates[1]], 13);
            this.map.scrollWheelZoom.disable();
            this.map.doubleClickZoom.disable();

            this.tileLayer.terrain = L.tileLayer('https://api.mapbox.com/styles/v1/acrossthecloud/cj9t3um812mvr2sqnr6fe0h52/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiYWNyb3NzdGhlY2xvdWQiLCJhIjoiY2lzMWpvOGEzMDd3aTJzbXo4N2FnNmVhYyJ9.RKQohxz22Xpyn4Y8S1BjfQ', {
                attribution: '© Mapbox © OpenStreetMap © DigitalGlobe',
                minZoom: 0,
                maxZoom: 18
            });

            this.tileLayer.satellite = L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v9/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoidG9tYXN1c2VyZ3JvdXAiLCJhIjoiY2o0cHBlM3lqMXpkdTJxcXN4bjV2aHl1aCJ9.AjzPLmfwY4MB4317m4GBNQ', {
                attribution: '© Mapbox © OpenStreetMap © DigitalGlobe'
            });

            this.tileLayer.HotOSM = L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
                maxZoom: 19,
                attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, Tiles courtesy of <a href="http://hot.openstreetmap.org/" target="_blank">Humanitarian OpenStreetMap Team</a>'
            });

            this.tileLayer.HotOSM.addTo(this.map);  // Defaul use OpenStreetMap_hot

            var eventMarker = L.marker([this.coordinates[0], this.coordinates[1]]).addTo(this.map);

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
    .map{
        width: 100%;
        height: 600px; // leaflet requires map element to have height
    }


</style>
