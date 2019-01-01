<template>
    <v-layout row wrap>
        <v-flex xs12>
            <label> Add area for the emergency </label>
            <input type="text" class="form-control input-sm" placeholder="Search address/location..." id="editEventAddress">
            <vue-google-autocomplete ref="address"  id="createEventGeolocate"  types="" classname="form-control" placeholder="Search address/location..." v-on:placechanged="getAddressData"></vue-google-autocomplete>
            OR
            <input type="text" v-model="coordinates[0]" id="editEventAddressLat" placeholder="Latitude">
            <input type="text" v-model="coordinates[1]" id="editEventAddressLng" placeholder="Longitude">
            <button type="button" class="btn btn-info btn-sm" id="editEventAddressLocate">
            <span class="glyphicon glyphicon-search"></span></button>
        </v-flex>
        <v-flex xs12>
            <map-annotation ref="mapAnnotation" mapId="newEventEntry" :coordinates="coordinates"></map-annotation>
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
            coordinates: [52.52, 13.40]
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
            console.log('------- ', addressData, placeResultData, id);
            // addressData = {
            //     administrative_area_level_1: "Berlin"
            //     country: "Germany"
            //     latitude: 52.5379507
            //     locality: "Berlin"
            //     longitude: 13.395074499999964
            //     route: "Bernauer Straße" }
            this.coordinates = [addressData.latitude, addressData.longitude]; 
            this.addressAutocomplete = addressData;
        }
    }
};

</script>
