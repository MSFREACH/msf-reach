export const DEFAULT_EVENT_METADATA = {
    name: null,
    description: null,
    event_datetime: null,
    areas:[{
        region: null,
        country: null,
        country_code: null
    }],
    status_updates: [{
        status: null,
        timestamp: null
    }],
    types: [],
    sub_types: [],
    person_incharge: {
        name: null,
        position: null
    },
    operator: {
        name: null,
        position: null
    },
    sharepoint_link: null,
    severity_measures: [{
        scale: null,
        description: null
    }]
};

export const DEFAULT_REPORT_CARD_FIELDS = {
    status: null,
    eventId: null,
    location: {
        lat: null,
        lng: null
    },
    content: {
        descrption: null,
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
    descrption: '',
    eventId: null,
    createdAt: null,
    updatedAt: null,
    files: []
};
