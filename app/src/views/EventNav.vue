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
    .detail-section{
        background: #D0D3DA;
    }
    .first-nav{
        background: #E8E8E8;
        height: 40px;
        width: -webkit-fill-available;
        border-bottom: 1px solid #ccc;
    }
    .first-nav-links{
        color: #2B2024;
        padding: 9px 23px;
        display: inline-block;
    }
    .first-nav-links.router-link-active{
        color: #FFF;
        background: #0374C7;
    }
</style>
