export const EVENT_DETAIL_NAVIGATIONS = [
    { icon: 'dashboard', name: 'General', component: 'event-general', route: '/'},
    { icon: 'event_note', name: 'Notifications', component: 'event-notifications', route: '/notifications'},
    { icon: 'track_changes', name: 'Response', component: 'event-response', route: '/response'},
    { icon: 'all_out', name: 'External Capacity', component: 'event-extCapacity', route: '/extCapacity'},
    { icon: 'fingerprint', name: 'Medical Figures', component: 'event-medFigures', route: '/medFigures'},
    { icon: 'people', name: 'Staff Resources', component: 'event-resources', route: '/resources'},
    { icon: 'all_inclusive', name: 'Reflections', component: 'event-reflection', route: '/reflection'}
];

export const EVENT_TOP_NAVIGATIONS = [
    { name: 'Event Details', component: 'event-general'},
    { name: 'News Feed', component: 'placeholder'},
    { name: 'Related Contacts', component: 'placeholder'},
    { name: 'Country Details', component: 'placeholder'},
    { name: 'Related Response', component: 'placeholder'}
];
