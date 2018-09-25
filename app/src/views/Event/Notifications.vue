<template>
    <div class="eventSubContent">
        Notifications
        <div v-if="eventNotifications">
            <span> {{reversedNotifications.length}} </span>
            <ul v-show="eventNotifications.length > 0">
                <li v-for="(elem, index) in reversedNotifications">
                    <span v-if="elem.hasOwnProperty('username')">{{elem.username}}</span>
                    <span v-else>(username N/A)</span>
                    <span> {{ (elem.notification_time*1000) | relativeTime }} </span>
                    <p> {{ elem.notification }}
                        <a v-if="elem.notificationFileUrl" :href="elem.notificationFileUrl" target="_blank">(attachment)</a>
                    </p>
                </li>
            </ul>
        </div>
        <div v-else>No updates yet </div>
    </div>
</template>

<script>
/*eslint no-unused-vars: off*/
/*eslint no-debugger: off*/
import { mapGetters } from 'vuex';
// import { EDIT_EVENT } from '@/store/actions.type';

export default {
    name: 'r-event-notifications',
    data(){
        return {
        };
    },
    components: {
        //TODO: add + edit notification
    },
    watch: {
    },
    filters: {
    },
    computed: {
        ...mapGetters([
            'eventNotifications'
        ]),
        reversedNotifications: function (){
            if(this.eventNotifications && this.eventNotifications.length > 0){

                return this.eventNotifications.slice().sort((a,b) => {
                    return b.notification_time - a.notification_time;
                });
            }
        }
    }
};

</script>
<style lang="scss">
    @import '@/assets/css/display.scss';
    @import '@/assets/css/edit.scss';
</style>
