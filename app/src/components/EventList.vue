<template>
    <div>
        <div v-if="isLoading" class="event-preview">
              Loading events...
        </div>
        <div v-else>
            <div v-if="events.length == 0" class="event-preview">
                No events are here... yet.
            </div>
            <r-event-preview v-for="(event, index) in events" :event="event" :key="event.id + '-event'"></r-event-preview>
            <v-pagination :pages="pages" :currentPage.sync="currentPage"></v-pagination>
        </div>
    </div>
</template>
<script>
/*eslint no-debugger: off*/
import { mapGetters } from 'vuex';
import REventPreview from '@/components/REventPreview';
import VPagination from '@/components/VPagination';

import { FETCH_EVENTS } from '@/store/actions.type';

export default {
    name: 'REventList',
    components: {
        REventPreview, VPagination
    },
    props: {
        status: {
            status: String,
            required: false,
            default: 'all'
        },
        author: {
            type: String,
            required: false
        },
        favorited: {
            type: Boolean,
            required: false
        },
        itemsPerPage: {
            type: Number,
            required: false,
            default: 10
        }
    },
    data(){
        return {
            currentPage: 1
        };
    },
    computed: {
        listConfig(){
            const { status } = this;
            const filters = {
                offset: (this.currentPage - 1) * this.itemsPerPage,
                limit: this.itemsPerPage
            };
            if (this.author) {
                filters.author = this.author;
            }
            if (this.favorited) {
                filters.favorited = this.favorited;
            }
            return { status, filters };
        },
        pages(){
            if (this.isLoading || this.eventsCount <= this.itemsPerPage) {
                return [];
            }
            return [...Array(Math.ceil(this.eventsCount / this.itemsPerPage)).keys()].map(e => e + 1);
        },
        ...mapGetters([
            'eventsCount',
            'isLoading',
            'events'
        ])
    },
    watch: {
        currentPage(newValue){
            this.listConfig.filters.offset = (newValue - 1) * this.itemsPerPage;
            this.fetchEvents();
        }
    },
    mounted () {
        this.fetchEvents();
    },
    methods: {
        fetchEvents() {
            this.$store.dispatch(FETCH_EVENTS, this.listConfig);
        },
        resetPagination() {
            this.listConfig.offset = 0;
            this.currentPage = 1;
        }
    }
};

</script>
