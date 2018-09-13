/*eslint no-debugger: off*/
/*eslint no-unused-vars :off*/
import _ from 'lodash';
import { EventsService } from '@/common/api.service';
import { FETCH_EVENTS } from './actions.type';
import { FETCH_START, FETCH_EVENTS_END, UPDATE_EVENT_IN_LIST } from './mutations.type';

const state = {
    events: [],
    isLoading: true,
    eventsCount: 0
};

const getters = {
    eventsCount(state){
        return state.eventsCount;
    },
    events(state){
        return state.events;
    },
    isLoading(state){
        return state.isLoading;
    }
};

const actions = {
    [FETCH_EVENTS] ({ commit }, params){
        commit(FETCH_START);
        return EventsService.query(params)
            .then(({ data }) => {
                commit(FETCH_EVENTS_END, data.result);
            })
            .catch((error) => {
                throw new Error(error);
            });
    }
};

/* eslint no-param-reassign: ["error", { "props": false }] */
const mutations = {
    [FETCH_START] (state) {
        state.isLoading = true;
    },
    [FETCH_EVENTS_END] (state, payload){
        // TODO: // // Add popups see: [mapAllEvents] parse GeoJSON here
        console.log(payload); //eslint-disable-line no-console
        state.events = _.map(payload.objects.output.geometries, function(item){
            return item.properties;
        });
        state.eventsCount = payload.objects.output.geometries.length;
        state.isLoading = false;
    },
    [UPDATE_EVENT_IN_LIST] (state, data){
        state.events = state.events.map((event) => {
            if(event.slug !== data.slug) { return event; }
            // shallow copy the data in case
            event.metadata = data.metadata;
            return event;
        });
    }
};

export default {
    state, getters, actions, mutations
};
