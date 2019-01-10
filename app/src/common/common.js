export const GEOFORMAT = 'geojson'; // Change to topojson for prod
export const DATE_DISPLAY_FORMAT='YYYY-MM-DD';
export const DATETIME_DISPLAY_FORMAT='YYYY-MM-DD  HH:mm';

export const SEVERITY = [
    {
        color:'green',
        value: 1,
        text: 'low'
    },{
        color:'orange',
        value: 2,
        text: 'medium'
    },{
        color:'red',
        value: 3,
        text: 'high'
    }
];
export const SEVERITY_LABELS = ['low', 'medium', 'high'];

export const EVENT_TYPES = [
    { value: 'armed_conflict', text: 'Armed Conflict' },
    { value: 'disease_outbreak', text: 'Disease Outbreak',
        subTypes: [
            { value: 'cholera', text: 'Cholera' },
            { value: 'ebola', text: 'Ebola' },
            { value: 'dengue', text: 'Dengue' },
            { value: 'malaria', text: 'Malaria' },
            { value: 'measles', text: 'Measles' },
            { value: 'meningococcal_meningitis', text: 'Meningococcal Meningitis' },
            { value: 'hemorrhagic_fever', text: 'Hemorrhagic fever'},
            { value: 'yellow_fever', text: 'Yellow Fever' }
        ]
    },

    { value: 'displacement', text: 'Displacement' },
    { value: 'malnutrition', text: 'Malnutrition' },
    { value: 'natural_disaster', text: 'Natural disaster',
        subTypes: [
            { value: 'earthquake', text: 'Earthquake' },
            { value: 'volcano', text: 'Volcano' },
            { value: 'typhoon', text: 'Typhoon' },
            { value: 'flood', text: 'Flood' },
            { value: 'tsunami', text: 'Tsunami' },
            { value: 'drought', text: 'Drought' },
            { value: 'landslide', text:'Landslide'}
        ]
    },
    { value: 'search_and_rescue', text: 'Search and Rescue' },
    { value: 'other', text: 'Other'}
];

export const DEFAULT_EVENT_TYPE = {
    type: null,
    subtype: null,
    specify: null
};
export const DISEASE_OUTBREAK_TYPES = [
    { value: 'cholera', text: 'Cholera' },
    { value: 'ebola', text: 'Ebola' },
    { value: 'dengue', text: 'Dengue' },
    { value: 'malaria', text: 'Malaria' },
    { value: 'measles', text: 'Measles' },
    { value: 'meningococcal_meningitis', text: 'Meningococcal Meningitis' },
    { value: 'hemorrhagic_fever', text: 'Hemorrhagic fever'},
    { value: 'yellow_fever', text: 'Yellow Fever' },
    { value: 'other', text: 'Other'}
];


export const NATURAL_DISASTER_TYPES =[
    { value: 'earthquake', text: 'Earthquake' },
    { value: 'volcano', text: 'Volcano' },
    { value: 'typhoon', text: 'Typhoon' },
    { value: 'flood', text: 'Flood' },
    { value: 'tsunami', text: 'Tsunami' },
    { value: 'drought', text: 'Drought' },
    { value: 'landslide', text:'Landslide'},
    { value: 'other', text: 'Other'}
];


export const DEFAULT_EVENT_AREA = {
    severity: {
        scale: null,
        description: null
    }
};
export const EVENT_NOTIFICATION_CATEGORIES = [
    {text: 'ACCESS', value: 'ACCESS' },
    {text: 'NEEDS', value: 'NEEDS' },
    {text: 'CONTACTS', value: 'CONTACTS' },
    {text: 'SECURITY', value: 'SECURITY' },
    {text: 'EXPLO findings', value: 'EXPLO_FINDINGS' }
];

export const EVENT_NOTIFICATION_HEADERS = [
    { text: 'Operator', align: 'left', sortable: false, value: 'username'},
    { text: 'UPDATED', value: 'updated_at', sortable: false},
    { text: 'Category', value: 'category', sortable: false},
    { text: 'Notification', value: 'description', sortable: false},
    { text: 'Files', value: 'files.length', sortable: false}
];


export const DEFAULT_EXT_CAPACITY_HEADERS = [
    { text: 'Organization', align: 'left', value: 'name'},
    { text: 'Capacity', align: 'left', value: 'type'},
    { text: 'Date of Arrival', align: 'left', value: 'arrival_date'},
    { text: 'Deployment', align: 'left', sortable: false, value: 'deployment'},
];


export const EVENT_STATUSES = [
    { value: 'monitoring', text: 'Monitoring', icon: 'assessment' },
    { value: 'exploration', text: 'Exploration' , icon: 'accessibility_new'},
    { value: 'ongoing', text: 'Ongoing Project', icon: 'find_replace' },
    { value: 'intervention', text: 'Emergency Response', icon: 'find_replace' },
    { value: 'complete', text: 'Complete', icon: 'calendar_view_day' }
];

export const MSF_OPERATIONAL_CENTERS = ['OCA', 'OCBA', 'OCG', 'OCB', 'OCP'];
export const MSF_MEDICAL_MATERIAL = ['dengue kits', 'NFI kits'];
export const MSF_NON_MEDICAL_MATERIAL = ['tents', 'water'];

export const MSF_KEY_FIGURES = [
    'outpatient_cases',
    'inpatient_cases',
    'malaria_cases',
    'ITFC',
    'births_including_ceasarean_sections',
    'major_surgical_interventions',
    'SGBV_cases',
    'individual_mental_health_consultations',
    'group_counseling_or_mental_health_sessions',
    'cholera_cases',
    'measles_or_others_(be_specific)_vaccinations',
    'measles_cases',
    'meningitis_vaccinations',
    'migrants_and_refugees_rescued_and_assisted_at_sea',
    'dengue_cases',
    'NFI_kits_distributed',
    'shelter_kits_distributed',
    'others'
];

export const MSF_RESOURCE_CATEGORIES = [
    'logistics',
    'supply',
    'medical_or_para__medical',
    'watsan',
    'admin_HR_fin',
    'mental_health',
    'others'
];

export const COUNTRY_PARAMS = {
    'defaultCountry': 'xx',
    'preferredCountries': ['xx', 'us', 'gb', 'id', 'au', 'hk']
};

export const DEFAULT_CONTACT_TYPE = 'Current MSF Staff';

export const CONTACT_TYPES =[
    {text: 'Current MSF Staff', value: 'Current MSF Staff'},
    {text: 'Former Staff', value: 'msf_peer'},
    {text: 'Association Member', value: 'msf_associate'},
    {text: 'Supplier', value: 'Supplier'},
    {text: 'United Nations', value: 'United Nations'},
    {text: 'Government', value: 'Government'},
    {text: 'Other NGO', value: 'Other NGO'},
    {text: 'Academic', value: 'Academic'},
    {text: 'Private Medical Practice', value: 'Private Medical Practice'}
];

export const REPORT_STATUSES = ['confirmed', 'unconfirmed', 'ignored'];
export const REPORT_TYPES = ['ACCESS', 'NEEDS', 'CONTACTS', 'SECURITY'];
