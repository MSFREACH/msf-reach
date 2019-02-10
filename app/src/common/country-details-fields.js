export const DEFAULT_COUNTRY_DETAILS_ROW = {
    category: null,
    type: null,
    metadata: {
        name: null,
        operational_center: null,
        url: null,
        description: null
    }
};


export const CD_DETAILS_TYPES = {
    link: 'add link',
    file: 'upload file'
};

export const CD_DETAILS_CATEGORIES = [
    {text: 'Country Strategic Paper', value: 'strategy', inputs: ['link', 'file']},
    {text: 'Security', value: 'security', inputs: ['link', 'file']},
    {text: 'Eprep Mission Documents', value: 'mission', inputs: ['link', 'file']},
    {text: 'Eprep Toolbox', value: 'toolbox', inputs: ['link']},
    {text: 'Document Repository', value: 'document_repo', inputs: ['link']},
    {text: 'Maps Center', value: 'map', inputs: ['link', 'file']},
];

export const CD_DEFAULT_VIEW = 'CIAFactbook'; 
