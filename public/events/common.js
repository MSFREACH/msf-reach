/*eslint no-unused-vars: off*/

/**
 * Default event needed to make it reactive
 * @type {Object}
 */
var defaultEvent = {
    id: null,
    status: null,
    type: null,
    created_at: null,
    reportkey: null,
    metadata: {
        user_edit: null,
        notification: '',
        medicalMaterials: null,
        nonMedicalMaterials: null,

        /* << Basic Info */
        name: null,
        region: '',
        startDate: null,
        finishDate: null,
        user: null,
        event_status: '',
        event_status_date: null,
        event_datetime: null,
        event_datetime_closed: null,
        event_local_time: null,
        type_of_emergency: [], // Type of Emergency (nature)
        sub_type: null,
        incharge_position: null, // mission_contact_person.position
        incharge_name: null, // mission_contact_person.name
        mission_contact_person: {
            arrival_time: null,
            departure_time: null
        },
        exploratory_details: null,
        severity: null,
        severity_scale: 1,
        security_details: null,
        sharepoint_link: null,
        /* Basic Info >> */

        /* << MSF Response */
        msf_response_types_of_programmes: [],
        msf_response: null,
        msf_response_location: {
            coordinates: [],
            type: 'Point'
        },
        msf_response_scale: 1,
        start_date_msf_response: null,
        end_date_msf_response: null,
        total_days_msf_response: 1, // Total days of activities
        msf_response_operational_centers: [], // TODO: update managingOC on click
        operational_center: null,
        msf_response_medical_material: [],
        msf_response_medical_material_total: 0,
        msf_response_medical_material_date_arrival: null,
        msf_response_non_medical_material: [],
        msf_response_non_medical_material_total: 0,
        msf_response_non_medical_material_date_arrival: null,
        /* MSF Response >> */

        /* << External Capacity */
        ext_capacity_type_in_ground: null,
        capacity: null, // < ext_capacity_by_government
        ext_capacity_by_humanitarian: null,
        ext_capacity_action_plan: null,
        ext_capacity_who: null,
        ext_other_organizations: [],
        other_orgs: null, // TODO: set to ext_other_organizations.name on edit
        deployment: null, // TODO: set to ext_other_organizations.deployment on edit
        /* External Capacity >> */

        /* << Key Figures */
        keyMSFFigures: [],
        population_total: 0,
        population_total_description: null,
        population_affected: 0,
        population_affected_description: null,
        percentage_population_affected: 0,
        /* Key Figures >> */

        /* << MSF Resources */
        msf_resource_staff_list: null,
        msf_resource_staff_exapt: null,
        msf_resource_staff_national: null,
        msf_resource_category: '',
        msf_resource_visa_requirement: {
            nationality: {
                iso2: 'xx',
                name: null
            },
            is_required: 'yes',
            description: null
        },
        msf_resource_budget: [{
            amount: 0,
            from_who: null
        }],
        msf_resource_institutional_donors: null,
        /* MSF Resources >> */

        /* << Reflection and comments */
        msf_ref_com_practical_details_recomm: null,
        msf_ref_com_reflection_comments: null
    /* Reflection and comments >> */
    }
};

var statuses = [
    { value: 'monitoring', text: 'Monitoring' },
    { value: 'exploration', text: 'Exploration' },
    { value: 'ongoing', text: 'Ongoing Intervention (MSF activity)' },
    { value: 'complete', text: 'Complete' }
];

var emergencies = [
    { value: 'armed_conflict', text: 'Armed Conflict' },
    { value: 'displacement', text: 'Displacement' },
    { value: 'malnutrition', text: 'Malnutrition' },
    { value: 'search_and_rescue', text: 'Search and Rescue' },
    { value: 'other_emergencies', text: 'Others' }
];

var emergenciesWithTypes = [{
    emergency: 'Natural disaster',
    types: [
        { value: 'earthquake', text: 'Earthquake' },
        { value: 'volcano', text: 'Volcano' },
        { value: 'typhoon', text: 'Typhoon' },
        { value: 'flood', text: 'Flood' },
        { value: 'tsunami', text: 'Tsunami' },
        { value: 'drought', text: 'Drought' },
        { value: 'other_natural_disaster', text: 'Others' }
    ]
},
{
    emergency: 'Disease outbreak',
    types: [
        { value: 'cholera', text: 'Cholera' },
        { value: 'ebola', text: 'Ebola' },
        { value: 'dengue', text: 'Dengue' },
        { value: 'malaria', text: 'Malaria' },
        { value: 'measles', text: 'Measles' },
        { value: 'meningococcal_meningitis', text: 'Meningococcal Meningitis' },
        { value: 'yellow_fever', text: 'Yellow Fever' },
        { value: 'other_disease_outbreak', text: 'Others' }
    ]
}
];

var msfTypeOfProgrammes = [
    { value: 'primary_health_care', text: 'Primary Health Care' },
    { value: 'secondary_health_care', text: 'Secondary Health Care' },
    {
        value: 'tertiary_or_specialized_health_care',
        text: 'Tertiary or specialized Health Care'
    },
    { value: 'nfi', text: 'nfi' },
    { value: 'vaccination', text: 'Vaccination' },
    { value: 'therapeutic_feeding', text: 'Therapeutic Feeding' },
    { value: 'food_distribution', text: 'Food Distribution' },
    { value: 'shelter', text: 'Shelter' },
    { value: 'WAT-SAN', text: 'WAT-SAN' },
    { value: 'mental_health', text: 'Mental Health' },
    { value: 'sexual_reproductive_health', text: 'Sexual Reproductive Health' },
    { value: 'others', text: 'Others' }
];

var msfOperationalCenters = ['OCA', 'OCBA', 'OCG', 'OCB', 'OCP'];

var msfMedicalMaterials = ['dengue kits', 'NFI kits'];
var msfNonMedicalMaterials = ['tents', 'water'];

var keyMSFFigures = [
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

var msfResourceCategories = [
    'logistics',
    'supply',
    'medical_or_para__medical',
    'watsan',
    'admin_HR_fin',
    'mental_health',
    'others'
];
