import Vue from 'vue';
import Router from 'vue-router';

Vue.use(Router);

export default new Router({
    routes: [{
        path: '/',
        component: () => import('@/views/Landing'),
        children: [
            {
                path: '',
                name: 'landing',
                component: () => import('@/views/LandingEvents')
            },
            {
                path: 'my-events',
                name: 'landing-my-events',
                component: () => import('@/views/LandingMyEvents')
            }
        ]
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
        props: true,
        children: [
            {
                path: '',
                name: 'event-general',
                component: () => import('@/views/Event/General'),
                props: true
            },{
                path: 'notifications',
                name: 'event-notifications',
                component: () => import('@/views/Event/Notifications'),
                props: true
            },{
                path: 'response',
                name: 'event-response',
                component: () => import('@/views/Event/Response'),
                props: true
            },{
                path: 'extCapacity',
                name: 'event-extCapacity',
                component: () => import('@/views/Event/ExtCapacity'),
                props: true
            },{
                path: 'medFigures',
                name: 'event-medFigures',
                component: () => import('@/views/Event/MedFigures'),
                props: true
            },{
                path: 'resources',
                name: 'event-resources',
                component: () => import('@/views/Event/StaffResources'),
                props: true
            },{
                path: 'reflection',
                name: 'event-reflection',
                component: () => import('@/views/Event/Reflection'),
                props: true
            }
        ]
    }, {
        name: 'event-edit',
        path: '/editor/:slug?',
        component: () => import('@/views/EventEdit'),
        props: true
    }]
});