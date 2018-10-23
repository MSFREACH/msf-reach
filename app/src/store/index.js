import Vue from 'vue';
import Vuex from 'vuex';

import landing from './landing.module';
import event from './event.module';
import report from './report.module';
import contact from './contact.module';
import profile from './profile.module';
import util from './util.module';

import auth from './auth.module';
Vue.use(Vuex);


export default new Vuex.Store({
    modules:{
        landing,
        auth,
        profile,
        event,
        report,
        contact,
        util
    }
});
