<template>
    <div class="eventSubContent">
        Human resources:
        <div v-if="eventStaffResources">
            <div><label>Staff List:</label>
                {{eventStaffResources.staff_list}}
            </div>

            <div><label>Expatriate:</label>
                {{eventStaffResources.staff_expatriate}}
            </div>

            <div><label>National staff:</label>
                {{eventStaffResources.staff_national}}
            </div>

            <div><label>Visa requirement:</label>
                {{eventStaffResources.staff_national}}
            </div>

            <label>Description:</label>
            <div v-for="item in eventStaffResources.visa_requirement.nationality">
                <span v-if="item.name"> {{item.name}} ,
                    <i>required:</i> {{item.is_required}}
                </span>
                <span v-else>No</span>
            </div>

            <div><label>Budget:</label>
                {{eventStaffResources.visa_requirement.budget}}
            </div>

            <label>Institutional Donors:</label>
            <div v-for="(item, index) in eventStaffResources.institutional_donors">
                <span v-if="(item.from_who) || (item.amount>0)">
                    <i>Amount:</i>{{item.amount}},
                    <i>From:</i>{{item.from_who}}
                </span>
                <span v-else></span>
            </div>

            <div>{{eventStaffResources.institutional_donors}}</div>
        </div>
        <div v-else>
        </div>

        <!-- TODO: * Analysis suggestions: contacts -->
    </div>
</template>

<script>
/*eslint no-unused-vars: off*/
/*eslint no-debugger: off*/
import { mapGetters } from 'vuex';
// import { EDIT_EVENT } from '@/store/actions.type';
export default {
    name: 'r-event-staff-resources',
    data(){
        return {
        };
    },
    components: {
        //TODO: add + edit
    },
    watch: {
    },
    filters: {
    },
    computed: {
        ...mapGetters([
            'eventStaffResources'
        ]),
    }
};

</script>
<style lang="scss">
    @import '@/assets/css/display.scss';
    @import '@/assets/css/edit.scss';
</style>
