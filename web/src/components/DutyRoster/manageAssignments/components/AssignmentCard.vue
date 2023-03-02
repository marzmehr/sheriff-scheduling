<template>
    <div v-if="scheduleInfo && isMounted" id="shiftBox" ref="shiftBox" :key="updateBoxes">             

        <div style="font-size: 7pt; border:none;" class="m-0 p-0" >
            <!-- {{ sheriffEvent }} -->
            <b-row v-if="sheriffEvent.type == 'Shift'" class="mx-1" style="">

                <div style="text-align: left; font-weight: 700; width:30%; ">

                    <div>
                        <span style="font-size: 6.5pt; margin-right:0.4rem; ">In: </span> {{sheriffEvent.startTime}} 
                    </div>
                    <div>
                        <span style="font-size: 6pt;" >Out:</span> {{sheriffEvent.endTime}}
                    </div>
                    
                    <b-row class="m-0">
                        <div class="m-0" >
                            <b-form-checkbox
                                style="transform:translate(0px,-1px);"                                
                                v-model="checked"
                                @change="cardSelected(checked, sheriffEvent)">
                            </b-form-checkbox>
                        </div>
                        <div class="m-0" >
                            <b-button  
                                class="p-0"
                                style="transform:translate(-4px,0px);" 
                                size="sm"
                                variant="transparent" 
                                @click="editDuties(sheriffEvent)"
                                v-b-tooltip.hover                                
                                title="Edit"
                                ><b-icon-pencil-square font-scale="1.27" variant="primary" />
                            </b-button>
                        </div>
                    </b-row>
                </div>

                <div style=" width:70%;">
                    <div style="font-size: 6pt; border:none;" class="m-0 p-0" v-for="duty in sortEvents(sheriffEvent.duties)" :key="duty.startTime">                                
                        <div :style="'color: ' + duty.color">
                            <b v-if="duty.isOvertime">*</b>
                            <font-awesome-icon v-else-if="duty.dutyType=='Training'" style="font-size: 0.5rem;" icon="graduation-cap" />
                            <font-awesome-icon v-else-if="duty.dutyType=='Leave'" style="font-size: 0.5rem;" icon="suitcase" />
                            <font-awesome-icon v-else-if="duty.dutyType=='Loaned'" style="font-size: 0.5rem;transform:rotate(180deg);" icon="sign-out-alt" />
                            <b> {{duty.startTime}}-{{duty.endTime}}</b> {{ duty.dutyType.replace('Role','') }} {{duty.dutySubType}}
                        </div>                            
                    </div>                    
                </div>                    
            </b-row>

            <div v-else-if="sheriffEvent.type == 'Unavailable'" class="text-center">                                         
                <div  class="m-0 p-0" style="">                    
                    <div :style="{background:getColor(sheriffEvent.subType)}" class="bdg text-white">Unavailable</div>
                </div>
            </div>
            
            <div v-else-if="sheriffEvent.type == 'Leave'" class="text-center">                                         
                <div  class="m-0 p-0" style="">                    
                    <div :style="{background:getColor(sheriffEvent.subType)}" class="bdg text-white">{{ sheriffEvent.subType }} Leave</div>
                </div>
            </div> 

            <div v-else-if="sheriffEvent.type == 'Training'" class="text-center" style="display:inline;">                  
                <div style="" class="m-0 p-0">
                    <div class="bg-training-leave text-white bdg" >
                        <font-awesome-icon style="font-size: 0.9rem;" icon="graduation-cap" /> Training
                    </div>
                </div> 
            </div>   

            <div v-else-if="sheriffEvent.type == 'Loaned'" class="text-center" style="display:inline;">  
                <div style="" class="m-0 p-0">
                    <div class="bg-loaned text-white bdg">
                        <font-awesome-icon  style="transform:translate(0,0) rotate(180deg); font-size: .9rem;"  icon="sign-out-alt" /> Loaned
                    </div>
                </div>                     
            </div>                
        </div>

        
        <assignment-modal 
            :showModal="showEditAssignmentsDetails" 
            :sheriffName="sheriffName"
            :sheriffId="sheriffId"
            :shiftDate="shiftDate"
            :shiftEndTime="shiftEndTime"
            :shiftStartTime="shiftStartTime"
            :dutyDate="dutyDate"
            :dutyBlocks="dutyBlocks"
            :sheriffAvailabilityArray="sheriffAvailabilityArray"
            v-on:change="getData"
            />
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

    import { userInfoType, locationInfoType } from '@/types/common';
    import { manageAssignmentDutyInfoType, manageAssignmentsScheduleInfoType } from '@/types/DutyRoster';

    import AssignmentModal from './AssignmentComponents/AssignmentModal.vue';

    @Component({
        components: {
            AssignmentModal
        }
    })
    export default class AssignmentCard extends Vue {

        @Prop({required: true})
        scheduleInfo!: manageAssignmentsScheduleInfoType[];

        @Prop({required: true})
        sheriffId!: string;

        @Prop({required: true})
        sheriffName!: string;

        @commonState.State
        public userDetails!: userInfoType;
        
        @commonState.State
        public location!: locationInfoType;

        @assignmentState.State
        public selectedShifts!: string[];

        @assignmentState.Action
        public UpdateSelectedShifts!: (newSelectedShifts: string[]) => void  
        

        @assignmentState.State
        public editDutyModalID!: string;

        @assignmentState.Action
        public UpdateEditDutyModalID!: (newEditDutyModalID: string) => void 
        
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

        isAssignmentDataMounted = false;

        addNewDutySlotForm = false;
        addFormColor = 'secondary';
        checked = false;

        isEditOpen = false;
        latestEditData;

        dutySlotToUnassign = {} as manageAssignmentDutyInfoType;

        assignmentName = 'assignment name!!!!!';
        shiftStartTime = '';
        shiftEndTime = '';
        shiftDate = '';
        dutyDate = '';

        dutyBlocks: manageAssignmentDutyInfoType[] = [];
        sheriffAvailabilityArray: number[]|null=[]

        sheriffEvent = {} as manageAssignmentsScheduleInfoType;

        mounted() { 
            this.isMounted = false;
            this.hasPermissionToEditShifts = this.userDetails.permissions.includes("EditShifts");
            this.hasPermissionToEditDuty = this.userDetails.permissions.includes("EditDuties");            
            this.hasPermissionToAddAssignDuty = this.userDetails.permissions.includes("CreateAndAssignDuties");            
            this.extractSheriffEvents();
            this.isMounted = true;
            Vue.nextTick(()=>this.checkOpenModal()) 
        }
        
        public extractSheriffEvents(){
            // console.log(this.scheduleInfo)
            this.sheriffAvailabilityArray = null
            this.sheriffEvent = {} as manageAssignmentsScheduleInfoType;
            const duties: manageAssignmentDutyInfoType[] = []
            for(const sheriffEvent of this.sortEvents(this.scheduleInfo)){
                if(sheriffEvent.fullday){
                    this.sheriffEvent=sheriffEvent;
                    return
                }
                // console.error(sheriffEvent.overtime)
                // console.log(sheriffEvent.type)
                if(sheriffEvent.type != 'Shift'){
                    // console.log(sheriffEvent)
                    const subtype = (sheriffEvent.type=='Leave'? sheriffEvent.subType:sheriffEvent.type)
                    // console.log(subtype)
                    duties.push({                    
                        startTime: sheriffEvent.startTime,
                        endTime: sheriffEvent.endTime, 
                        dutyType: sheriffEvent.type,
                        dutySubType: sheriffEvent.subType,
                        color: Vue.filter('subColors')(subtype)                                        
                    })

                }
                else if(sheriffEvent.type == 'Shift' && sheriffEvent.overtime){
                    // console.log('Overtime')
                    // console.log(sheriffEvent.duties)
                    for(const duty of sheriffEvent.duties){
                        duty.isOvertime=true
                        duty.color= Vue.filter('subColors')('overtime')
                        duties.push(duty)
                    }
                }
                else{
                    console.log(sheriffEvent)
                    this.sheriffAvailabilityArray = Vue.filter('startEndTimesToArray')(
                        this.sheriffAvailabilityArray, 1, 
                        sheriffEvent.date.slice(0,10), 
                        sheriffEvent.startTime, 
                        sheriffEvent.endTime, 
                        this.location.timezone)
                    duties.push(...sheriffEvent.duties)
                    if(!this.sheriffEvent.type){
                        this.sheriffEvent=sheriffEvent
                    }else{
                        const start = this.sheriffEvent.startTime
                        const end = this.sheriffEvent.endTime
                        this.sheriffEvent.startTime = start < sheriffEvent.startTime? start :sheriffEvent.startTime;
                        this.sheriffEvent.endTime = end > sheriffEvent.endTime? end :sheriffEvent.endTime;
                    }
                }
            }
            this.sheriffEvent.duties = duties;            
            console.log(duties)
            console.log(this.sheriffAvailabilityArray)
        }

        public checkOpenModal(){
            const editModalID=this.sheriffEvent.date?.slice(0,10)+'-'+this.sheriffId;
            if(this.editDutyModalID==editModalID) this.editDuties(this.sheriffEvent)
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

        public editDuties(block: manageAssignmentsScheduleInfoType){ 
            // console.log(block)           
            this.isAssignmentDataMounted = false;
            this.shiftDate = Vue.filter('beautify-date-weekday')(block.date);
            this.shiftStartTime = block.startTime;
            this.shiftEndTime = block.endTime;
            this.dutyBlocks = block.duties?block.duties:[];  
            this.dutyDate = block.date;
            const editModalID=this.sheriffEvent.date.slice(0,10)+'-'+this.sheriffId;
            this.UpdateEditDutyModalID(editModalID)
            this.showEditAssignmentsDetails.show = true;           
            this.isAssignmentDataMounted = true;            
        }

        public sortEvents (events: any) {            
            return _.sortBy(events, "startTime");
        }

        public getColor(subtype){
            return Vue.filter('subColors')(subtype)
        }

        public getData(){
            this.$emit('change')
        }

    }
</script>

<style scoped>   

    .bdg{
        font-size: 10pt;
        margin: 0rem 0.2rem;
        border-radius: 5px;
        padding:0.5rem;
    }
    .card {
        border: white;
    }

</style>