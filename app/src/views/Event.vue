<template>
    <div class ="event-page">
        <div class="sideTab">
            <a :class="[activetab == 'general' ? 'active': '']" v-on:click="activetab='general'">General</a>
            <a :class="[activetab == 'updates' ? 'active': '']" v-on:click="activetab='updates'">Updates</a>
            <a :class="[activetab == 'response' ? 'active': '']" v-on:click="activetab='response'">Response</a>
            <a :class="[activetab == 'extCapacity' ? 'active': '']" v-on:click="activetab='extCapacity'">External Capacity</a>
            <a :class="[activetab == 'medFigures' ? 'active': '']" v-on:click="activetab='medFigures'">Medical Figures</a>
            <a :class="[activetab == 'resources' ? 'active': '']" v-on:click="activetab='resources'">Staff Resources</a>
            <a :class="[activetab == 'reflections' ? 'active': '']" v-on:click="activetab='reflections'">Reflections</a>
        </div>
        <div v-if="activetab == 'general'" class="tabcontent">
            General details
            <r-event-general :payload="event.metadata"></r-event-general>
            MAP Component
        </div>
        <div v-if="activetab == 'updates'" class="tabcontent">
            updates
        </div>
        <div v-if="activetab == 'response'" class="tabcontent">
            response
        </div>
        <div v-if="activetab == 'extCapacity'" class="tabcontent">
            extCapacity
        </div>
        <div v-if="activetab == 'medFigures'" class="tabcontent">
            medFigures
        </div>
        <div v-if="activetab == 'resources'" class="tabcontent">
            resources
        </div>
        <div v-if="activetab == 'reflections'" class="tabcontent">
            reflections
        </div>
    </div>
</template>

<script>
import { mapGetters } from 'vuex';
import marked from 'marked';
import store from '@/store';
import { FETCH_EVENT } from '@/store/actions.type';
// import REventGeneral from '@/views/Event/General.vue';
/*eslint no-unused-vars: off*/

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
            activetab: 'general'
        };
    },
    components: {

    },
    beforeRouteEnter(to, from, next){
        Promise.all([
            store.dispatch(FETCH_EVENT, to.params.slug),
        ]).then((data) => {
            next();
        });
    },
    computed: {
        ...mapGetters([
            'event',
            'currentUser',
            'isAuthenticated'
        ])
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
    @import '../assets/css/sideTab.scss';

</style>
