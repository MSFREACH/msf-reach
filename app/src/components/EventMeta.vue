<template>
    <v-list-tile-content row>
            <!-- <router-link :to="{name: 'event', params: {'status' : event.metadata.status} }"></router-link> -->
        <span class="date"> Updated on {{event.updated_at | date }} </span>
        <template v-if="actions">
            <r-event-actions :event="event" :canModify="isCurrentUser()"></r-event-actions>
        </template>
        <template v-else>
            <!-- TODO: match user.favorite.events.indexOf(event.id) to style button -->
            <!-- NOTE: might be useful to keep a list of counts to see who's interested -->
            <v-list-tile-action>
                <v-list-tile-action-text>{{ item.action }}</v-list-tile-action-text>
                <v-icon v-if="hasFavored.indexOf(index) < 0" color="grey lighten-1">
                    star_border
                </v-icon>
                <v-icon v-else color="yellow darken-2">
                    star
                </v-icon>
            </v-list-tile-action>
        </template>
    </v-list-tile-content>
</template>


<script>
import { mapGetters } from 'vuex';
import REventActions from '@/components/EventActions';
import { FAVORITE_ADD, FAVORITE_REMOVE } from '@/store/actions.type';

export default {
    name: 'REventMeta',
    components: {
        REventActions
    },
    props: {
        event: {
            type: Object,
            required: true
        },
        actions: {
            type: Boolean,
            required: false,
            default: false
        }
    },
    computed: {
        hasFavored(){
            return false;
            // return this.currentUser.favorites.events.indexOf(this.event.id) > -1;
        },
        ...mapGetters([
            'currentUser',
            'isAuthenticated'
        ])
    },
    methods: {
        isCurrentUser(){
            if(this.currentUser.username && this.event.author.username){
                return this.currentUser.username == this.event.author.username;
            }
            return false;
        },
        toggleFavorite() {
            if(!this.isAuthenticated){
                this.$router.push({name: 'login'});
                return;
            }
            const action =  this.hasFavored ? FAVORITE_REMOVE : FAVORITE_ADD;
            this.$store.dispatch(action, this.event.slug);
        }
    }
};

</script>
