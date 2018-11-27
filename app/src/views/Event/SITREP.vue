<template>
    <div class="eventSubContent">
        <div v-if="eventReflection">
            <label>Practical Details / Recommendations:</label>
            <div>{{eventReflection.recommendations}}</div>
            <label>Reflection / Comments on intervention:</label>
            <div>{{eventReflection.comments}}</div>
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
    name: 'r-event-sitrep',
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
            'eventReflection'
        ]),
    }
};

</script>
<style lang="scss">
    @import '@/assets/css/display.scss';
    @import '@/assets/css/edit.scss';
</style>
