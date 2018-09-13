import Vue from 'vue';
import Vuex from 'vuex';

import landing from './landing.module';
import auth from './auth.module';
Vue.use(Vuex);


export default new Vuex.Store({
    modules:{
        landing,
        auth
    }
});
