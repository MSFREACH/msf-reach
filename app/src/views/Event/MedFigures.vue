<template>
    <div class="eventSubContent">
        Medical Figures
        <div v-if="eventMedFigures">
            <div v-for="(item, index) in eventMedFigures.keyFigures">{{item.category | noUnderscore}},
                <i>value:</i> {{item.value}}
            </div>
            <div>
                <label>Population in total for zone impacted:</label>
                {{eventMedFigures.population.total.amount}}
            </div>
            <div>
                <label>Description:</label>
                {{eventMedFigures.population.total.description}}
            </div>
            <div>
                <label>Population affected:</label>
                {{eventMedFigures.population.affected.amount}}
            </div>
            <div>
                <label>Description:</label>
                {{eventMedFigures.population.affected.description}}
            </div>
            <div>
                <label>Percentage of people affected:</label>
                {{eventMedFigures.population.affected.percentage}}
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
    name: 'r-event-medFigures',
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
            'eventMedFigures'
        ]),
    }
};

</script>
<style lang="scss">
    @import '@/assets/css/display.scss';
    @import '@/assets/css/edit.scss';
</style>
