<template>
    <div class ="event-page">
        <div class="sideTab">
            <router-link :to="{ name: 'event-general'}"> General </router-link>
            <router-link :to="{ name: 'event-notifications'}"> Notifications </router-link>
            <router-link :to="{ name: 'event-response'}"> Response </router-link>
            <router-link :to="{ name: 'event-extCapacity'}"> External Capacity </router-link>
            <router-link :to="{ name: 'event-medFigures'}"> Medical Figures </router-link>
            <router-link :to="{ name: 'event-resources'}"> Staff Resources </router-link>
            <router-link :to="{ name: 'event-reflection'}"> Reflections </router-link>
        </div>
        <router-view></router-view>

    </div>
</template>

<script>

import { mapGetters } from 'vuex';
import marked from 'marked';
import store from '@/store';
import { FETCH_EVENT } from '@/store/actions.type';
import REventGeneral from '@/views/Event/General.vue';
import REventNotification from '@/views/Event/General.vue';
import REventResponse from '@/views/Event/Response.vue';
import REventExtCapacity from '@/views/Event/ExtCapacity.vue';
import REventMedFigures from '@/views/Event/MedFigures.vue';
import REventStaffResources from '@/views/Event/StaffResources.vue';
import REventReflection from '@/views/Event/Reflection.vue';

/*eslint no-unused-vars: off*/
/*eslint no-debugger: off*/

export default {
    name: 'r-event',
    props: {
        slug: {
            type: String,
            required: true
        }
    },
    data(){
        return{

        };
    },
    components: {
        REventGeneral, REventNotification, REventResponse, REventExtCapacity, REventMedFigures, REventStaffResources
    },
    beforeRouteEnter(to, from, next){
        Promise.all([
            store.dispatch(FETCH_EVENT, to.params.slug),
        ]).then((data) => {
            next();
        });
    },
    mounted(){
    },
    computed: {
        ...mapGetters([
            'event',
            'currentUser',
            'isAuthenticated'
        ])
    },
    watch: {
    },
    methods: {
        parsedMarkdown(chunk){
            return marked(chunk);
        },
        fetchEvent() {
            this.$store.dispatch(FETCH_EVENT, this.event.id);
        }
    }
};

</script>
<style lang="scss">
    @import '@/assets/css/sideTab.scss';
    @import '@/assets/css/event.scss';

</style>
