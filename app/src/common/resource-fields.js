export const VACCINATION_SUGGESTIONS =[

];

export const BUDGET_CURRENCIES = [

];

export const SUPPLY_CHAIN_SPECIALITIES = ['importation', 'regulations', 'storage'];


export const DEFAULT_RESOURCES_FIELDS = {
    perStatus: [],
    institutional_donors: [{
        from_who: null,
        amount: null
    }],
    visa_requirement: [],
    vaccination_requirement: {
        required: [],
        recommended: []
    }
};

export const DEFAULT_STATUS_RESOURCES_FIELDS = {
    status: null,
    staff: {
        listFileUrl : null,
        expatriateCount : null,
        nationalStaffCount : null
    },
    budget: {
        total: null,
        currency: null
    },
    supply_chain: {
        type: null,
        description: null
    }
};
