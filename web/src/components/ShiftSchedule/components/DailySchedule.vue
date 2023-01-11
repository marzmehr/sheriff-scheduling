<template>
    <div>            
        <b-table
            :items="dailySheriffSchedules" 
            :fields="dailyFields"
            small
            bordered
            style="width: 100%;"
            fixed>

            <template v-slot:cell(name) = "data" >  

                <div style="line-height:1rem; font-size: 7.5pt; font-weight: 700;">
                    {{data.value}}
                </div>
                <div style="line-height:0.75rem;"                    
                    v-if="data.item.homeLocation != location.name">
                    <div class="m-0 p-0 text-jail"> 
                        <b-icon-box-arrow-in-right style="float:left;margin:0 .2rem 0 0;"/>
                        <div style="float:left;font-size: 7.5pt; margin:0 .1rem 0 0;">Loaned in from </div>
                    </div> 
                    <div class="m-0 p-0 text-jail" style="font-size: 7.5pt;"> {{data.item.homeLocation|truncate(35)}} </div>
                </div>
            
                <div class="row m-0" style="line-height:0.75rem;">
                    <div style="font-size: 7.5pt; margin:0 .25rem 0 0;">
                        {{data.item.rank}}
                    </div>
                    <div class="m-0 p-0" style="font-size: 7.5pt;"> #{{data.item.badgeNumber}} </div>
                </div>
                
                <div style="line-height:0.75rem;">
                    <div v-if="data.item.actingRank.length>0" style="font-size: 7.5pt; font-weight: 700;"> 
                        <span class="dot">A</span> <span style="font-weight: 500;">{{data.item.actingRank[0].rank}}</span>
                    </div>
                </div>
                
            </template>               

            <template v-slot:cell(shifts) = "data">  

                <div style="font-size: 6pt; border:none;" class="m-0 p-0" v-for="event in sortEvents(data.item.conflicts)" :key="event.id + event.date + event.location">
                    <div v-if="event.type == 'Shift'">
                            
                        <div style="text-align: center; font-weight: 700;" class="m-0 p-0">
                            In: {{event.startTime}} Out: {{event.endTime}}
                        </div>
                            
                    </div>
                    <div class="text-center" v-else-if="event.type == 'Unavailable' && event.startTime.length>0">{{event.startTime}}-{{event.endTime}} Unavailable</div>
                    <div class="text-center ml-3" v-else-if="event.type == 'Unavailable' && event.startTime.length==0">Unavailable</div>
                   
                    <div class="text-center" style="display:inline;" v-else-if="event.type == 'Leave'"> 
                        <div style="border-bottom: 1px solid #ccc;" class="m-0 p-0">
                            <div v-if="event.subType.toUpperCase().includes('SPL')" class="bg-spl-leave badge text-white">Leave</div>
                            <div v-else-if="annualLeaveList.some(leave => event.subType.toUpperCase().includes(leave))" class="bg-a-l-leave badge">Leave</div>
                            <div v-else-if="healthLeaveList.some(leave => event.subType.toUpperCase().includes(leave))" class="bg-med-dental-leave badge">Leave</div>
                            <div v-else-if="event.subType.toUpperCase().includes('STIIP')" class="bg-stiip-leave badge text-white">Leave</div>
                            <div v-else-if="event.subType.toUpperCase().includes('CTO')" class="bg-cto-leave badge text-white">Leave</div>
                            <div v-else-if="event.subType.toUpperCase().includes('LWOP')" class="bg-lwop-leave badge text-white">Leave</div>
                            <div v-else-if="event.subType.toUpperCase().includes('BEREAVEMENT')" class="bg-bereavement-leave badge text-white">Leave</div>
                            <div v-else-if="event.subType.toUpperCase().includes('TRAINING')" class="bg-training-leave badge text-white">Leave</div>
                            <div v-else-if="event.subType.toUpperCase().includes('OVERTIME')" class="bg-overtime-leave badge text-white">Leave</div>
                            <div v-else  class="bg-primary badge text-white">Leave</div>

                        </div> 
                        <div style="font-size: 6pt; border:none;" class="m-0 p-0" v-if="event.subType">
                            <span v-if="event.startTime">{{event.startTime}}-{{event.endTime}}</span>
                            <span v-else > FullDay </span>  
                            {{ event.subType }}
                        </div>  
                    </div> 

                    <div class="text-center" style="display:inline;" v-else-if="event.type == 'Training'">  
                        
                        <div style="border-bottom: 1px solid #ccc;" class="m-0 p-0">
                            <b-badge class="bg-primary text-white" >Training</b-badge>
                        </div> 
                        <div style="font-size: 6pt; border:none;" class="m-0 p-0" v-if="event.subType">
                            <span v-if="event.startTime">{{event.startTime}}-{{event.endTime}}</span>
                            <span v-else > FullDay </span>  
                            {{ event.subType }}
                        </div>  
                    </div>   

                    <div class="text-center" style="display:inline;" v-else-if="event.type == 'Loaned'">  
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

            </template>

            <template v-slot:cell(duties) = "data">  

                <div style="font-size: 6pt; border:none;" class="m-0 p-0" v-for="event in sortEvents(data.item.conflicts)" :key="event.id + event.date + event.location">
                    <div v-if="event.type == 'Shift'">
                                
                        <div style="font-size: 6pt; border:none;" class="m-0 p-0" v-for="duty in sortEvents(event.duties)" :key="duty.startTime">
                            <div :style="'color: ' + duty.color">{{duty.startTime}}-{{duty.endTime}} {{duty.dutySubType}}</div>
                        </div>
                            
                    </div>
                </div>

            </template>

            <template v-slot:cell(notes) = "data">  

                <div style="font-size: 6pt; border:none;" class="m-0 p-0" v-for="event in sortEvents(data.item.conflicts)" :key="event.id + event.date + event.location">
                    <div v-if="event.type == 'Shift'">                       
                                
                        <div style="font-size: 6pt; border:none;" class="m-0 p-0" v-for="duty in sortEvents(event.duties)" :key="duty.startTime">
                            <div :style="'color: ' + duty.color" v-if="duty.dutyNotes">{{duty.dutyNotes}}</div>
                            <div v-if="duty.assignmentNotes">{{duty.assignmentNotes}}</div>
                        </div>
                            
                    </div>                  
                </div>
            </template>
                
        </b-table>        
    </div>
</template>

<script lang="ts">
    import { Component, Vue, Prop } from 'vue-property-decorator';
    import { namespace } from 'vuex-class'

    import "@store/modules/CommonInformation";
    const commonState = namespace("CommonInformation");    
    import { locationInfoType } from '../../../types/common';
    import { distributeScheduleInfoType, distributeTeamMemberInfoType } from '../../../types/ShiftSchedule/index';
   
    import * as _ from 'underscore';

    @Component
    export default class DailySchedule extends Vue {

        @Prop({required: true})
        dailySheriffSchedules!: distributeScheduleInfoType[];
        
        @commonState.State
        public location!: locationInfoType;

        isDistributeDataMounted = false;       

        teamMembers: distributeTeamMemberInfoType[] = [];        

        dailyFields=[
            {key:'name',        label:'Name',            tdClass:'px-1 mx-0 align-middle my-team', thStyle:'text-align: center; font-size: 8pt; width: 11rem;'},
            {key:'shifts',      label:'Scheduled Shift', tdClass:'px-1 mx-0 align-middle', thStyle:'text-align: center; font-size: 8pt; width: 8rem;'},
            {key:'duties',      label:'Assignments',     tdClass:'px-1 mx-0 align-middle', thStyle:'text-align: center; font-size: 8pt; width: 8rem;'},
            {key:'notes',       label:'Notes',           tdClass:'px-1 mx-0 align-middle my-notes', thStyle:'text-align: center; font-size: 8pt; width: 17rem;'}
        ]    
        
        healthLeaveList = ['MEDICAL', 'DENTAL', 'MED/DENTAL'];
        annualLeaveList = ['A/L', 'ANNUAL'];

        mounted() {           
            this.isDistributeDataMounted=false;       
        }

        public sortEvents (events: any) {            
            return _.sortBy(events, "startTime");
        }      

    }
</script>

<style scoped lang="scss" src="@/styles/_pdf.scss">

</style>