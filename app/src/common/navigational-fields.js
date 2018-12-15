export const EVENT_DETAIL_NAVIGATIONS = [
    { icon: 'dashboard', name: 'General', component: 'event-general', route: '/'},
    { icon: 'event_note', name: 'Notifications', component: 'event-notifications', route: '/notifications'},
    { icon: 'track_changes', name: 'Response', component: 'event-response', route: '/response'},
    { icon: 'all_out', name: 'External Capacity', component: 'event-extCapacity', route: '/extCapacity'},
    { icon: 'fingerprint', name: 'Figures', component: 'event-figures', route: '/figures'},
    { icon: 'people', name: 'Resources', component: 'event-resources', route: '/resources'},
    { icon: 'all_inclusive', name: 'SITREP', component: 'event-sitrep', route: '/sitrep'}
];

export const EVENT_TOP_NAVIGATIONS = [
    { name: 'Event Details', component: 'event-general'},
    { name: 'News Feed', component: 'placeholder'},
    { name: 'Related Contacts', component: 'placeholder'},
    { name: 'Country Details', component: 'placeholder'},
    { name: 'Related Response', component: 'placeholder'}
];
