export const EVENT_DETAIL_NAVIGATIONS = [
    { icon: 'dashboard', name: 'General', component: 'event-general', route: '/'},
    { icon: 'event_note', name: 'Notifications', component: 'event-notifications', route: '/notifications'},
    { icon: 'track_changes', name: 'Responses', component: 'event-responses', route: '/responses'},
    { icon: 'all_out', name: 'External Capacity', component: 'event-extCapacity', route: '/extCapacity'},
    { icon: 'fingerprint', name: 'Figures', component: 'event-figures', route: '/figures'},
    { icon: 'people', name: 'Resources', component: 'event-resources', route: '/resources'},
    { icon: 'all_inclusive', name: 'SITREP', component: 'event-sitrep', route: '/sitrep'}
];

export const EVENT_TOP_NAVIGATIONS = [
    { name: 'Event Details', component: 'event-general'},
    { name: 'News Feed', component: 'placeholder'},
    { name: 'Related Contacts', component: 'placeholder'},
    { name: 'Country Details', component: 'country-details'},
    { name: 'Related Response', component: 'related-events'}
];

export const STATUS_CHANGE_STEPPERS = {
    monitoring :[],
    exploration :[{
        section: 'Notifications',
        component: 'event-notifications',
        fields: ['explo-findings']
    }, {
        section: 'Figures',
        component: 'event-figures',
        fields: ['total-beneficiaries', 'key-figures']
    }, {
        section: 'Resources',
        component: 'event-resources',
        fields: ['staff-list', 'visa-requirements', 'vaccination-requirements', 'total-budget', 'institutional-donors']
    }],
    ongoing :[{
        section: 'Response',
        component: 'event-responses',
        fields: ['project-code', 'programmes', 'response-type', 'start-date', 'end-date', 'location', 'oc', 'supply-spec', 'sharepoint']
    },{
        section: 'Figures',
        component: 'event-figures',
        fields: ['total-beneficiaries', 'key-figures']
    },{
        section: 'Resources',
        component: 'event-resources',
        fields: ['staff-list', 'expatriates', 'national-staff']
    }],
    intervention :[{
        section: 'Response',
        component: 'event-responses',
        fields: ['project-code', 'programmes', 'response-type', 'start-date', 'end-date', 'location', 'oc', 'supply-spec', 'sharepoint']
    },{
        section: 'Figures',
        component: 'event-figures',
        fields: ['total-beneficiaries', 'key-figures']
    },{
        section: 'Resources',
        component: 'event-resources',
        fields: ['staff-list', 'expatriates', 'national-staff']
    }],
    complete :[{
        section: 'General',
        component: 'event-general',
        fields: ['project-history', 'emergency-date', 'end-date', 'last-contact']
    },{
        section: 'Response',
        component: 'event-responses',
        fields: ['end-date']
    }]
};
