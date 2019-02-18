<template >
    <v-container class="relatedContent" grid-list-md>
        <div class="searchHeader mb-4">
            <v-select
              :items="eventTypes"
              v-model="filterByType"
              label="Similar type of events"
            ></v-select>
            <v-btn rounded flat @click="searchInProximity" :class="showMap ? 'activeBtn': ''">Regional Proximity</v-btn>
        </div>
        <v-layout row wrap v-if="showMap">
            <v-card class="mapSection">
                <map-annotation  mapId="relatedEventsAnnotation" :coordinates="eventCoordinates"></map-annotation>
            </v-card>
        </v-layout>
        <v-layout row wrap v-else>
            <v-flex  xs12 md6 v-for="(item, i) in relatedEvents" :key="i">
                <router-link :to="{ name: 'event-general', params:{ slug:item.id}}">
                    <v-card class="relatedEventCards">
                        <div class="full-width">
                            <label>Event</label>
                            {{item.metadata.name}}
                        </div>
                        <div class="one-half">
                            <label>OPEN</label>
                            {{item.created_at}}
                        </div>
                        <div class="one-half">
                            <label>Type</label>
                            {{item.metadata.type}} {{item.metadata.sub_type}}
                        </div>
                        <div class="one-half">
                            <label>UPDATED</label>
                            {{item.updated_at | relativeTime }}
                        </div>
                        <div class="one-half">
                            <label>Status</label>
                            {{item.metadata.event_status}}
                        </div>
                        <div class="full-width">
                            <label>Description</label>
                            {{item.metadata.description}}
                        </div>
                    </v-card>
                </router-link>
            </v-flex>
        </v-layout>

    </v-container>
</template>

<script>
/*eslint no-debugger: off*/
/*eslint no-console: off*/
/*eslint no-unused-vars: off*/

import { mapGetters } from 'vuex';
import { FETCH_RELATED_EVENTS } from '@/store/actions.type';
import MapAnnotation from '@/views/Map/MapAnnotation.vue';

export default {
    name: 'RelatedEvents',
    data(){
        return {
            filterByCountry: null,
            filterByType: null,
            showMap: false
        }
    },
    components:{
        MapAnnotation
    },
    computed: {
        ...mapGetters([
            'eventMetadata',
            'eventTypes',
            'eventCoordinates',
            'relatedEventsCount',
            'isLoadingRelatedEvents',
            'relatedEvents',
            'relatedEventsGeoJson',
            'fetchRelatedEventsError'
        ])
    },
    watch: {
        filterByType(val){
            if(val){
                var params = {
                    search: val
                };
                this.showMap = false;
                this.fetchRelatedEvents(params);
            }
        }
    },
    mounted(){
        var params = {
            types: this.eventTypes
        };
        this.$store.dispatch(FETCH_RELATED_EVENTS, params);
    },
    methods: {
        fetchRelatedEvents(params){
            this.$store.dispatch(FETCH_RELATED_EVENTS, params);
        },
        searchInProximity(){
            this.showMap = true;
            var params = {
                lng: this.eventCoordinates[0],
                lat: this.eventCoordinates[1]
            };
            this.fetchRelatedEvents(params);
        }
    }
}
</script>

<style lang="scss">
@import '@/assets/css/event.scss';
@import '@/assets/css/display.scss';

.relatedEventCards{
    label{
        display: block;
    }
    padding: 21px;
    border-radius: 5px;

}
.mapSection{
    width: 100%;
    border-radius: 5px;
    overflow: hidden;
}
</style>
