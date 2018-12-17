/*eslint no-debugger: off*/
/*eslint no-console: off*/

import Vue from 'vue';
import { EventNotificationService } from '@/common/api.service';
import { FETCH_EVENT_NOTIFICATIONS, CREATE_EVENT_NOTIFICATION, EDIT_EVENT_NOTIFICATION, DELETE_EVENT_NOTIFICATION } from './actions.type';
import { FETCH_START, FETCH_EVENT_NOTIFICATIONS_END, SET_ERROR, RESET_STATE, SET_EVENT_NOTIFICATION } from './mutations.type';

const initialState = {
    error: null,
    eventNotifications:[],
    isLoadingEventNotifications: true,
    eventNotificationsCount: 0,
    eventnotification: {
        id: '',
        eventId: '',
        category: '',
        created: null,
        updated: null,
        description: '',
        username: '',
        files: []
    }
};

const state = Object.assign({}, initialState);
const getters = {
    eventNotificationsCount(state){
        return state.eventNotificationsCount;
    },
    eventNotifications(state){
        return state.eventNotifications;
    },
    fetchEventNotificationError(state){
        return state.error;
    }
};

const actions = {
    [FETCH_EVENT_NOTIFICATIONS]({commit}, params){
        commit(FETCH_START);
        return EventNotificationService.query(params)
            .then(({ data }) => {
                commit(FETCH_EVENT_NOTIFICATIONS_END, data.result);
            })
            .catch((error) => {
                commit(SET_ERROR, error);
            });
    },
    [CREATE_EVENT_NOTIFICATION] (context, params){
        // TODO: geojson for location validation
        return EventNotificationService.create(params);
    },
    [DELETE_EVENT_NOTIFICATION] (context, slug){
        return EventNotificationService.destroy(slug);
    },
    [EDIT_EVENT_NOTIFICATION] (context, params){
        console.log('[EDIT_EVENT_NOTIFICATION] --- -', params);
        var slug = params.id;
        delete params.id;
        return EventNotificationService.update(slug, params);
    }
};


/* eslint no-param-reassign: ["error", { "props": false }] */
const mutations = {
    [FETCH_START] (state) {
        state.isLoadingEventNotifications = true;
    },
    [FETCH_EVENT_NOTIFICATIONS_END] (state, payload){
        console.log(payload); //eslint-disable-line no-console
        state.eventNotifications = payload;
        state.eventNotificationsCount = payload.length;
        state.isLoadingEventNotifications = false;
    },
    [SET_ERROR] (state, error) {
        state.error = error;
        state.isLoadingEventNotifications = false;
    },
    [SET_EVENT_NOTIFICATION] (state, slug){
        state.notification = state.notifications.filter(item => item.id == slug);
    },
    [RESET_STATE] () {
        for (let f in state){
            Vue.set(state, f, initialState[f]);
        }
    }
};

export default {
    state, getters, actions, mutations
};
