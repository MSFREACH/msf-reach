/*eslint no-debugger: off*/
/*eslint no-unused-vars :off*/
/*eslint no-console :off*/
import _ from 'lodash';
import { EventsService } from '@/common/api.service';
import { FETCH_EVENTS, FETCH_RELATED_EVENTS} from './actions.type';
import { FETCH_START, FETCH_EVENTS_END, FETCH_RELATED_EVENT_START, FETCH_RELATED_EVENTS_END, UPDATE_EVENT_IN_LIST, SET_ERROR } from './mutations.type';

const state = {
    errors: null,
    events: [],
    isLoadingEvent: true,
    eventsCount: 0,
    eventsGeoJson: [],
    relatedEventsCount: 0,
    isLoadingRelatedEvents: false,
    relatedEvents: [],
    relatedEventsGeoJson: [],
    relatedEventsError: false
};

const getters = {
    eventsCount(state){
        return state.eventsCount;
    },
    events(state){
        return state.events;
    },
    eventsGeoJson(state){
        return state.eventsGeoJson;
    },
    isLoadingEvent(state){
        return state.isLoadingEvent;
    },
    fetchEventsError(state){
        return state.error;
    },
    relatedEventsCount(state){
        return state.relatedEventsCount;
    },
    relatedEventsGeoJson(state){
        return state.relatedEventsGeoJson;
    },
    isLoadingRelatedEvents(state){
        return state.isLoadingRelatedEvents;
    },
    relatedEvents(state){
        return state.relatedEvents;
    },
    fetchRelatedEventsError(state){
        return state.relatedEventsError;
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
                commit(SET_ERROR, error);
            });
    },
    [FETCH_RELATED_EVENTS] ({ commit }, params){
        commit(FETCH_RELATED_EVENT_START);
        return EventsService.query({params})
            .then(({ data }) => {
                console.log(' ----- hey here ----- ', data);
                commit(FETCH_RELATED_EVENTS_END, data.result);
            })
            .catch((error) => {
                commit(SET_ERROR, error);
            });
    }
};

/* eslint no-param-reassign: ["error", { "props": false }] */
const mutations = {
    [FETCH_START] (state) {
        state.isLoadingEvent = true;
    },
    [FETCH_RELATED_EVENT_START] (state) {
        state.isLoadingRelatedEvents = true;
    },
    [FETCH_EVENTS_END] (state, payload){
        // TODO: // // Add popups see: [mapAllEvents] parse GeoJSON here
        console.log(payload); //eslint-disable-line no-console

        state.eventsGeoJson = payload;
        state.events = _.map(payload.objects.output.geometries, function(item){
            return item.properties;
        });
        state.eventsCount = payload.objects.output.geometries.length;
        state.isLoadingEvent = false;
    },
    [FETCH_RELATED_EVENTS_END] (state, payload){
        console.log(payload);
        state.relatedEventsGeoJson = payload;
        state.relatedEvents = _.map(payload.objects.output.geometries, function(item){
            return item.properties;
        });
        state.relatedEventsCount = payload.objects.output.geometries.length;
        state.isLoadingRelatedEvents = false;
    },
    [UPDATE_EVENT_IN_LIST] (state, data){
        state.events = state.events.map((event) => {
            if(event.slug !== data.slug) { return event; }
            // shallow copy the data in case
            event.metadata = data.metadata;
            return event;
        });
    },
    [SET_ERROR] (state, error) {
        state.errors = error;
        state.isLoadingEvent = false;
    }
};

export default {
    state, getters, actions, mutations
};
