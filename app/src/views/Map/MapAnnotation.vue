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
import { getFeatures, getFeaturesFromArcs } from '@/lib/geojson-util';
import { EVENT_STATUSES } from '@/common/common';

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
            allStatuses: EVENT_STATUSES,
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
            'eventBoundary',
            'responsesGeoJson',
            'relatedEventsGeoJson'
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
        eventBoundary(newVal){
            if(newVal) this.addBoundaryLayer();
        },
        '$route' (to, from){
            var oldLayer = this.mapId + from.params.slug;
            if(from.params.slug != to.params.slug){
                if(map.getLayer(oldLayer)) map.removeLayer(oldLayer);
            }
        },
        responsesGeoJson(newVal){
            if(newVal) this.addResponseAreasLayer();
        },
        relatedEventsGeoJson(val){
            if(val) this.addRelatedEventsLayer();
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
                if(vm.mapId == 'responsesAnnotation'){
                    vm.addBoundaryLayer(true);
                }
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
        addBoundaryLayer(isResponse){
            if(isResponse){
                var fillStyle = {
                    'fill-outline-color': '#0374c7',
                    'fill-color': 'transparent',
                    'fill-opacity': 1
                }
            }else{
                var fillStyle = {
                    'fill-color': '#0374c7',
                    'fill-opacity': 0.35
                }
            }
            var tmpLayerId = this.mapId + this.$route.params.slug;
            var sourceId = 'event-boundary-' + this.$route.params.slug;

            if(!map.getSource(sourceId)){
                map.addSource(sourceId, {
                    'type': 'geojson',
                    'data': {
                        'type': 'Feature',
                        'geometry': this.eventBoundary.geojson
                    }
                });
            }
            if(!map.getLayer(tmpLayerId)){
                map.addLayer({
                    'id': tmpLayerId,
                    'type': 'fill',
                    'source': sourceId,
                    'layout': {},
                    'paint': fillStyle
                })
            }

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
            var formatedJson = getFeaturesFromArcs(this.responsesGeoJson, 'output');
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
                    'fill-opacity': .35
                },
                'filter': ['==', '$type', 'Polygon']
            });
        },
        addRelatedEventsLayer(){
            var geojsonEvents = this.relatedEventsGeoJson.objects.output;

            var relatedEventFeatureCollection = getFeatures(this.relatedEventsGeoJson, 'output');
            if(!_.isEmpty(this.recentCoordinates)){
                var gotoCoordinates = this.recentCoordinates; // to not lose center when refreshing
            }else{
                var gotoCoordinates = geojsonEvents.geometries[0].coordinates;
            }
            var vm = this;
            map.on('load', function () {
                var imageId = 'event-marker';
                var imageKey = "/resources/new_icons/event_open.png"
                map.loadImage(imageKey, function(error, image){
                    if(!map.hasImage(imageId)){
                        if(error) throw error;
                        map.addImage(imageId, image);
                    }
                });

                var sourceId = `related-events-${vm.$route.params.slug}`;
                if(!map.getSource(sourceId)){
                    map.addSource(sourceId, {
                        type: "geojson",
                        data: {
                            "type": "FeatureCollection",
                            "features": relatedEventFeatureCollection
                        }
                    });
                }

                map.addLayer({
                    id: "related-event-epicenter",
                    type: "symbol",
                    source: sourceId,
                    layout: {
                        "icon-image": "event-marker"
                        // "icon-size": 1
                    },
                    "filter": ["==", "$type", "Point"],
                });
            });

            // Create a popup, but don't add it to the map yet.
             var popup = new mapboxgl.Popup({
                 closeButton: true,
                 closeOnClick: false
             });

             map.on('mouseenter', 'related-event-epicenter', function(e) {
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
        }
    }

};

</script>

<style lang='scss'>
    #newEventEntry,
    #generalAnnotation,
    #responsesAnnotation,
    #relatedEventsAnnotation{
        display: block;
        width: 100%;
        height: 500px; // **height require by leaflet
    }
    #relatedEventsAnnotation{
        height: 70vh;
    }
    .anchor-nav{
        position: absolute;
        bottom: 0;
        right: 0;
        z-index: 30 !important;
    }

</style>
