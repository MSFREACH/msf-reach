/*eslint no-debugger: off*/
/*eslint no-console: off*/

import _ from 'lodash';
import Vue from 'vue';
import { EventsService} from '@/common/api.service';
import { FETCH_EVENT, CREATE_EVENT, EDIT_EVENT, DELETE_EVENT, ARCHIVE_EVENT, RESET_EVENT_STATE } from './actions.type';
import { RESET_STATE, SET_EVENT } from './mutations.type';

const initialState = {
    event: {
        id: '',
        status: '',
        metadata: {},
        coordinates: [],
        notifications: [],
        body: {},
        types: []
    } // TODO: add associated reports & contacts later
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
        // TODO: geojson for location validation
        return EventsService.create(metadata);
    },
    [DELETE_EVENT] (context, slug){
        return EventsService.destroy(slug);
    },
    [EDIT_EVENT] ({state}){
        // TODO: update per section only
        return EventsService.update(state.event.slug, state.event);
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
        state.event = payload.result.objects.output.geometries[0];
        state.event.id = payload.result.objects.output.geometries[0].properties.id;
        state.event.metadata = payload.result.objects.output.geometries[0].properties.metadata;
        // state.event.coordinates = payload.result.objects.output.geometries[0].coordinates;
        state.event.body =payload.result.objects.output.geometries[0].properties;
        state.event.status = payload.result.objects.output.geometries[0].properties.metadata.event_status;
        //------ future proof, when sub-content objs becomes available
        state.event.responses = payload.result.objects.output.geometries[0].properties.responses;
        state.event.extCapacity = payload.result.objects.output.geometries[0].properties.extCapacity;
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
        return state.event.id;
    },
    eventProperties(state){
        return state.event.body;
    },
    eventStatus(state){
        return state.event.status;
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
                    eventId: state.event.id,
                    category: null,
                    description: item.notification,
                    created: item.notification_time,
                    updated: item.notification_time,
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
            return state.event.metadata.types;
        }

        if(state.event.type){
            var types = state.event.type.replace(/other:/g, '').split(',');
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
        if(!state.event.response && state.event.metadata){
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
                timestamp : state.event.body.updated_at,
                status: payload.event_status,
                project_code: state.event.body.project_code,
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
            var cap = payload.capacity ? payload.capacity : '';
            var action = payload.ext_capacity_action_plan ? `Action plan: \n ${payload.ext_capacity_action_plan}` : '';
            var human = payload.ext_capacity_by_humanitarian ? `Humanitarian: \n  ${payload.ext_capacity_by_humanitarian}` : '';
            var ground = payload.ext_capacity_type_in_ground ? `On Ground: \n ${payload.ext_capacity_type_in_ground}:`: '';
            var govCapacity = {
                type: 'governmental',
                name: null,
                arrival_date: null,
                deployment: cap + action + human + ground
            };

            var capacities = _.map(payload.ext_other_organizations, function(item){
                item.type = 'other';
                return item;
            });

            capacities.push(govCapacity);
            return capacities;

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

            var currentStatusStat = {
                status: payload.event_status,
                staff: {
                    listFileUrl : payload.msf_resource_staff_list,
                    expatriateCount: payload.msf_resource_staff_expatriate,
                    nationalStaffCount: payload.msf_resource_staff_national
                },
                budget : {
                    total: payload.msf_resource_budget,
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
