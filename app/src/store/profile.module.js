import ApiService from '@/common/api.service';
import { FETCH_PROFILE, FETCH_PROFILE_BOOKMARK } from './actions.type';
import { SET_PROFILE } from './mutations.type';
/*eslint no-unused-vars: off*/

const state = {
    errors: {},
    profile: {}
};

const getters = {
    profile (state) {
        return state.profile;
    }
};

const actions = {
    [FETCH_PROFILE] (context, payload) {
        const {username} = payload;
        return ApiService
            .get('profiles', username)
            .then(({data}) => {
                context.commit(SET_PROFILE, data.profile);
                return data;
            }).catch(({response}) => {
                // #todo SET_ERROR cannot work in multiple states
                // context.commit(SET_ERROR, response.data.errors)
            });
    },
    [FETCH_PROFILE_BOOKMARK] (context, payload) {
        const {username} = payload;
        return ApiService
            .post(`profiles/${username}/bookmark`)
            .then(({data}) => {
                context.commit(SET_PROFILE, data.profile);
                return data;
            }).catch(({response}) => {
                // #todo SET_ERROR cannot work in multiple states
                // context.commit(SET_ERROR, response.data.errors)
            });
    }
};

const mutations = {
    // [SET_ERROR] (state, error) {
    //   state.errors = error
    // },
    [SET_PROFILE] (state, profile) {
        state.profile = profile;
        state.errors = {};
    }
};

export default {
    state,
    actions,
    mutations,
    getters
};
