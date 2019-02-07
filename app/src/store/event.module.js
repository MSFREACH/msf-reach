/*eslint no-debugger: off*/
/*eslint no-console: off*/

import _ from 'lodash';
import Vue from 'vue';
import { EventsService} from '@/common/api.service';
import { FETCH_EVENT, CREATE_EVENT, EDIT_EVENT, DELETE_EVENT, ARCHIVE_EVENT, RESET_EVENT_STATE,
    EDIT_EVENT_RESPONSES, EDIT_EVENT_EXT_CAPACITY, EDIT_EVENT_FIGURES, EDIT_EVENT_RESOURCES } from './actions.type';
import { RESET_STATE, SET_EVENT } from './mutations.type';

const initialState = {
    eventId: null,
    eventProperties:null,
    event: {
        status: '',
        type: '',
        coordinates: {},
        metadata: {
            areas: []
        },
        properties: {},
        responses: {},
        extCapacity: {},
        figures: {},
        resources: {}
    }
};

const state = Object.assign({}, initialState);

const actions = {
    [FETCH_EVENT] (context, eventSlug, prevEvent){
        // avoid duplicate network call if event was already set from list
        if(prevEvent != undefined){
            return context.commit(SET_EVENT, prevEvent);
        }
        return EventsService.get(eventSlug)
            .then(({data}) => {
                context.commit(SET_EVENT, data);
                return data;
            });
    },
    [CREATE_EVENT] (context, metadata){
        return EventsService.create(metadata);
    },
    [DELETE_EVENT] (context, slug){
        return EventsService.destroy(slug);
    },
    [EDIT_EVENT] ({state}, payload){
        return EventsService.update(state.eventId, payload);
    },
    [EDIT_EVENT_RESPONSES]({state}){
        var payload = {
            responses: state.event.responses
        };
        return EventsService.updateResponses(state.eventId, payload);
    },
    [EDIT_EVENT_EXT_CAPACITY]({state}){
        var payload = {
            extCapacity: state.event.extCapacity
        };
        return EventsService.updateExtCapacity(state.eventId, payload);
    },
    [EDIT_EVENT_FIGURES]({state}){
        var payload = {
            figures: state.event.figures
        };
        return EventsService.updateFigures(state.eventId, payload);
    },
    [EDIT_EVENT_RESOURCES]({state}){
        var payload = {
            resources: state.event.resources
        };
        return EventsService.updateResources(state.eventId, payload);
    },
    [RESET_EVENT_STATE] ({ commit }){
        // When cancel edits
        commit(RESET_STATE);
    },
    [ARCHIVE_EVENT] ({state}){
        // TODO: trigger missions table
        return EventsService.archive(state.event.slug, state.event);
    },
};

/* eslint no-param-reassign: ["error", { "props": false }] */
const mutations = {
    [SET_EVENT] (state, payload){
        // state.event = payload.result.objects.output.geometries[0];
        state.eventId = payload.result.objects.output.geometries[0].properties.id;
        state.eventProperties = payload.result.objects.output.geometries[0].properties;
        state.event.metadata = payload.result.objects.output.geometries[0].properties.metadata;
        state.event.coordinates = payload.result.objects.output.geometries[0].coordinates;
        state.event.status = payload.result.objects.output.geometries[0].properties.metadata.event_status;
        //------ future proof, when sub-content objs becomes available
        state.event.responses = payload.result.objects.output.geometries[0].properties.responses;
        state.event.extCapacity = payload.result.objects.output.geometries[0].properties.extcapacity;
        state.event.resources = payload.result.objects.output.geometries[0].properties.resources;
        state.event.figures = payload.result.objects.output.geometries[0].properties.figures;
        ///------/------/------/------/------/------

    },
    [RESET_STATE] () {
        for (let f in state){
            Vue.set(state, f, initialState[f]);
        }
    }
};

const getters ={
    event (state){
        return state.event;
    },
    currentEventId(state){
        return state.eventId;
    },
    eventProperties(state){
        return state.eventProperties;
    },
    eventStatus(state){
        return state.event.status;
    },
    eventAreas(state){
        return state.event.metadata.areas;
    },
    eventMetadata (state){
        return state.event.metadata;
    },
    eventCoordinates (state){
        return state.event.coordinates;
    },
    oldEventNotifications (state){
        var currentNotifications = state.event.metadata.notification;
        if(currentNotifications){
            return currentNotifications.map(item => {
                var currentFiles = item.notificationFileUrl ? [item.notificationFileUrl] : [];
                var newSchema = {
                    eventId: state.eventId,
                    category: null,
                    description: item.notification,
                    created: new Date(item.notification_time * 1000).toISOString(), // units in exisitng db is different
                    username: item.username,
                    files: currentFiles
                };
                return newSchema;
            });
        }else{
            return [];
        }
    },
    eventTypes(state){
        if(state.event.metadata.types){
            var compactTypes = _.compact(state.event.metadata.types);
            var compactSubTypes =  _.compact(state.event.metadata.sub_types);
            return compactTypes.concat(compactSubTypes);
        }

        if(state.eventProperties && state.eventProperties.type){
            var types = state.eventProperties.type.replace(/other:/g, '').split(',');
            var cTypes = _.compact(types);
            _.remove(cTypes, function(t){
                return t.indexOf('disease_outbreak') > -1 || t.indexOf('natural_disaster') > -1 ;
            });

            var subTypes = state.event.metadata.sub_type ? state.event.metadata.sub_type.replace(/other_disease_outbreak:/g, '').replace(/other_natural_disaster:/g, '').split(',') : '';
            var cSubTypes = _.compact(subTypes);

            return cTypes.concat(cSubTypes);
        }
    },
    eventResponses(state){
        if(!state.event.responses && state.event.metadata){
            // then we fallback & map out the keys

            var payload = state.event.metadata;
            if(!payload.msf_response){
                return null;
            }

            var programmes = [];
            var currentPrograms = payload.msf_response_types_of_programmes;
            if(currentPrograms && currentPrograms.length > 0){
                for(var i=0; i < currentPrograms.length; i++){
                    programmes.push({
                        'name': currentPrograms[i],
                        'value': currentPrograms[i].toLowerCase().replace(/ /g,'_'),
                        'deployment': null,
                        'notes':''
                    });
                }
            }

            return [{
                updated : state.eventProperties.updated_at,
                status: payload.event_status,
                project_code: state.eventProperties.project_code,
                start_date: payload.start_date_msf_response,
                end_date: payload.end_date_msf_response,
                response: {
                    type: null,
                    description: payload.msf_response,
                },
                total_days : payload.total_days_msf_response,
                location : payload.msf_response_location, // check if object keys are copied
                operational_center : payload.operational_center,
                type_of_programmes : programmes,
                supply_chain: {
                    type: null,
                    description: ''
                },
                sharepoint_link: ''
            }];
        }else{
            return state.event.responses;
        }
    },
    eventExtCapacity(state){
        if(!state.event.extCapacity && state.event.metadata){
            var payload = state.event.metadata;
            var cap = payload.capacity ? payload.capacity : null;
            var action = payload.ext_capacity_action_plan ? `Action plan: \n ${payload.ext_capacity_action_plan}` : null;
            var human = payload.ext_capacity_by_humanitarian ? `Humanitarian: \n  ${payload.ext_capacity_by_humanitarian}` : null;
            var ground = payload.ext_capacity_type_in_ground ? `On Ground: \n ${payload.ext_capacity_type_in_ground}:`: null;
            var combined = [cap, action, human, ground].filter(function(el){
                return el != null;
            });
            var capacities= [];

            if(payload.ext_other_organizations && payload.ext_other_organizations.length > 0){
                capacities = payload.ext_other_organizations.map(function(item){
                    if(!!item.name && !!item.deployment){
                        item.type = 'other';
                        return item;
                    }
                });
            }

            if(combined.length > 0){
                var govCapacity = {
                    type: 'governmental',
                    name: null,
                    arrival_date: null,
                    deployment: combined.join('\n')
                };

                capacities.push(govCapacity);
            }
            var cleanCapacities = capacities.filter(Boolean);

            return cleanCapacities;

        }else{
            return state.event.extCapacity;
        }
    },
    eventFigures(state){
        if(!state.event.figures && state.event.metadata){
            var payload = state.event.metadata;
            var currentKeyFigures = [];
            if(!_.isEmpty(payload.keyMSFFigures)){
                currentKeyFigures = [{
                    status: payload.event_status,
                    figures: payload.keyMSFFigures,
                }];
            }

            return {
                keyFigures : currentKeyFigures,
                population: {
                    total: payload.population_total,
                    impacted: payload.population_affected,
                    mortality: {
                        rate: null,
                        population: null,
                        period: null
                    },
                    morbidity: {
                        rate:null,
                        population:null,
                        period:null
                    }
                },
                satistics: {
                    collection: null,
                    source: null
                }
            };
        }else{
            return state.event.figures;
        }
    },
    eventResources(state){
        if(!state.event.resources && state.event.metadata){
            var payload = state.event.metadata;
            var nationalites = [];
            if(payload.msf_resource_visa_requirement){
                nationalites = payload.msf_resource_visa_requirement.nationality.map(item => {
                    if(item.is_required){
                        return item.name;
                    }
                });
            }

            var donors = [];
            if(payload.msf_resource_institutional_donors){
                donors = payload.msf_resource_institutional_donors.map(item =>{
                    return item.from_who +': '+ item.amount;
                });
            }
            var totalBudget = _.sumBy(payload.msf_resource_budget, function(budgetItem){
                return budgetItem.amount;
            });

            var currentStatusStat = {
                status: payload.event_status,
                staff: {
                    listFileUrl : payload.msf_resource_staff_list,
                    expatriateCount: payload.msf_resource_staff_expatriate,
                    nationalStaffCount: payload.msf_resource_staff_national
                },
                budget : {
                    total: totalBudget,
                    currency: null
                }
            };
            return {
                perStatus: [currentStatusStat],
                institutional_donors : donors,
                visa_requirement : nationalites, //TODO: check obj deep mapped
                vaccination_requirement: {
                    required: [],
                    recommended: []
                }
            };
        }else{
            return state.event.resources;
        }
    },
    oldEventReflection(state){
        var payload = state.event.metadata;
        return {
            recommendations: payload.msf_ref_com_practical_details_recomm,
            comments: payload.msf_ref_com_reflection_comments
        };
    },
    eventCreatedAt(state){
        return state.event.metadata.event_datetime? state.event.metadata.event_datetime : state.event.created_at;
    }
};

export default {
    state, actions, mutations, getters
};
