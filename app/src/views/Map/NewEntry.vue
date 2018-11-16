<template>
    <v-layout row justify-center>
        <v-dialog v-model="dialog" persistent max-width="680px">
            <v-btn slot="activator">
                <v-icon> add </v-icon> area
            </v-btn>
            <v-card>

                <label> Add area for the emergency </label>
                <input type="text" class="form-control input-sm" placeholder="Search address/location..." id="editEventAddress">
                OR
                <input type="text" v-model="coordinates[0]" id="editEventAddressLat" placeholder="Latitude">
                <input type="text" v-model="coordinates[1]" id="editEventAddressLng" placeholder="Longitude">
                <button type="button" class="btn btn-info btn-sm" id="editEventAddressLocate">
                    <span class="glyphicon glyphicon-search"></span></button>
                <map-annotation :coordinates="coordinates"></map-annotation>
            </v-card>
        </v-dialog>
    </v-layout>
</template>


<script>
import MapAnnotation from '@/views/Map/MapAnnotation.vue';

export default {
    name: 'new-map-entry',
    data () {
        return {
            dialog: false,
            coordinates: [52.52, 13.40]
        };
    },
    components:{
        MapAnnotation
    }
};

</script>
