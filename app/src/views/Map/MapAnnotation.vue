<template>
    <v-layout>
        <div :id="mapId" class="map"></div>
        <v-btn color="white" small class="anchor-nav" fab absolute right>
            <router-link :to="{ name: 'map-main', params: { eventId: $route.params.slug}}">
                <v-icon>map</v-icon>
            </router-link>
        </v-btn>
    </v-layout>
</template>
<script>
/*eslint no-console: off*/
/*eslint no-unused-vars: off*/
/*eslint no-negated-condition: off*/
/*eslint no-debugger: off*/

import { mapGetters } from 'vuex';
import { MAPBOX_STYLES } from '@/common/map-fields';
import { FETCH_GEOJSON_POLYGON } from '@/store/actions.type';
import { getFeaturesFromArcs } from '@/lib/geojson-util';

var map;
export default {
    name: 'map-annotation',
    props: {
        coordinates: {
            type: Array
        },
        mapId:{
            type: String,
            required: true
        },
        geocoding: {
            type: Boolean
        },
        address:{
            type: Object
        }
    },
    data(){
        return{
            map: null,
            layers: [{
                id: 0,
                name: 'areas',
                active: false,
                features: [{

                }]
            }],
            styleLoaded: false
        };
    },
    computed: {
        ...mapGetters([
            'geojsonPolygon',
            'responsesGeoJson',
        ])
    },
    mounted(){
        this.initMap();
        // this.initLayers();

        if(this.address){
            this.getBoundaries();
        }

    },
    watch: {
        address(newVal){
            this.getBoundaries();
        },
        coordinates(newVal){
            if(newVal) map.jumpTo({center: newVal});
        },
        geojsonPolygon(newVal){
            if(newVal) this.addBoundaryLayer();
        },
        '$route' (to, from){
            var oldLayer = this.mapId + from.params.slug;
            map.removeLayer(oldLayer);
        },
        responsesGeoJson(newVal){
            if(newVal) this.addResponseAreasLayer();
        }
    },
    methods: {
        initMap(){
            var mapID = this.mapId;
            var vm = this;
            map = new mapboxgl.Map({
                container: mapID,
                style: MAPBOX_STYLES.thematic,
                center: this.coordinates,
                zoom: 10,
                minZoom: 4
            });

            map.on('style.load', _ => {
                vm.styleLoaded;
            });
        },
        // TODO:// load layers & TOggle layers in Mapbox
        // initLayers(){
        //     this.layers.forEach((layer) => {
        //         const markerFeatures = layer.features.filter(feature => feature.type === 'marker');
        //         const polygonFeatures = layer.features.filter(feature => feature.type === 'polygon');
        //
        //         markerFeatures.forEach((feature) => {
        //             feature.leafletObject = L.marker(feature.coords).bindPopup(feature.name);
        //         });
        //
        //         polygonFeatures.forEach((feature) => {
        //             feature.leafletObject = L.polygon(feature.coords).bindPopup(feature.name);
        //         });
        //     });
        // },
        // layerChanged(layerId, active){
        //     /* Show or hide the features in the layer */
        //     const layer = this.layers.find(layer => layer.id === layerId);
        //     layer.features.forEach((feature) => {
        //         /* Show or hide the feature depending on the active argument */
        //     });
        //
        //     /// toggle layer accordingly
        //     if (active) {
        //         feature.leafletObject.addTo(this.map);
        //     } else {
        //         feature.leafletObject.removeFrom(this.map);
        //     }
        // },
        addBoundaryLayer(){
            map.addLayer({
                'id':this.mapId + this.$route.params.slug,
                'type': 'fill',
                'source': {
                    'type': 'geojson',
                    'data': {
                        'type': 'Feature',
                        'geometry': this.geojsonPolygon.geojson
                    }
                },
                'layout': {},
                'paint': {
                    'fill-color': '#0374C7',
                    'fill-opacity': 0.35
                }
            })
        },
        getBoundaries(){
            // TODO: double check for street address entries
            if(this.address.region){
                var query = `${this.address.region} ${this.address.country}`
            }else{
                var query = this.address.country;
            }
            this.$store.dispatch(FETCH_GEOJSON_POLYGON, query);
        },
        addResponseAreasLayer(){
            console.log(this.responsesGeoJson);
            var formatedJson = getFeaturesFromArcs(this.responsesGeoJson, 'output');
            console.log(this.responsesGeoJson, formatedJson, JSON.stringify(formatedJson));
            map.addSource('event-responses', {
                'type': 'geojson',
                'data': {
                    'type': 'FeatureCollection',
                    'features': formatedJson
                }
            });

            map.addLayer({
                'id': `responses-boundary`,
                'type': 'fill',
                'source': 'event-responses',
                'paint': {
                    'fill-color': '#FFB677',
                    'fill-opacity': 1
                },
                'filter': ['==', '$type', 'Polygon']
            });
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
        position: absolute;
        bottom: 0;
        right: 0;
        z-index: 30 !important;
    }

</style>
