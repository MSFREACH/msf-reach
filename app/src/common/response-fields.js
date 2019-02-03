export const REPONSE_PROGRAMME_TYPES =[
    { value: 'primary_health_care', text: 'Primary Health Care' },
    { value: 'secondary_health_care', text: 'Secondary Health Care' },
    { value: 'tertiary_or_specialized_health_care', text: 'Tertiary or specialized Health Care'},
    { value: 'emergency_room', text: 'Emergency Room'},
    { value: 'food_distribution', text: 'Food Distribution' },
    { value: 'health_promotion', text: 'Health promotion'},
    { value: 'immunization', text: 'Immunization' },
    { value: 'infectious_diseases', text: 'Infectious diseases', subPrograms:[
        {value: 'hiv', text:'HIV'},
        {value: 'tb-mdrtb', text:'TB-MDRTB'},
        {value: 'meningitis', text:'Meningitis'},
        {value: 'measle', text:'Measle'},
        {value: 'yellow_fever', text:'Yellow Fever'},
        {value: 'cholera', text:'Cholera'},
        {value: 'hemorrhagic_fever', text:'Hemorrhagic fever'},
        {value: 'dengue', text:'Dengue'}
    ]},
    { value: 'maternal_health', text: 'Maternal Health' },
    { value: 'mental_health', text: 'Mental Health' },
    { value: 'surgery', text: 'Surgery' },
    { value: 'ncds', text: 'NCDs', subPrograms:[
        { value: 'hta', text: 'HTA' },
        { value: 'diabetes', text: 'Diabetes' },
        { value: 'other_ncds', text: 'Other NCDs' }
    ]},
    { value: 'nfi', text: 'NFI' },
    { value: 'ntds', text: 'NTDs' },
    { value: 'nutrition', text: 'Nutrition' },
    { value: 'peadiatrics', text: 'Peadiatrics' },
    { value: 'shelter', text: 'Shelter'},
    { value: 'WAT-SAN - hygiene', text: 'WAT-SAN'},
    { value: 'violence', text: 'Violence' },
    { value: 'others', text: 'Others' }
];
export const RESPONSE_TYPES = [
    {value: 'direct_activities', text:'Direct activities'},
    {value: 'remote_activities', text:'Remote activities'},
    {value: 'coordination', text:'Coordination'},
    {value: 'donations', text:'Donations'}
];

export const RESPONSE_INFECTIOUS_DISEASE_PROGRAMMES =[
    {value: 'hiv', text:'HIV'},
    {value: 'tb-mdrtb', text:'TB-MDRTB'},
    {value: 'meningitis', text:'Meningitis'},
    {value: 'measle', text:'Measle'},
    {value: 'yellow_fever', text:'Yellow Fever'},
    {value: 'cholera', text:'Cholera'},
    {value: 'hemorrhagic_fever', text:'Hemorrhagic fever'},
    {value: 'dengue', text:'Dengue'}
];
export const RESPONSE_NCDS_PROGRAMMES = [
    { value: 'hta', text: 'HTA' },
    { value: 'diabetes', text: 'Diabetes' },
    { value: 'other_ncds', text: 'Other NCDs' }
];

export const OPERATIONAL_CENTERS = ['OCA', 'OCBA', 'OCG', 'OCB', 'OCP'];

export const DEFAULT_RESPONSE_PROGRAMME = {
    name: null,
    value: null,
    open_date: null,
    deployment_scale: 1,
    notes: null
};
