<template>
    <div class="eventSubContent">
        GENERAL TAB
        {{eventMetadata}}
    </div>
</template>

<script>
import { mapGetters } from 'vuex';

// import { EDIT_EVENT } from '@/store/actions.type';

export default {
    name: 'r-event-general',
    data(){
        return {};
    },
    components:{
        //TODO: MAP goes here
    },
    computed: {
        ...mapGetters([
            'eventMetadata'
        ])
    }
    // beforeRouteEnter(to, from, next){
    //     // TODO: CAll map loads
    // }
};

</script>
