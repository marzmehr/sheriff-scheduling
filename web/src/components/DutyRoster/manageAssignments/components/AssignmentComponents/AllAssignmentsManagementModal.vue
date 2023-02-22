<template>
    <div>
        <b-modal v-model="showModal.show" no-close-on-backdrop hide-footer centered header-class="bg-white text-light" size="xl">
            <template v-slot:modal-header>
                <b-button
                    v-if="hasPermissionToAddAssignments"
                    variant="success"
                    size="sm"
                    class="text-white px-4"
                    @click="createAssignments()">
                    Assignments +
                </b-button>
                <!-- <div style="" class="h4 mt-1 mb-n2 p-0 text-dark text-center">{{shiftDate}}</div>  -->
                <b-button
                    size="sm"
                    variant="dark"
                    class="text-white px-4"
                    @click="showModal.show=false">
                    Close
                </b-button>                            
            </template>

            <b-card no-body style="border-bottom: 1px solid #EFEFEF ; font-size: 14px; margin-top:-1rem; user-select: none;" >	
                <b-table
                    :items="dutyShiftAssignmentsWeek" 
                    :fields="fields"
                    sort-by="assignment"
                    :style="{ overflowX: 'scroll', marginBottom: '0px' }" 
                    small   
                    borderless                    
                    fixed>
                        <template v-slot:table-colgroup>
                            <col style="width:9rem">                         
                        </template>
                
                        <template v-slot:cell(assignment) ="data"  >                            
                            <manage-duty-roster-assignment v-on:change="getData" :assignment="data.item" :weekview="true"/>
                        </template>
                                                
                        <template v-slot:head()="data" >                            
                            <div v-if="data.column.substring(1,2)>=0" style="border:1px solid #EFEFEF;" class="m-0 bg-light text-center" >
                                {{getBeautifyTime(Number(data.column.substring(1,2)))}}
                            </div>
                        </template>
                
                        <template v-slot:cell()="data" >                                                                                        
                            <div v-if="data.item[data.field.key.substring(1,2)]" class="text-center m-1 py-2 text-white rounded" :style="{background:data.item.type.colorCode}">
                                {{ getAssignmentTime(data.item[data.field.key.substring(1,2)])}}
                            </div>                        
                        </template>

                </b-table>               
            </b-card>
        </b-modal>

        <create-assignments-modal :showModal="showCreateAssignments" v-on:change="getData" />
    </div>    
</template>

<script lang="ts">
    import { Component, Vue, Prop } from 'vue-property-decorator';
    import { namespace } from "vuex-class";    
    import * as _ from 'underscore';
    import moment from 'moment-timezone';

    import "@store/modules/AssignmentScheduleInformation";
	const assignmentState = namespace("AssignmentScheduleInformation");

    import "@store/modules/CommonInformation";
    const commonState = namespace("CommonInformation");

    // import { userInfoType } from '@/types/common';
    // import { allEditingDutySlotsInfoType, manageAssignmentDutyInfoType, manageAssignmentsScheduleInfoType } from '@/types/DutyRoster';

    import CreateAssignmentsModal from './CreateAssignmentsModal.vue';
    import ManageDutyRosterAssignment from './ManageDutyRosterAssignment.vue';
    import { manageAssignmentDutyInfoType, assignmentCardWeekInfoType, dutyRangeInfoType } from '@/types/DutyRoster';
    import { locationInfoType, userInfoType } from '@/types/common';


    @Component({
        components: {
            CreateAssignmentsModal,
            ManageDutyRosterAssignment
        }
    })
    export default class AllAssignmentsManagementModal extends Vue {

        @Prop({required: true})
        showModal!: {show: boolean};

        @Prop({required: true})
        shiftDate!: string;

        @commonState.State
        public userDetails!: userInfoType;

        @assignmentState.State
        public dutyShiftAssignmentsWeek!: assignmentCardWeekInfoType[];

        @assignmentState.State
		public assignmentRangeInfo!: dutyRangeInfoType;

        showCreateAssignments={show: false}
        hasPermissionToAddAssignments = false;

        fields =[
            {key:'assignment', label:'', thClass:'', tdClass:'p-0 m-0', thStyle:''},
            {key:'h0', label:'', thClass:'m-0 p-0', tdClass:'p-0 m-0 border-right', thStyle:''},
            {key:'h1', label:'', thClass:'m-0 p-0', tdClass:'p-0 m-0 border-right', thStyle:''},
            {key:'h2', label:'', thClass:'m-0 p-0', tdClass:'p-0 m-0 border-right', thStyle:''},
            {key:'h3', label:'', thClass:'m-0 p-0', tdClass:'p-0 m-0 border-right', thStyle:''},
            {key:'h4', label:'', thClass:'m-0 p-0', tdClass:'p-0 m-0 border-right', thStyle:''},
            {key:'h5', label:'', thClass:'m-0 p-0', tdClass:'p-0 m-0 border-right', thStyle:''},
            {key:'h6', label:'', thClass:'m-0 p-0', tdClass:'p-0 m-0 border-right', thStyle:''},
        ]

        mounted(){        
            this.hasPermissionToAddAssignments = this.userDetails.permissions.includes("CreateAssignments");
        }

        public createAssignments(){
            this.showCreateAssignments.show = true
        }

        public getBeautifyTime(day: number){
            return moment(this.assignmentRangeInfo.startDate).add(day, 'days').format('ddd DD MMM YYYY');
        }

        public getData(){
            this.$emit('change')
        }

        public getAssignmentTime(card){
            if(card?.assignment?.start)
                return card.assignment.start.substring(0,5) + ' - ' + card.assignment.end.substring(0,5)
            else
                return ''
        }
        
    }
</script>
<style scoped>   

    .card {
        border: white;
    }
</style>

