<template>
    <div class="eventSubContent">
        Response
        <div v-if="eventResponse">
            <div class="quarter-width">
                <label>Project Code</label>
                {{eventProperties.project_code}}
            </div>
            <ul>
                <label>Type of programmes: </label>
                <li v-for="item in eventMsfResponse.types_of_programmes" >
                    {{item | noUnderscore | capitalize }}
                </li>
            </ul>
            <div class="description">{{eventMsfResponse.description}}</div>
            <div class="dateRange">
                <span class="start"> {{eventMsfResponse.start_date | date}} </span> to
                <span class="end">{{eventMsfResponse.end_date | date}} </span>
            </div>
            <div> <label> Location of MSF Response: </label>
                {{eventMsfResponse.location}}
                <!--TODO: insert small map annotation -->
                {{eventMsfResponse.operational_center}}
            </div>
            <div>
                <label> Medical Material: </label>
                    <ul>
                        <li v-for="item in eventMsfResponse.medical_material.items">
                            {{item}}
                        </li>
                    </ul>
                    <span>Total: {{eventMsfResponse.medical_material.total_amount}} </span>
                    <span class="date">Arrival date: {{eventMsfResponse.medical_material.arrival_date}} </span>
            </div>
            <div>
                <label> Non Medical Material: </label>
                    <ul>
                        <li v-for="item in eventMsfResponse.non_medical_material.items">
                            {{item}}
                        </li>
                    </ul>
                    <span>Total: {{eventMsfResponse.non_medical_material.total_amount}} </span>
                    <span class="date">Arrival date: {{eventMsfResponse.non_medical_material.arrival_date}} </span>
            </div>
        </div>
        <div v-else>
            No response recorded yet
        </div>

        <!-- TODO:  Editing mode + * Analysis suggestions * component-->
    </div>
</template>

<script>

/*eslint no-debugger: off*/
import { mapGetters } from 'vuex';
// import { EDIT_EVENT } from '@/store/actions.type';

export default {
    name: 'r-event-response',
    data(){
        return {
        };
    },
    components: {
        //TODO: add + edit Response
    },
    watch: {
    },
    computed: {
        ...mapGetters([
            'eventResponse',
        ]),
    }
};

</script>

<style lang="scss">
    @import '@/assets/css/display.scss';
    @import '@/assets/css/edit.scss';
</style>
