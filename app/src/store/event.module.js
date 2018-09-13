import Vue from 'vue';
import { EventsService} from '@/common/api.service';
import { FETCH_EVENT, CREATE_EVENT, EDIT_EVENT, DELETE_EVENT, ARCHIVE_EVENT RESET_EVENT_STATE } from './actions.type';
import { RESET_STATE, SET_EVENT, UPDATE_EVENT_IN_LIST } from './mutations.type';

const initialState = {
    event: {
        metadata: {},
        status: '',
        body: {}
    } // TODO: add associated reports & contacts later
};

export const state = Object.assign({}, initialState);

export const actions = {
    [FETCH_EVENT] (state, context, eventSlug){
        // if(state.event.metadata.id == eventSlug){
        //     return state.event;
        // }else{
        return EventsService.get(eventSlug)
            .then(({data}) => {
                context.commit(SET_EVENT, data);
                return data;
            });
        // }
    },
    [CREATE_EVENT] ({ state }){
        // TODO: geojson for location validation
        return EventsService.create(state.event);
    },
    [DELETE_EVENT] (context, slug){
        return EventsService.destroy(slug);
    },
    [EDIT_EVENT] ({state}){
        // TODO: update per section only
        return EventsService.update(state.event.slug, state.event);
    },
    [RESET_EVENT_STATE] ({ commit }){
        // When cancel edits
        commit(RESET_STATE);
    },
    [ARCHIVE_EVENT] ({state}){
        // TODO: trigger missions table
        return EventsService.archive(state.event.slug, state.event);
    },
};

/* eslint no-param-reassign: ["error", { "props": false }] */
export const mutations = {
    [SET_EVENT] (state, event){
        state.event = event;
    },
    [RESET_STATE] () {
        for (let f in state){
            Vue.set(state, f, initialState[f])
        }
    }
};

const getters ={
    event (state){
        return state.event;
    }
}

export default {
    state, actions, mutations, getters
}
