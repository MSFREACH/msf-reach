<template>
    <v-layout row wrap>
        <v-flex xs12>
            <label> Search area for the emergency </label>
        </v-flex>
        <v-flex xs4>
            <vue-google-autocomplete ref="address"  id="createEventGeolocate" class="full-width" types="" classname="form-control" placeholder="Search address/location..." v-on:placechanged="getAddressData"></vue-google-autocomplete>
        </v-flex>
        <v-spacer></v-spacer>
        <v-flex xs3>
            <v-text-field type="text" label="Latitude" v-model="coordinates[1]" id="editEventAddressLat"></v-text-field>
        </v-flex>
        <v-flex xs3>
            <v-text-field type="text" label="Longitude" v-model="coordinates[0]" id="editEventAddressLng"></v-text-field>
        </v-flex>
        <v-flex xs12>
            <map-annotation ref="mapAnnotation" mapId="newEventEntry" :coordinates="coordinates" geocoding></map-annotation>
        </v-flex>
    </v-layout>
</template>


<script>
import MapAnnotation from '@/views/Map/MapAnnotation.vue';
import VueGoogleAutocomplete from 'vue-google-autocomplete';
/*eslint no-console: off*/

export default {
    name: 'NewMapEntry',
    data () {
        return {
            dialog: false,
            coordinates: [115.6628, 2.2180]
        };
    },
    components:{
        MapAnnotation, VueGoogleAutocomplete
    },
    methods: {
        /**
        * When the location found
        * @param {Object} addressData Data of the found location
        * @param {Object} placeResultData PlaceResult object
        * @param {String} id Input container ID
        */
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
        getGeoJson(){



        }
    }
};

</script>
