export const MAPBOX_STYLES = {
    thematic: 'mapbox://styles/msfhk/cjroob8dq413f2smtih8x97xb',
    terrain: 'mapbox://styles/msfhk/cjqyk9p1c9r6o2rscym6nt90f',
    satellite: 'mapbox://styles/mapbox/satellite-streets-v11',
    humanitarian: 'mapbox://styles/mapbox/light-v10'
};


export const MAP_FILTERS = [
    {label: 'Events', value: 'events', subItems: [
        {label:'Monitoring', value: 'monitoring'},
        {label:'Ongoing', value: 'ongoing'},
        {label:'Emergency Reponse', value: 'intervention'},
        {label:'Exploration', value: 'exploration'},
        {label:'Complete', value: 'complete'}
    ]},
    {label: 'Reports', value: 'reports', subItems: [
        {label: 'Access', value:'access'},
        {label: 'Contacts', value:'contacts'},
        {label: 'Needs', value:'needs'},
        {label: 'Security', value:'security'},
    ]},
    {label: 'Contacts', value: 'contacts', subItems: [
        {label: 'MSF Staff', value: 'internal'},
        {label: 'External', value: 'external'}
    ]}
    // {label: 'RSS Feeds', value: 'rssFeeds', subItems: [
    //     {label: 'Advisory', value: 'advisory'},
    //     {label: 'Information', value: 'information'},
    //     {label: 'Warning', value: 'warning'},
    //     {label: 'Watch', value: 'watch'}
    // ]}
];

export const MAP_LAYERS_ID = {
    EVENTS: {
        HEATMAP: 'events-heat',
        EPICENTER: 'events-epicenter',
        EPICENTER_ICON: 'events-epicenter-icons',
        CLUSTER_COUNT: 'events-cluster-count',
        UNCLUSTER_POINTS: 'events-unclustered-point'
    },
    REPORTS: {
        ACCESS: 'reports_access'
    }
};
