<template>
    <div class="eventSubContent">
        ExtCapacity
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
