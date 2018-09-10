import Vue from 'vue';
import Router from 'vue-router';

Vue.use(Router);

export default new Router({
    routes: [{
        path: '/',
        component: () => import('@/views/Home'),
        children: []
    }, {
        name: 'login',
        path: '/login',
        component: () => import('@/views/Login'),
        children: [
            {
                path: '',
                name: 'about',
                component: () => import('@/views/About')
            }
        ]
    }, {
        name: 'event',
        path: '/events/:slug',
        component: () => import('@/views/Event'),
        props: true
    }, {
        name: 'event-edit',
        path: '/editor/:slug?',
        component: () => import('@/views/EventEdit'),
        props: true
    }]
});
