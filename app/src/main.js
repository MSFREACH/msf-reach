import Vue from 'vue';
import App from './App';
import router from '@/router';
import store from '@/store';
// import { CHECK_AUTH } from '@/store/actions.type';

import ApiService from '@/common/api.service';

Vue.config.productionTip = false;

ApiService.init();

// Ensure we checked auth before each page load.
router.beforeEach(
    (to, from, next) => {
        return Promise
            .all()
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
