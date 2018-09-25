<template>
    <div class="eventSubContent">
        ExtCapacity
        <div v-if="eventExtCapacity">
            <label>Analysis of capacity on the ground:</label>
            <div class="type">{{eventExtCapacity.type_in_ground =='medical' ? 'Medical' : 'Non-Medical'}}</div>
            <div class="description">{{eventExtCapacity.description}}</div>
            <div>{{eventExtCapacity.by_humanitarian}}</div>
            <div>{{eventExtCapacity.action_plan}}</div>
            <div>{{eventExtCapacity.who}}</div>
            <label>Other organizations:</label>
            <section v-for="(item, index) in eventExtCapacity.other_organizations">
              <div>
                  {{item.name}} - {{item.deployment}} - <span class="date"> {{item.arrival_date | date}} </span>
              </div>
            </section>
        </div>
        <div v-else>
            Not available
        </div>

    </div>
</template>

<script>
/*eslint no-unused-vars: off*/
/*eslint no-debugger: off*/
import { mapGetters } from 'vuex';
// import { EDIT_EVENT } from '@/store/actions.type';
export default {
    name: 'r-event-extCapacity',
    data(){
        return {
        };
    },
    components: {
        //TODO: add + edit
    },
    watch: {
    },
    filters: {
    },
    computed: {
        ...mapGetters([
            'eventExtCapacity'
        ]),
    }
};

</script>
<style lang="scss">
    @import '@/assets/css/display.scss';
    @import '@/assets/css/edit.scss';
</style>
