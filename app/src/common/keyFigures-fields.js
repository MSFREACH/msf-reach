export const KEY_FIGURES = [
    {
        'value': 'opd', 'text': 'OPD',
        'options': [
            {'value':'<5',  'text': '<5'},
            {'value':'>5', 'text': '>5'},
            {'value':'all_ages', 'text': 'All ages'}
        ]
    },{
        'value': 'ipd', 'text': 'IPD',
        'options': [
            {'value':'<5',  'text': '<5'},
            {'value':'>5', 'text': '>5'},
            {'value':'all_ages', 'text': 'All ages'}]
    },{
        'value': 'malaria_cases', 'text': 'Malaria cases',
        'options': [
            {'value':'<5',  'text': '<5'},
            {'value':'>5', 'text': '>5'},
            {'value':'all_ages', 'text': 'All ages'}]
    },{
        'value': 'nutrition', 'text': 'Nutrition',
        'options': [
            {'value':'atfc',  'text': 'ATFC'},
            {'value':'itfc', 'text': 'ITFC'}]
    },{
        'value': 'maternal_health', 'text': 'Maternal health',
        'options': [
            {'value':'anc_total','text': 'ANC total'},
            {'value':'anc_1st_visit','text': 'ANC 1st visit'},
            {'value':'vaginal_deliveries','text': 'Vaginal deliveries'},
            {'value':'c_sections','text': 'C sections'},
            {'value':'total_deliveries','text': 'total deliveries'},
            {'value':'pnc','text': 'PNC'},
            {'value':'notified_top','text': 'Notified TOP'},
            {'value':'estimated_top ','text': 'estimated TOP '}]
    },{
        'value': 'infectious_diseases', 'text': 'Infectious Diseases',
        'options': [
            {'value':'hiv_all_cases','text':'HIV all cases'},
            {'value':'hiv_1s_lines_cases','text':'HIV 1s lines cases'},
            {'value':'hiv_1st_lines_inclusions','text':'HIV 1st lines inclusions'},
            {'value':'hiv_2nd_lines_inclusions','text':'HIV 2nd lines inclusions'},
            {'value':'hiv_2nd_lines_PMTCT inclusions','text':'HIV 2nd lines PMTCT inclusions'},
            {'value':'hiv_2nd_lines_PMTCT mothers','text':'HIV 2nd lines PMTCT mothers'},
            {'value':'hiv_2nd_lines_PMTCT babies','text':'HIV 2nd lines PMTCT babies'},
            {'value':'tb_total','text':'TB total'},
            {'value':'mdr_tb_total','text':'MDR TB total'}]
    }, {
        'value': 'surgery_and_violence', 'text': 'Surgery & violence',
        'options': [
            {'value':'surgical_interventions', 'text':'surgical interventions'},
            {'value':'sexual_violence', 'text':'sexual violence'},
            {'value':'intentional_physical_violence', 'text':'Intentional physical violence'},
            {'value':'victims_of_torture', 'text':'victims of torture'}
        ]
    }, {
        'value': 'mental_health_consultations', 'text': 'Mental health consultations'
    }, {
        'value': 'disease_outbreak', 'text': 'Disease Outbreak',
        'options': [
            {'value':'cholera_cases', 'text':'cholera cases'},
            {'value':'measle_treatment', 'text':'measle treatment'},
            {'value':'meningitis_treatments', 'text':'meningitis treatments'},
            {'value':'yellow_fever_treatment', 'text':'Yellow fever treatment'},
            {'value':'hemorragic_fever_treatments', 'text':'Hemorragic fever treatments'},
            {'value':'dengue_treatment', 'text':'Dengue treatment'}
        ]
    },{
        'value':'immunization','text': 'Immunization',
        'options':[
            {'value':'measles_vaccination_outbreak', 'text':'measles vaccination outbreak'},
            {'value':'meningittis_vaccination', 'text':'meningittis vaccination'},
            {'value':'measle_vaccination_routine', 'text':'measle vaccination routine'}
        ]
    },{
        'value': 'ntds', 'text': 'NTDs',
        'options':[
            {'value':'chaga_cases','text': 'Chaga cases'},
            {'value':'hat_cases','text': 'HAT cases'},
            {'value':'kal_azar cases','text': 'Kal azar cases'},
            {'value':'other','text': 'Others (please specify)'},
        ]
    }, {
        'value': 'cases', 'text': 'Cases',
        'options':[
            {'value':'measles_cases','text':'Measles cases'},
            {'value':'meningitis_cases','text':'Meningitis cases'},
            {'value':'other','text':'Others (please specify)'},
        ]
    },{
        'value':  'rescued_and_assisted', 'text' : 'Migrants and refugees rescued and assisted',
        'options': [
            {'value':'at_sea', 'text':'at sea'},
            {'value':'in_land', 'text':'in land'}
        ]
    }, {
        'value': 'distribution', 'text':'Distribution',
        'options': [
            {'value':'nfi_kits','text':'NFI kits (number)'},
            {'value':'shelter_kits','text':'Shelter kits (number)'},
            {'value':'water_liter','text':'Water (liter)'},
        ]
    }, {
        'value': 'sanitation', 'text':'Sanitation',
    }, {
        'value':'other',  'text': 'Others (please specify)'
    }
];

export const FIGURES_COLLECTION = [
    {'value':'survey', 'text':'Retrospective survey'},
    {'value':'surveillance', 'text':'Prospective through Surveillance'}

];

export const FIGURES_SOURCES = [
    {'value':'ministry_of_health', 'text':'Ministry of Health'},
    {'value':'msf', 'text':'MSF'},
    {'value':'other', 'text':'Other sources (please specify)'}
];

export const POPULATION_RANGES = [
    {'value': 1000, 'text': '1,000'},
    {'value': 10000, 'text': '10,000'},
    {'value': 100000, 'text': '100,000'},
    {'value': 'other', 'text': 'other'},
];

export const RISK_PERIOD = [
    {'value':'day', 'text': 'day'},
    {'value':'month', 'text': 'month'},
    {'value':'year', 'text': 'year'},
    {'value':'other', 'text': 'other'}
];
