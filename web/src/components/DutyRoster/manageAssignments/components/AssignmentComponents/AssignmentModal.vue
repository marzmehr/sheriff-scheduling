<template>
    <div>
        <b-modal v-model="showModal.show" no-close-on-backdrop hide-footer centered header-class="bg-primary text-light" size="lg">
            <template v-slot:modal-header>                
                <div class="h3 mb-2  text-light"> {{sheriffName}} </div>
                <div>
                    <div class="h4 text-center ml-2 p-0 mb-0">{{shiftDate}}</div>             
                    <div class="h4 text-center text-warning ml-2 p-0 mb-0"> {{shiftStartTime}} - {{shiftEndTime}}</div>                        
                </div>
                <b-button
                    v-if="hasPermissionToAddAssignDuty && hasPermissionToEditDuty"
                    class=""                    
                    @click="manageAssignments();"
                    variant="success"> 
                    Manage Assignments
                </b-button>
                <b-button
                    variant="dark"
                    class="text-white px-3"
                    @click="showModal.show=false">
                    Close
                </b-button>

            </template>

            <b-card no-body style="font-size: 14px;user-select: none;" >	
                <div>
                    <b-card no-body border-variant="light" bg-variant="white">
                        <b-table
                            :items="dutyBlocks"
                            :fields="fields"
                            head-row-variant="primary"
                            striped
                            borderless
                            small
                            sort-by="startTimeString"
                            responsive="sm">  

                            <template v-slot:head(duty)="data" >
                                <div style="">
                                    <div style="float: left; margin:.15rem .25rem 0  0; font-size:14px">
                                        {{data.label}}
                                    </div>
                                    
                                </div>
                            </template>

                            <template v-slot:cell(duty)="data" >
                                {{data.item.dutySubType}}
                            </template>

                            <template v-slot:cell(note)="data" >
                                {{data.item.dutyNotes}}
                            </template>

                            <!-- <template v-if="hasPermissionToEditDuty" v-slot:cell(editDutySlot)="data" >          
                                <b-button 
                                    style="width:1.2rem;float:right" 
                                    class="ml-1 mr-0 my-0 py-0"
                                    size="sm"
                                    variant="transparent" 
                                    @click="confirmUnassignDutySlot(data.item)"
                                    v-b-tooltip.hover                                
                                    title="Unassign"
                                    ><b-icon
                                        icon="person-x-fill" 
                                        font-scale="1.25" 
                                        variant="danger" 
                                        style="transform: translate(-8px,0);"/>
                                </b-button>
                                <b-button style="width:.75rem;float:right" 
                                    class="mx-1 my-0 py-0" 
                                    size="sm"
                                    variant="transparent" 
                                    @click="editDutySlotInfo(data)"
                                    v-b-tooltip.hover                                
                                    title="Edit"
                                    ><b-icon
                                        icon="pencil-square" 
                                        font-scale="1.25" 
                                        variant="primary" 
                                        style="transform: translate(-8px,0);"/>
                                </b-button>
                            </template> -->

                            <!-- <template v-slot:row-details="data">
                                <b-card :id="'Le-Date-'+data.item.startTime.substring(0,10)" body-class="m-0 px-0 py-1" :border-variant="addFormColor" style="border:2px solid">
                                    <add-assignment-slot-form 
                                        :formData="data.item" 
                                        :dutyBlocks="dutyBlocks"     
                                        :sheriffName="sheriffName" 
                                        :date="dutyDate"                                   
                                        v-on:submit="assignDutyOverPopup" 
                                        v-on:cancel="closeDutySlotForm" />
                                </b-card>
                            </template> -->
                        </b-table> 
                    </b-card> 
                </div>
                
            </b-card>

            <!-- <template v-slot:modal-footer>				
                <b-button
                    size="sm"
                    variant="secondary"
                    @click="closeEditDutyWindow()"
                ><b-icon-x style="padding:0; vertical-align: middle; margin-right: 0.25rem;"></b-icon-x>Close</b-button>
            </template>
            <template v-slot:modal-header-close>
                <b-button
                    variant="outline-primary"
                    class="text-light closeButton"
                    @click="closeEditDutyWindow()">
                    &times;</b-button>
            </template> -->
        </b-modal>
        <all-assignments-management-modal :showModal="showManageAssignments" :shiftDate="shiftDate" v-on:change="getData"/>
    </div>    
</template>

<script lang="ts">
    import { Component, Vue, Prop } from 'vue-property-decorator';
    import { namespace } from "vuex-class";    
    import * as _ from 'underscore';
    import moment from 'moment-timezone';

    // import "@store/modules/AssignmentScheduleInformation";
	// const assignmentState = namespace("AssignmentScheduleInformation");

    import "@store/modules/CommonInformation";
    const commonState = namespace("CommonInformation");

    // import { userInfoType } from '@/types/common';
    // import { allEditingDutySlotsInfoType, manageAssignmentDutyInfoType, manageAssignmentsScheduleInfoType } from '@/types/DutyRoster';

    import AddAssignmentSlotForm from './AddAssignmentSlotForm.vue';
    import AllAssignmentsManagementModal from './AllAssignmentsManagementModal.vue'
    import { manageAssignmentDutyInfoType } from '@/types/DutyRoster';
    import { locationInfoType, userInfoType } from '@/types/common';

    @Component({
        components: {
            AddAssignmentSlotForm,
            AllAssignmentsManagementModal
        }
    })
    export default class AssignmentModal extends Vue {

        @Prop({required: true})
        showModal!: {show: boolean};

        @Prop({required: true})
        sheriffName!: string;

        @Prop({required: true})
        shiftStartTime!: string;

        @Prop({required: true})
        shiftEndTime!: string;

        @Prop({required: true})
        shiftDate!: string;

        @Prop({required: true})
        dutyBlocks!: manageAssignmentDutyInfoType[];

        @commonState.State
        public location!: locationInfoType;

        @commonState.State
        public userDetails!: userInfoType;

        shiftDay=0
        hasPermissionToEditDuty=false
        hasPermissionToAddAssignDuty=false

        showManageAssignments={show: false}

        fields = [      
            {key:'duty',         label:'Duty',        sortable:false, tdClass: 'border-top'  },
            {key:'startTime',    label:'Start Time',  sortable:false, tdClass: 'border-top', thClass:'h6 align-middle',},
            {key:'endTime',      label:'End Time',    sortable:false, tdClass: 'border-top', thClass:'h6 align-middle',},  
            {key:'note',         label:'Note',        sortable:false, tdClass: 'border-top', thClass:'h6 align-middle'  },
            {key:'editDutySlot', label:'',            sortable:false, tdClass: 'border-top', thClass:'',}       
        ];

        mounted(){
            this.shiftDay = moment(this.shiftDate).tz(this.location.timezone).day();
            this.hasPermissionToEditDuty = this.userDetails.permissions.includes("EditDuties");            
            this.hasPermissionToAddAssignDuty = this.userDetails.permissions.includes("CreateAndAssignDuties");
        }

        public manageAssignments(){
            this.showManageAssignments.show = true
        }

        public getData(){
            this.$emit('change')
        }
        
    }
</script>

