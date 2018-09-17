<template>
    <div class="eventSubContent">
        Notifications

        {{reversedNotifications.length}}
        <div v-if="eventNotifications && eventNotifications.length > 0">
            <ul >
                <li v-for="(elem, index) in reversedNotifications">
                    <span v-if="elem.hasOwnProperty('username')">{{elem.username}}</span>
                    <span v-else>(username wasn't recorded)</span>
                    <span> {{ (elem.notification_time*1000) | fullDate }} </span>
                    <p> {{ elem.notification }}
                        <a v-if="elem.notificationFileUrl" :href="elem.notificationFileUrl" target="_blank">(attachment)</a>
                    </p>
                </li>
            </ul>
        </div>
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
