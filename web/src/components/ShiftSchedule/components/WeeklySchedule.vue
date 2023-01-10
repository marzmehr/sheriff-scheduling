<template>
    <div> 
         
        <b-table            
            :items="sheriffSchedules" 
            :fields="fields"
            small
            style="width: 100%;"
            bordered
            fixed>
            
            <template v-slot:head() = "data" >
                <span class="text">{{data.column}}</span> <span> {{data.label}}</span>
            </template>

            <template v-slot:head(myteam) = "data" >  
                <span>{{data.label}}</span>
            </template>

            <template v-slot:cell(myteam) = "data" >
                <div style="line-height:1rem; font-size: 7.5pt; font-weight: 700;">
                    {{data.value.name}}
                </div>
                <div style="line-height:0.75rem;"                    
                    v-if="data.value.homeLocation != location.name">
                    <div class="m-0 p-0 text-jail"> 
                        <b-icon-box-arrow-in-right style="float:left;margin:0 .2rem 0 0;"/>
                        <div style="float:left;font-size: 7.5pt; margin:0 .1rem 0 0;">Loaned in from </div>
                    </div> 
                    <div class="m-0 p-0 text-jail" style="font-size: 7.5pt;"> {{data.value.homeLocation|truncate(35)}} </div>
                </div>
            
                <div class="row m-0" style="line-height:0.75rem;">
                    <div style="font-size: 7.5pt; margin:0 .25rem 0 0;">
                        {{data.value.rank}}
                    </div>
                    <div class="m-0 p-0" style="font-size: 7.5pt;"> #{{data.value.badgeNumber}} </div>
                </div>
                
                <div style="line-height:0.75rem;">
                    <div v-if="data.value.actingRank.length>0" style="font-size: 7.5pt; font-weight: 700;"> 
                        <span class="dot">A</span> <span style="font-weight: 500;">{{data.value.actingRank[0].rank}}</span>
                    </div>
                </div>
                
            </template>               
            
            <template v-slot:cell() = "data">                   
                <div style="font-size: 6pt; border:none;" class="m-0 p-0" v-for="event in sortEvents(data.item[data.field.key])" :key="event.id + event.date + event.location">
                    <div v-if="event.type == 'Shift'">
                            
                        <div style="border-bottom: 1px solid #ccc; text-align: center; font-weight: 700;" class="m-0 p-0">
                            In: {{event.startTime}} Out: {{event.endTime}}
                        </div>
                                
                        <div style="font-size: 6pt; border:none;" class="m-0 p-0" v-for="duty in sortEvents(event.duties)" :key="duty.startTime">
                            <div :style="'color: ' + duty.color">{{duty.startTime}}-{{duty.endTime}} {{duty.dutySubType}}</div>
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
            
        </b-table>
                 
    </div>
</template>

<script lang="ts">
    import { Component, Vue, Prop } from 'vue-property-decorator';
    import { namespace } from 'vuex-class';
    import "@store/modules/CommonInformation";
    const commonState = namespace("CommonInformation");    
    import { locationInfoType } from '../../../types/common';
    import { weekScheduleInfoType } from '../../../types/ShiftSchedule/index'

    import * as _ from 'underscore';

    @Component
    export default class WeeklySchedule extends Vue {

        @Prop({required: true})
        sheriffSchedules!: weekScheduleInfoType[];

        @Prop({required: true})
        fields!: any[];

        @commonState.State
        public location!: locationInfoType;    

        healthLeaveList = ['MEDICAL', 'DENTAL', 'MED/DENTAL'];
        annualLeaveList = ['A/L', 'ANNUAL'];

        public sortEvents (events: any) {            
            return _.sortBy(events, "startTime");
        }

    }
</script>

<style scoped lang="scss" src="@/styles/_pdf.scss">

</style>