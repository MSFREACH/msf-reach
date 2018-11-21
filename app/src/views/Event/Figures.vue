<template>
    <div class="eventSubContent">
        Figures
        <div v-if="eventFigures">
            <div v-for="(item, index) in eventFigures.keyFigures">{{item.category | noUnderscore}},
                <i>value:</i> {{item.value}}
            </div>
            <div>
                <label>Population in total for zone impacted:</label>
                {{eventFigures.population.total.amount}}
            </div>
            <div>
                <label>Description:</label>
                {{eventFigures.population.total.description}}
            </div>
            <div>
                <label>Population affected:</label>
                {{eventFigures.population.affected.amount}}
            </div>
            <div>
                <label>Description:</label>
                {{eventFigures.population.affected.description}}
            </div>
            <div>
                <label>Percentage of people affected:</label>
                {{eventFigures.population.affected.percentage}}
            </div>
        </div>
        <div v-else>
        </div>
    </div>
</template>

<script>
/*eslint no-unused-vars: off*/
/*eslint no-debugger: off*/
import { mapGetters } from 'vuex';
// import { EDIT_EVENT } from '@/store/actions.type';
export default {
    name: 'r-event-figures',
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
            'eventFigures'
        ]),
    }
};

</script>
<style lang="scss">
    @import '@/assets/css/display.scss';
    @import '@/assets/css/edit.scss';
</style>
