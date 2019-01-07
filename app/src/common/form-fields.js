export const DEFAULT_EVENT_METADATA = {
    name: null,
    description: null,
    event_datetime: null,
    areas:[],
    status_updates: [{
        status: null,
        timestamp: null
    }],
    types: [],
    sub_types: [],
    incharge_contact: {
        local: {
            name: '',
            position: ''
        },
        operator: {
            name: '',
            position: ''
        }
    },
    sharepoint_link: null,
    severity_measures: []
};

export const DEFAULT_REPORT_CARD_FIELDS = {
    status: null,
    eventId: null,
    location: {
        lat: null,
        lng: null
    },
    content: {
        description: null,
        image_link: null,
        report_tag: null,
        username: null
    }
};

export const DEFAULT_EDIT_REPORT_CARD_FIELDS = {
    status: null,
    eventId: null,
    content: {
        report_tag: null,
    }
};

export const DEFAULT_EVENT_NOTIFICATION_FIELDS = {
    category: '',
    description: '',
    eventId: null,
    created: null,
    updated: null,
    files: []
};

export const DEFAULT_EVENT_RESPONSE = {
    timestamp:'',
    status: '',
    project_code: '',
    start_date: null,
    end_date: null,
    response: {
        type: '',
        description: ''
    },
    location: {
        coordinates: [],
        type: 'Point',
        address: {
            region: '',
            country: '',
            country_code: ''
        }
    },
    type_of_programmes:[{
        name: '',
        deployment: '',
        notes: ''
    }],
    supply_chain: {
        type: '',
        description:''
    }
};

export const EXTERNAL_CAPACITY_FIELDS = {
    type: null,
    name: '',
    arrival_date: '',
    deployment: ''
};

export const EXTERNAL_CAPACITY_TYPES = ['governmental','other'];


export const DEFAULT_EVENT_FIGURES = {
    keyFigures : [{
        status: '',
        figures: []
    }],
    population: {
        total: null,
        impacted: null,
        mortality: {
            rate: null,
            population: null,
            period: null
        },
        morbidity: {
            rate: null,
            population: null,
            period: null
        }
    },
    satistics:{
        collection: null,
        source: null
    }
};

export const DEFAULT_KEY_FIGURES = {
    category: null,
    subCategory: null,
    value: null
};


export const DEFAULT_SITREP_FIELDS = {
    description: '',
    eventId: null,
    created: null,
    updated: null,
    files: []
};
