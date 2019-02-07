import Vue from 'vue';
import Vuex from 'vuex';

import events from './events.module';
import event from './event.module';
import response from './response.module';
import eventNotification from './eventNotification.module';
import countryDetails from './countryDetails.module';

import SITREP from './SITREP.module';

import report from './report.module';
import contact from './contact.module';
import profile from './profile.module';
import util from './util.module';

import auth from './auth.module';
Vue.use(Vuex);


export default new Vuex.Store({
    modules:{
        auth,
        profile,
        events,
        event,
        response,
        eventNotification,
        countryDetails,
        SITREP,
        report,
        contact,
        util
    }
});
