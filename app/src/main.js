import Vue from 'vue';
import App from './App';
import router from '@/router';
import store from '@/store';
import Vuetify from 'vuetify';

import { CHECK_AUTH } from '@/store/actions.type';
import Amplify from 'aws-amplify';
import config from '@/common/config.js';

Amplify.configure({
    Auth: {
        mandatorySignIn: false,
        region: config.cognito.REGION,
        userPoolId: config.cognito.USER_POOL_ID,
        identityPoolId: config.cognito.IDENTITY_POOL_ID,
        userPoolWebClientId: config.cognito.APP_CLIENT_ID
    },
    Storage: {
        region: config.s3.REGION,
        bucket: config.s3.BUCKET,
        identityPoolId: config.cognito.IDENTITY_POOL_ID
    },
    API: {
        endpoints: [
            {
                name: 'msf-reach',
                endpoint: config.apiGateway.URL,
                region: config.apiGateway.REGION
            },
        ]
    }
});

import ApiService from '@/common/api.service';
import DateFilter from '@/common/date.filter';
import TextFilter from '@/common/text.filter';

Vue.config.productionTip = false;
Vue.filter('date', DateFilter.dateOnly);
Vue.filter('dateTime', DateFilter.dateTime);
Vue.filter('fullDate', DateFilter.fullDate);
Vue.filter('relativeTime', DateFilter.relativeTime);

Vue.filter('capitalize', TextFilter.capitalize);
Vue.filter('noUnderscore', TextFilter.noUnderscore);
Vue.filter('toArray', TextFilter.toArray);

Vue.use(Vuetify);

ApiService.init();

// Ensure we checked auth before each page load.
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
