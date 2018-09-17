<template>
    <div class="eventSubContent">
        General details:
        <h1>{{eventMetadata.name}}</h1>
        <label>Areas</label>
        <ul>
            <li v-for="(area, index) in eventMetadata.areas">
                <span v-if="area.region.length > 0"> {{area.region}} {{area.country_code}}</span>
                <span v-else>{{area.country}}</span>
                <span v-if="eventMetadata.areas.length > 1 && index < eventMetadata.areas.length"> </span>
                <span class="sub-tag" v-if="eventMetadata.severity_measures[index]">
                  <span :style="'color:'+severityColors[eventMetadata.severity_measures[index].scale-1]">{{severityLongTexts[eventMetadata.severity_measures[index].scale-1]}} severity</span>
                  <span class="notes"><br/> {{ eventMetadata.severity_measures[index].description }} </span>
                </span>
            </li>
        </ul>
        <span :class="eventMetadata.event_status + ' event-status'"> {{eventMetadata.event_status || 'monitoring'}}  </span>
        <div>
            <span v-for="type in eventTypes">{{ type | capitalize | noUnderscore }}</span>
            <!-- TODO: add pairing icon + clickable taglink -->
        </div>
        <div> Happened {{ eventCreatedAt | relativeTime }}
             <span>on {{eventMetadata.event_local_time | fullDate }} local time.</span>
        </div>
        <p>{{eventMetadata.description }}</p>
        <div>Person In charge {{ eventMetadata.incharge_name+', '+eventMetadata.incharge_position }} </div>
        <div>
            <a :href='eventMetadata.sharepoint_link' target="_blank">
                Sharepoint Link
            </a>
        </div>
        <!-- {{eventMetadata}} -->

    </div>
</template>

<script>
import { mapGetters } from 'vuex';
import { SEVERITY } from '@/common/common';
// import { EDIT_EVENT } from '@/store/actions.type';

/*eslint no-console: off*/
/*eslint no-unused-vars: off*/
/*eslint no-negated-condition: off*/

export default {
    name: 'r-event-general',
    data(){
        return {
            severityColors: SEVERITY.colors,
            severityLongTexts: SEVERITY.fullLabels
        };
    },
    components:{
        //TODO: MAP goes here
    },
    mounted:{
    },

    computed: {
        ...mapGetters([
            'eventMetadata',
            'eventTypes',
            'eventCreatedAt'
        ])
    },
    watch: {
        eventMetadata(newVal){
            if(!newVal.areas){
                var mockArea = {country: newVal.metadata.country, region: ''};
                vm.eventMetadata.areas = [mockArea];
            }

            if(!newVal.severity_measures){
                var mockSeverity = {scale: newVal.severity_scale, description: newVal.security_details};
                vm.eventMetadata.severity_measures = [mockSeverity];
            }
        }
    }
    // beforeRouteEnter(to, from, next){
    //     // TODO: CAll map loads
    // }
};

</script>

<style lang="scss">
    @import '@/assets/css/event.scss';
</style>
