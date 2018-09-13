<template>
    <div class="event-meta">
        <div class="info">
            <!-- <router-link :to="{name: 'event', params: {'status' : event.metadata.status} }"></router-link> -->
            <span class="date"> {{event.updated_at | date }} </span>
        </div>
        <template v-if="actions">
            <r-event-actions :event="event" :canModify="isCurrentUser()"></r-event-actions>
        </template>
        <template v-else>
            <!-- TODO: match user.favorite.events.indexOf(event.id) to style button -->
            <button class="btn btn-sm pull-xs-right"
                v-if="!actions"
                v-on:click="toggleFavorite"
                :class="{
                    'btn-primary': hasFavored,
                    'btn-outline-primary': !hasFavored
                }">
                <i class="ion-heart"></i>
                <span class="counter"> {{event.favoritesCount}}</span>
                <!-- NOTE: might be useful to keep a list of counts to see who's interested -->
            </button>
        </template>
    </div>
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
