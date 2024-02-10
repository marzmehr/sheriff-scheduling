<template>
    <div v-if="scheduleInfo && isMounted" >             

        <div style="font-size: 6pt; border:none;" class="m-0 p-0" >
            <!-- {{ scheduleInfo }} -->
            <!-- {{ sheriffEvent }} -->
            <div v-if="sheriffEvent.type == 'Shift'"  style="margin-bottom: 0.1rem;">

                <div v-if="sheriffEvent.startTime && sheriffEvent.endTime" style="margin:0; text-align: center; font-weight: 600; width:100%; border-bottom: 1px solid #ccc;">                    
                    <span style="font-size: 5.5pt; margin-right:0.1rem; ">In: </span> {{sheriffEvent.startTime}}                         
                    <span style="font-size: 6pt;" >Out:</span> {{sheriffEvent.endTime}}                    
                </div>

                <div style=" width:100%;">
                    <div style="font-size: 6pt; border: none; line-height: 0.55rem;" class="m-0 p-0" v-for="duty,inx in sortEvents(sheriffEvent.duties)" :key="'duty-name-'+inx+'-'+duty.startTime">                                
                        <div :style="'color: ' + duty.color">
                            <b v-if="duty.isOvertime">*</b>                            
                            <b v-if="includeTime"> {{duty.startTime}}-{{duty.endTime}}</b>  
                            <span v-if="duty.dutyType!='Training' && duty.dutyType!='Leave' && duty.dutyType!='Loaned'" > {{duty.dutySubType}} </span>
                            {{ duty.dutyType | getTypeAbrv }}
                        </div>                            
                    </div>                    
                </div>                    
            </div>

            <div v-else-if="sheriffEvent.type == 'Unavailable'" class="text-center middle-text">                                         
                <div  class="m-0 p-0" style="">                    
                    <div :style="{background:getColor(sheriffEvent.subType)}" class=" text-white">Unavailable</div>
                </div>
            </div>
            
            <div v-else-if="sheriffEvent.type == 'Leave'" class="text-center middle-text">                                         
                <div  class="m-0 p-0" style="">                    
                    <div :style="{background:getColor(sheriffEvent.subType)}" class=" text-white">
                        <div>Leave</div> {{ sheriffEvent.subType }}
                    </div>
                </div>
            </div> 

            <div v-else-if="sheriffEvent.type == 'Training'" class="text-center middle-text">                  
                <div style="" class="m-0 p-0">
                    <div class="bg-training-leave">
                        <div>Training</div> {{sheriffEvent.subType}}
                    </div>
                </div> 
            </div>   

            <div v-else-if="sheriffEvent.type == 'Loaned'" class="text-center middle-text">  
                <div style="" class="m-0 p-0"> 
                    <div class="bg-loaned">
                        <div>Loaned</div> {{sheriffEvent.location}}
                    </div>
                </div>                     
            </div>                
        </div>

    </div>
</template>

<script lang="ts">
    import { Component, Vue, Prop } from 'vue-property-decorator';
    import { namespace } from "vuex-class";    
    import * as _ from 'underscore';
    import moment from 'moment-timezone';

    import "@store/modules/CommonInformation";
    const commonState = namespace("CommonInformation");

    import { locationInfoType } from '@/types/common';
    import { manageAssignmentDutyInfoType, manageAssignmentsScheduleInfoType } from '@/types/DutyRoster';

    @Component
    export default class WeeklyAssignmentCard extends Vue {

        @Prop({required: true})
        scheduleInfo!: manageAssignmentsScheduleInfoType[];

        @Prop({required: true})
        includeTime!: boolean;

        @commonState.State
        public location!: locationInfoType;
        
        sheriffEvent = {} as manageAssignmentsScheduleInfoType;

        isMounted = false;

        mounted() { 
            this.isMounted = false;
            this.extractSheriffEvents();
            this.isMounted = true;
        }
        
        public extractSheriffEvents(){            

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
                    //console.log(sheriffEvent)
                   
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
                       
            // console.log(this.sheriffEvent)
            //console.log(duties)
            //console.log(this.sheriffAvailabilityArray)
        }

        public sortEvents (events: any) {            
            const eventsCopy = JSON.parse(JSON.stringify(events))
            return _.sortBy(eventsCopy, "startTime");
        }

        public getColor(subtype){
            return Vue.filter('subColors')(subtype)
        }

    }
</script>