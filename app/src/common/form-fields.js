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
        type: null,
        timestamp: null
    }],
    types: [],
    sub_types: [],
    incharge_contact: {
        local: {
            name: null,
            position: null
        },
        operator: {
            name: null,
            position: null
        }
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
