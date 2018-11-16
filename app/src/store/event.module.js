/*eslint no-debugger: off*/
import _ from 'lodash';
import Vue from 'vue';
import { EventsService} from '@/common/api.service';
import { FETCH_EVENT, CREATE_EVENT, EDIT_EVENT, DELETE_EVENT, ARCHIVE_EVENT, RESET_EVENT_STATE } from './actions.type';
import { RESET_STATE, SET_EVENT } from './mutations.type';

const initialState = {
    event: {
        metadata: {},
        coordinates: [],
        notifications: [],
        status: '',
        body: {},
        type: '',
        types: [],
        updated_at: ''
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
        state.event.metadata = payload.result.objects.output.geometries[0].properties.metadata;
        // state.event.coordinates = payload.result.objects.output.geometries[0].coordinates;
        state.event.body =payload.result.objects.output.geometries[0].properties;
        state.event.notifications = payload.result.objects.output.geometries[0].properties.metadata.notification;
        //------ future proof, when sub-content objs becomes available
        state.event.msfResponse = payload.result.objects.output.geometries[0].properties.msfResponse;
        state.event.extCapacity = payload.result.objects.output.geometries[0].properties.extCapacity;
        state.event.staffResources = payload.result.objects.output.geometries[0].properties.staffResources;
        state.event.medFigures = payload.result.objects.output.geometries[0].properties.medFigures;
        state.event.reflection = payload.result.objects.output.geometries[0].properties.reflection;
        ///------/------/------/------/------/------
        state.event.updated_at = payload.result.objects.output.geometries[0].properties.updated_at;

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
    eventMetadata (state){
        return state.event.metadata;
    },
    eventUpdatedAt (state){
        return state.event.updated_at;
    },
    eventCoordinates (state){
        return state.event.coordinates;
    },
    eventNotifications (state){
        return state.event.notifications;
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
    eventMsfResponse(state){
        if(!state.event.msfResponse && state.event.metadata){
            // then we fallback & map out the keys
            var payload = state.event.metadata;
            return {
                start_date: payload.start_date_msf_response,
                end_date: payload.end_date_msf_response,
                description: payload.msf_response,
                total_days : payload.total_days_msf_response,
                location : payload.msf_response_location, // check if object keys are copied
                medical_material : {
                    items: payload.msf_response_medical_material,
                    arrival_date : payload.msf_response_medical_material_date_arrival,
                    total_amount : payload.msf_response_medical_material_total
                },
                non_medical_material : {
                    items: payload.msf_response_non_medical_material,
                    arrival_date : payload.msf_response_non_medical_material_date_arrival,
                    total_amount : payload.msf_response_non_medical_material_total
                },
                operational_center : payload.operational_center,
                types_of_programmes : payload.msf_response_types_of_programmes
            };
        }
    },
    eventExtCapacity(state){
        if(!state.event.extCapacity && state.event.metadata){
            var payload = state.event.metadata;
            return {
                description : payload.capacity,
                action_plan : payload.ext_capacity_action_plan,
                by_humanitarian : payload.ext_capacity_by_humanitarian,
                type_in_ground : payload.ext_capacity_type_in_ground,
                who : payload.ext_capacity_who,
                other_organizations : payload.ext_other_organizations //TODO: check obj array mapped
            };
        }
    },
    eventMedFigures(state){
        if(!state.event.medFigures && state.event.metadata){
            var payload = state.event.metadata;
            return {
                keyFigures : payload.keyMSFFigures, //TODO: check obj array mapped
                population: {
                    total:{
                        amount: payload.population_total,
                        description:payload.population_total_description
                    },
                    affected:{
                        amount: payload.population_affected,
                        description: payload.population_affected_description,
                        percentage: payload.percentage_population_affected
                    }
                }
            };
        }
    },
    eventStaffResources(state){
        if(!state.event.staffResources && state.event.metadata){
            var payload = state.event.metadata;
            return {
                budget : payload.msf_resource_budget, //TODO: check obj array mapped
                category : payload.msf_resource_category,
                institutional_donors : payload.msf_resource_institutional_donors,
                staff_expatriate : payload.msf_resource_staff_expatriate,
                staff_list : payload.msf_resource_staff_list,
                staff_national : payload.msf_resource_staff_national,
                visa_requirement : payload.msf_resource_visa_requirement, //TODO: check obj deep mapped
            };
        }
    },
    eventReflection(state){
        if(!state.event.reflection && state.event.metadata){
            var payload = state.event.metadata;
            return {
                recommendations: payload.msf_ref_com_practical_details_recomm,
                comments: payload.msf_ref_com_reflection_comments
            };
        }
    },
    eventCreatedAt(state){
        return state.event.metadata.event_datetime? state.event.metadata.event_datetime : state.event.created_at;
    }
};

export default {
    state, actions, mutations, getters
};
