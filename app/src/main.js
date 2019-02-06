import Vue from 'vue';
import App from './App';
import router from '@/router';
import store from '@/store';
import Vuetify from 'vuetify';

import { CHECK_AUTH } from '@/store/actions.type';
import Amplify from 'aws-amplify';
// import Adal from 'vue-adal';
import config from '@/common/config.js';

Amplify.configure({
    Auth: {
        mandatorySignIn: false,
        region: config.cognito.REGION,
        userPoolId: config.cognito.USER_POOL_ID,
        userPoolWebClientId: config.cognito.APP_CLIENT_ID
    }
});

import ApiService from '@/common/api.service';
import DateFilter from '@/common/date.filter';
import TextFilter from '@/common/text.filter';

Vue.config.productionTip = false;
Vue.filter('date', DateFilter.dateOnly);
Vue.filter('dateTime', DateFilter.dateTime);
Vue.filter('fullDate', DateFilter.fullDate);
Vue.filter('dayMonth', DateFilter.dayMonth);

Vue.filter('relativeTime', DateFilter.relativeTime);

Vue.filter('capitalize', TextFilter.capitalize);
Vue.filter('noUnderscore', TextFilter.noUnderscore);
Vue.filter('removeSnakeCase', TextFilter.removeSnakeCase);
Vue.filter('toArray', TextFilter.toArray);
Vue.filter('renderMarkdown', TextFilter.renderMarkdown);
Vue.filter('snippetNoMarkdown', TextFilter.snippetNoMarkdown);

Vue.use(Vuetify, {
    theme: {
        primary: '#EEEEEE',
        secondary: '#D0D3DA',
        accent: '#0374C7',
        error: '#EE0000',
        editing: '#0374C7',
        // success: '#4CAF50',
        warning: '#EE0000'
    }
});

// Vue.use(Adal, {
//     // This config gets passed along to Adal, so all settings available to adal can be used here.
//     config: {
//         tenant: config.azure.TENANT_ID,
//         clientId: config.azure.CLIENT_ID,
//         redirectUri: config.azure.RETURN_URL,
//         cacheLocation: 'localStorage'
//     },
//     // Set this to true for authentication on startup
//     requireAuthOnInitialize: true,
//     // Pass a vue-router object in to add route hooks with authentication and role checking
//     router: router
// });

ApiService.init();

router.beforeEach(
    (to, from, next) => {
        return Promise
            .all([store.dispatch(CHECK_AUTH)])
            .then(next);
    }
);

/* eslint-disable no-new */
new Vue({
    el: '#app',
    router,
    store,
    template: '<App/>',
    components: { App }
});
