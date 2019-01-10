<template>
    <v-layout class="detail-section" app xs9>
        <nav class="first-nav">
            <router-link
                class="first-nav-links"
                v-for="(item, index) in crossTabs"
                :key="index"
                :to="{ name: item.component, params: {'slug': $route.params.slug }}">
                {{ item.name }}
            </router-link>
        </nav>
        <router-view></router-view>
    </v-layout>
</template>
<script>

// import REvent from '@/components/Event.vue';
// import NewsFeed from '@/components/NewsFeed.vue';
// import RelatedContacts from '@/components/Contacts/RelatedContacts.vue';
// import CountryDetails from '@/components/CountryDetails.vue';
// import RelatedResponses from '@/components/RelatedResponses.vue';
import { EVENT_TOP_NAVIGATIONS } from '@/common/navigational-fields.js';

export default {
    name: 'EventNav',
    data () {
        return {
            active: null,
            contents: ['Event Details', 'News Feed', 'Related Contacts', 'Country Details', 'Related Response'],
            crossTabs : EVENT_TOP_NAVIGATIONS
        };
    },
    methods: {

    },
    components: {

    },
};
</script>
<style lang='scss'>
    @import '@/assets/css/util/typography.scss';
    @import '@/assets/css/event.scss'; 
</style>
