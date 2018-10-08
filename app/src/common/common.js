export const GEOFORMAT = 'geojson'; // Change to topojson for prod
export const DATE_DISPLAY_FORMAT='YYYY-MM-DD';
export const DATETIME_DISPLAY_FORMAT='YYYY-MM-DD  HH:mm';

export const SEVERITY = {
    colors: ['green','orange','red'],
    labels: ['low','med','high'],
    fullLabels: ['low','medium','high']
};

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
            { value: 'yellow_fever', text: 'Yellow Fever' },
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
        ]
    },
    { value: 'search_and_rescue', text: 'Search and Rescue' },
];

export const EVENT_STATUSES = [
    { value: 'monitoring', text: 'Monitoring', icon: 'assessment' },
    { value: 'exploration', text: 'Exploration' , icon: 'accessibility_new'},
    { value: 'ongoing', text: 'Interventions', icon: 'find_replace' },
    { value: 'complete', text: 'Archived', icon: 'calendar_view_day' }
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
