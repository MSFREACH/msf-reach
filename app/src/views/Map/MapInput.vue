<template>
    <v-layout row wrap>
        <v-flex xs4>
            <label> Search area for the emergency </label>
            <div id='geocoder' class='geocoder' ref="addressField"></div>
        </v-flex>
        <v-spacer></v-spacer>
        <v-flex xs6>
            <div class="one-half">
                <v-text-field type="number" step=".001" min="-90" max="90" label="Latitude" v-model="coordinates[1]" id="editEventAddressLat"></v-text-field>
            </div>
            <div class="one-half">
                <v-text-field type="number" step=".001" min="-180" max="180" label="Longitude" v-model="coordinates[0]" id="editEventAddressLng"></v-text-field>
            </div>
            <div class="reverseSuggestions">
                <v-list v-if="showSuggestion">
                    <v-list-tile v-for="item in reverseGeojson.features" :key="item.id" @click="selectReverseGeocode(item)">
                        <v-list-tile-title>{{ item.place_name }}</v-list-tile-title>
                    </v-list-tile>
                </v-list>
            </div>
        </v-flex>
        <v-flex xs12>
            <v-layout>
                <div id="newMap" class="map"></div>
            </v-layout>
        </v-flex>
    </v-layout>
</template>


<script>

import { MAPBOX_STYLES } from '@/common/map-fields';
import { FETCH_GEOJSON_POLYGON, FETCH_REVERSE_GEOCODER } from '@/store/actions.type';
import { mapGetters } from 'vuex';

/*eslint no-console: off*/
var map;
var geocoder;

export default {
    name: 'MapInput',
    data () {
        return {
            address: '',
            coordinates: [115.6628, 2.2180],
            geocodeCenter: [],
            geocodeResult: {},
            reverseGeoJson: {},
            showSuggestion: false
        };
    },
    computed: {
        ...mapGetters([
            'geojsonPolygon',
            'reverseGeojson'
        ])
    },
    mounted(){
        this.initMap();
    },
    watch:{
        address(newVal){
            if(newVal) this.getBoundaries(newVal);
        },
        coordinates(newVal){
            if(newVal) {
                map.jumpTo({center: newVal});
                if(!_.isEqual(this.reverseGeoJson.center,  newVal)){
                    this.reverseGeocode();
                }
            }
        },
        geojsonPolygon(newVal){
            if(newVal) this.addBoundaryLayer();
        },
        reverseGeojson(newVal){
            if(newVal) this.showSuggestion = true;
        }
    },
    methods: {
        initMap(){
            var mapID = this.mapId;
            var vm = this;
            map = new mapboxgl.Map({
                container: 'newMap',
                style: MAPBOX_STYLES.thematic,
                center: this.coordinates,
                zoom: 10,
                minZoom: 4
            });
            geocoder = new MapboxGeocoder({
                accessToken: mapboxgl.accessToken,
                placeholder: 'Search address/location'
            });

            // map.addControl(geocoder);
            document.getElementById('geocoder').appendChild(geocoder.onAdd(map));

            geocoder.on('result', function(payload) {
                vm.coordinates = payload.result.center;
                vm.geocodeResult = payload.result;
                vm.geocodeCenter = payload.result.center;
                vm.address = payload.result.place_name;
            });

        },
        resizeMap(){
            map.resize();
        },
        addBoundaryLayer(){
            this.clearLayer();

            map.addLayer({
                'id': 'newMapBoundary',
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
        getBoundaries(query){
            this.$store.dispatch(FETCH_GEOJSON_POLYGON, query);
        },
        clearLayer(){
            var mapLayer = map.getLayer('newMapBoundary');
            if(typeof mapLayer !== 'undefined') {
              map.removeLayer('newMapBoundary').removeSource('newMapBoundary');
            }
        },
        reverseGeocode: _.debounce(function () {
            if(!_.isEmpty(this.geocodeResult)){
                var forwardCoords = this.geocodeResult.geometry.coordinates;
                console.log(this.coordinates,forwardCoords);
                if(!_.isEqual(this.coordinates, forwardCoords)){
                    this.$store.dispatch(FETCH_REVERSE_GEOCODER, this.coordinates);
                }
            }else{
                this.$store.dispatch(FETCH_REVERSE_GEOCODER, this.coordinates);
            }

        }, 500),

        /** deprecated ----
        * When the location found
        * @param {Object} addressData Data of the found location
        * @param {Object} placeResultData PlaceResult object
        * @param {String} id Input container ID

        getAddressData: function (addressData, placeResultData, id) {
            // addressData = {
            //     administrative_area_level_1: "Berlin"
            //     country: "Germany"
            //     latitude: 52.5379507
            //     locality: "Berlin"
            //     longitude: 13.395074499999964
            //     route: "Bernauer Straße" }
            this.addressData = addressData;
            this.coordinates = [addressData.longitude, addressData.latitude];
            this.addressAutocomplete = addressData;
        },
        */
        selectReverseGeocode(item){
            this.reverseGeoJson = item;
            this.address = item.place_name;
            this.$refs.addressField.children[0].children[1].value = this.address;
            this.coordinates = item.center;
            this.showSuggestion = false;
        }
    }
};

</script>

<style lang='scss'>
    #map,
    #newMap,
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

    .geocoder {

    }
    .mapboxgl-ctrl-geocoder {
        min-width:100%;
        .geocoder-icon-search{
            display: none;
        }

        input[type='text']{
            padding: 0;
            font-size: inherit;
        }
    }

    .mapboxgl-ctrl{
        box-shadow: none;
    }
    .reverseSuggestions{
        position: absolute;
        right: 0;
        z-index: 10;
        overflow-x: hidden;
        width: 50%;
        box-shadow: 1px 5px 10px #707070;
    }
</style>
