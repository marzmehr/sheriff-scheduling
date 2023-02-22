<template>
    <div v-if="scheduleInfo && isMounted" id="shiftBox" ref="shiftBox" :key="updateBoxes">             

        <div style="font-size: 7pt; border:none;" class="m-0 p-0" v-for="event in sortEvents(scheduleInfo)" :key="event.id + event.date + event.location">
            <!-- {{ event }} -->
            <b-row v-if="event.type == 'Shift'" class="mx-1" style="border-bottom: 1px solid #ccc;">

                <div style="text-align: left; font-weight: 700; width:25%; ">
                    <!-- <span @dblclick="selectOnlyCard(event)" style="height:100%">
                    In: {{event.startTime}} Out: {{event.endTime}}
                    </span> -->
                    
                    <div>
                        In: {{event.startTime}} 
                    </div>
                    <div>
                        Out: {{event.endTime}}
                    </div>
                    
                    <b-row class="m-0">
                        <div class="m-0" >
                            <b-form-checkbox
                                style="margin:0.0rem 0;"                                
                                v-model="checked"
                                @change="cardSelected(checked, event)">
                            </b-form-checkbox>
                        </div>
                        <div class="m-0" >
                            <b-button  
                                class="p-0" 
                                size="sm"
                                variant="transparent" 
                                @click="cardDutiesSelected(event)"
                                v-b-tooltip.hover                                
                                title="Edit"
                                ><b-icon
                                    icon="pencil-square" 
                                    font-scale="1.25" 
                                    variant="primary" 
                                    />
                            </b-button>
                        </div>
                    </b-row>
                </div>

                <div style=" width:75%; background: #9EF;">
                    <div style="font-size: 6pt; border:none;" class="m-0 p-0" v-for="duty in sortEvents(event.duties)" :key="duty.startTime">                                
                        <div :style="'color: ' + duty.color">{{duty.startTime}}-{{duty.endTime}} {{duty.dutySubType}}</div>                            
                    </div>                    
                </div>                    
            </b-row>
            <div class="text-center" v-else-if="event.type == 'Unavailable' && event.startTime.length>0">{{event.startTime}}-{{event.endTime}} Unavailable</div>
            <div class="text-center ml-3" v-else-if="event.type == 'Unavailable' && event.startTime.length==0">Unavailable</div>
            
            <div v-else-if="event.type == 'Leave'" class="text-center">
                <div v-if="event.startTime && event.subType" style="font-size: 10pt; border:none;" class="m-0 p-0" >
                    <span>{{event.startTime}}-{{event.endTime}}</span> {{ event.subType }}
                </div>                            
                <div v-else class="m-0 p-0" style="">
                    <div v-if="event.subType.toUpperCase().includes('SPL')" class="bg-spl-leave badge text-white">{{ event.subType }} Leave</div>
                    <div v-else-if="annualLeaveList.some(leave => event.subType.toUpperCase().includes(leave))" class="bg-a-l-leave badge text-white">{{ event.subType }} Leave</div>
                    <div v-else-if="healthLeaveList.some(leave => event.subType.toUpperCase().includes(leave))" class="bg-med-dental-leave badge">{{ event.subType }} Leave</div>
                    <div v-else-if="event.subType.toUpperCase().includes('STIIP')" class="bg-stiip-leave badge text-white">{{ event.subType }} Leave</div>
                    <div v-else-if="event.subType.toUpperCase().includes('CTO')" class="bg-cto-leave badge text-white">{{ event.subType }} Leave</div>
                    <div v-else-if="event.subType.toUpperCase().includes('LWOP')" class="bg-lwop-leave badge text-white">{{ event.subType }} Leave</div>
                    <div v-else-if="event.subType.toUpperCase().includes('BEREAVEMENT')" class="bg-bereavement-leave badge text-white">{{ event.subType }} Leave</div>
                    <div v-else-if="event.subType.toUpperCase().includes('TRAINING')" class="bg-training-leave badge text-white">{{ event.subType }} Leave</div>
                    <div v-else-if="event.subType.toUpperCase().includes('OVERTIME')" class="bg-overtime-leave badge text-white">{{ event.subType }} Leave</div>
                    <div v-else  class="bg-primary badge text-white">{{ event.subType }} Leave</div>
                </div>                 
                  
            </div> 

            <div v-else-if="event.type == 'Training'" class="text-center" style="display:inline;">  
                
                <div style="border-bottom: 1px solid #ccc;" class="m-0 p-0">
                    <b-badge class="bg-primary text-white" >Training</b-badge>
                </div> 
                <div style="font-size: 6pt; border:none;" class="m-0 p-0" v-if="event.subType">
                    <span v-if="event.startTime">{{event.startTime}}-{{event.endTime}}</span>
                    <span v-else > FullDay </span>  
                    {{ event.subType }}
                </div>  
            </div>   

            <div v-else-if="event.type == 'Loaned'" class="text-center" style="display:inline;">  
                <div style="border-bottom: 1px solid #ccc;" class="m-0 p-0">
                    <b-badge class="bg-primary text-white">Loaned</b-badge>
                </div>

                <div style="font-size: 6pt; border:none;" class="m-0 p-0">
                    <span v-if="event.startTime">{{event.startTime}}-{{event.endTime}}</span>
                    <span v-else > FullDay </span>
                    {{event.location}}
                </div>                            
            </div>                
        </div>

        
        <assignment-modal 
            :showModal="showEditAssignmentsDetails" 
            :sheriffName="sheriffName"
            :shiftDate="shiftDate"
            :shiftEndTime="shiftEndTime"
            :shiftStartTime="shiftStartTime"
            :dutyBlocks="dutyBlocks"
            v-on:change="getData"
            />

        <b-modal v-model="confirmUnassign" id="bv-modal-confirm-unassign" header-class="bg-warning text-light">
            <template v-slot:modal-title>
                    <h2 class="mb-0 text-light">Confirm Unassign Duty</h2>                    
            </template>
            
            <h4 v-if="dutySlotToUnassign">Are you sure you want to unassign the "{{dutySlotToUnassign.dutySubType}}" duty from {{sheriffName}}?</h4>
            
            <template v-slot:modal-footer>
                <b-button variant="danger" @click="unassignDutySlot()">Confirm</b-button>
                <b-button variant="primary" @click="$bvModal.hide('bv-modal-confirm-unassign')">Cancel</b-button>
            </template>            
            <template v-slot:modal-header-close>                 
                <b-button variant="outline-warning" class="text-light closeButton" @click="$bvModal.hide('bv-modal-confirm-unassign')"
                >&times;</b-button>
            </template>
        </b-modal>

    </div>
</template>

<script lang="ts">
    import { Component, Vue, Prop } from 'vue-property-decorator';
    import { namespace } from "vuex-class";    
    import * as _ from 'underscore';

    import "@store/modules/AssignmentScheduleInformation";
	const assignmentState = namespace("AssignmentScheduleInformation");

    import "@store/modules/CommonInformation";
    const commonState = namespace("CommonInformation");

    import { userInfoType } from '@/types/common';
    import { allEditingDutySlotsInfoType, manageAssignmentDutyInfoType, manageAssignmentsScheduleInfoType } from '@/types/DutyRoster';

    import AssignmentModal from './AssignmentComponents/AssignmentModal.vue';

    @Component({
        components: {
            AssignmentModal
        }
    })
    export default class AssignmentCard extends Vue {

        @Prop({required: true})
        scheduleInfo!: manageAssignmentsScheduleInfoType;

        @Prop({required: true})
        sheriffId!: string;

        @Prop({required: true})
        sheriffName!: string;

        @commonState.State
        public userDetails!: userInfoType;
        
        @assignmentState.State
        public selectedShifts!: string[];

        @assignmentState.Action
        public UpdateSelectedShifts!: (newSelectedShifts: string[]) => void    
        
        updateBoxes =0;
        hasPermissionToEditShifts = false;
        hasPermissionToEditDuty = false;
        hasPermissionToAddAssignDuty = false;
        isMounted = false; 
        
        editDutyError = false;
        editDutyErrorMsg = '';

        deleteErrorMsg = '';
        deleteError = false;

        showEditAssignmentsDetails = { show: false };

        healthLeaveList = ['MEDICAL', 'DENTAL', 'MED/DENTAL'];
        annualLeaveList = ['A/L', 'ANNUAL'];

        isAssignmentDataMounted = false;

        addNewDutySlotForm = false;
        addFormColor = 'secondary';
        checked = false;

        isEditOpen = false;
        latestEditData;
        confirmUnassign = false;
        dutySlotToUnassign = {} as manageAssignmentDutyInfoType;

        assignmentName = 'assignment name!!!!!';
        shiftStartTime = '';
        shiftEndTime = '';
        shiftDate = '';
        dutyDate = '';

        dutyBlocks: manageAssignmentDutyInfoType[] = [];

        // fields = [      
        //     {key:'duty',         label:'Duty',        sortable:false, tdClass: 'border-top'  },
        //     {key:'startTime',    label:'Start Time',  sortable:false, tdClass: 'border-top', thClass:'h6 align-middle',},
        //     {key:'endTime',      label:'End Time',    sortable:false, tdClass: 'border-top', thClass:'h6 align-middle',},  
        //     {key:'note',         label:'Note',        sortable:false, tdClass: 'border-top', thClass:'h6 align-middle'  },
        //     {key:'editDutySlot', label:'',            sortable:false, tdClass: 'border-top', thClass:'',}       
        // ];

        mounted() { 
            this.isMounted = false;
            this.hasPermissionToEditShifts = this.userDetails.permissions.includes("EditShifts");
            this.hasPermissionToEditDuty = this.userDetails.permissions.includes("EditDuties");            
            this.hasPermissionToAddAssignDuty = this.userDetails.permissions.includes("CreateAndAssignDuties");            
            this.isMounted = true; 
        }        

        public selectOnlyCard(block){
            if(this.hasPermissionToEditShifts && block.type=='Shift') {
                this.UpdateSelectedShifts([ block.id ]);
                this.$root.$emit('editShifts');
            }
        }

        public cardSelected(checked, block: manageAssignmentsScheduleInfoType){
            console.log(checked)
            console.log(block)
            let selectedCards = this.selectedShifts;
            if(block.type=='Shift' && block.id){
                if (!selectedCards.includes(block.id))
                    selectedCards.push(block.id);
                else
                    selectedCards = selectedCards.filter(sc => sc != block.id);
                this.UpdateSelectedShifts(selectedCards);
            }
        }

        public cardDutiesSelected(block: manageAssignmentsScheduleInfoType){            
            this.isAssignmentDataMounted = false;
            this.shiftDate = Vue.filter('beautify-date-weekday')(block.date);
            this.shiftStartTime = block.startTime;
            this.shiftEndTime = block.endTime;
            this.dutyBlocks = block.duties?block.duties:[];  
            this.dutyDate =  block.date;        
            this.showEditAssignmentsDetails.show = true;
            this.isAssignmentDataMounted = true;            
        }

        public closeEditDutyWindow(){
            this.closeDutySlotForm();
            this.showEditAssignmentsDetails.show = false;
		}

        public closeDutySlotForm() {                     
            this.addNewDutySlotForm= false; 
            this.addFormColor = 'secondary';
            if(this.isEditOpen){
                this.latestEditData.toggleDetails();
                this.isEditOpen = false;
            } 
        }

        public confirmUnassignDutySlot(slotinfo){
            this.dutySlotToUnassign = slotinfo
            this.confirmUnassign = true;
        }

        public assignDutyOverPopup(sheriffId,  allEditingDutySlotsInfo: allEditingDutySlotsInfoType[], unassignSheriff){
            // const body: assignDutyInfoType[] =[]
            // for(const editingDutySlot of allEditingDutySlotsInfo){

            //     const dutyRosterInfo = editingDutySlot.selectedDuty? editingDutySlot.selectedDuty : this.dutyRosterInfo;
            //     const editedDutySlotsInfo = [editingDutySlot.editedDutySlot];

            //     body.push(this.assignDuty(sheriffId, editedDutySlotsInfo, unassignSheriff, dutyRosterInfo ));        
            // }

            // this.postModifiedDutyRosters(body)
        }

        public unassignDutySlot(){
            this.confirmUnassign = false;
            // if(this.dutySlotToUnassign){
            //     const editedDutySlots: assignDutySlotsInfoType[] =[{
            //         startDate: '',
            //         endDate: '',
            //         isOvertime:false,
            //         dutySlotId:this.dutySlotToUnassign.dutySlotId
            //     }]
            //     const body: assignDutyInfoType[] =[]
            //     body.push(this.assignDuty(this.dutySlotToUnassign.sheriffId, editedDutySlots, true, this.dutyRosterInfo));        
            //     this.postModifiedDutyRosters(body)
            // }
        }

        public editDutySlotInfo(data) {
            if(this.addNewDutySlotForm){
                location.href = '#addDutySlotForm'
                this.addFormColor = 'danger'
            }else if(this.isEditOpen){
                //location.href = '#Ds-Time-'+this.latestEditData.item.startTimeString.substring(0,10)
                this.addFormColor = 'danger'               
            }else if(!this.isEditOpen && !data.detailsShowing){
                data.toggleDetails();
                this.isEditOpen = true;
                this.latestEditData = data
                // Vue.nextTick().then(()=>{
                //     location.href = '#Ds-Time-'+this.latestEditData.item.startTimeString.substring(0,10)
                // });
            }   
        }

        public manageDuties(){
            console.log('adding duty')
        }

        public sortEvents (events: any) {            
            return _.sortBy(events, "startTime");
        }

        created() {
            window.addEventListener("resize", this.onResize);
        }

        destroyed() {
            window.removeEventListener("resize", this.onResize);
        }

        public onResize() {          
            this.updateBoxes++;
        }

        public getData(){
            this.$emit('change')
        }

    }
</script>

<style scoped>   

    .badge{
        font-size: 10pt;
        padding:0.5rem;
        width:12rem;
    }
    .card {
        border: white;
    }

</style>