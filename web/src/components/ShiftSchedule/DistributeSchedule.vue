<template>
    <b-card bg-variant="white" class="home" no-body>

        <distribute-header v-on:change="loadScheduleInformation" />

        <div id="pdf" v-if="isDistributeDataMounted">
            <div v-for="page,inx in sheriffPages" :key="'pdf-'+inx">
                <b-row class="mt-0 mb-0 mx-4">
                    <b-col>
                        <b-row class="mt-1">
                            <div style="width:20%"  class="mr-0">
                                <b-img 
                                    class="img-fluid"
                                    width="100rem"
                                    height="100rem"
                                    :src="require('../../../public/images/bcss-crest.png')" 
                                alt="B.C. Government Logo">
                                </b-img>
                            </div>
                            <div style="width:70%"  class="mr-0 mt-5">
                                <h2>B.C. Sheriff Service</h2>
                                <h3 class="mt-n2 text-secondary font-italic">Honour - Integrity - Commitment</h3>
                            </div>
                        </b-row>
                    </b-col>
                    
                    <b-col>
                        <b-card class="mt-3 mx-5 border border-dark text-center" body-class="p-3">
                            <b-card-sub-title class="mb-2 h4">{{location.name}} Schedule</b-card-sub-title>
                            <b-card-title v-if="weekView" class="h3">{{shiftRangeInfo.startDate | beautify-full-date}} - {{shiftRangeInfo.endDate | beautify-full-date}}</b-card-title>
                            <b-card-title v-else class="h3">{{dailyShiftRangeInfo.startDate | beautify-full-date}}</b-card-title>                            
                            <b-card-text class="text-secondary h5">Summary as of: <i class="h6">{{today | beautify-date-time-weekday}}</i></b-card-text>
                        </b-card>
                    </b-col>            

                </b-row>

                <b-overlay opacity="0.6" :show="!isDistributeDataMounted">
                    <template #overlay>
                        <loading-spinner :inline="true"/>
                    </template>    
                    <b-table
                        :key="updateTable"
                        :items="weekView?sheriffSchedules.slice(page.start,page.end):dailySheriffSchedules.slice(page.start,page.end)" 
                        :fields="weekView?fields:dailyFields"
                        small
                        fixed>

                        <template v-slot:table-colgroup>
                            <col style="width:20rem">                            
                        </template>
                            
                            <template v-if="weekView" v-slot:head() = "data" >
                                <span class="text">{{data.column}}</span> <span> {{data.label}}</span>
                            </template>

                            <template v-if="weekView" v-slot:head(myteam) = "data" >  
                                <span>{{data.label}}</span>
                            </template>

                            <template v-if="weekView" v-slot:cell(myteam) = "data" >  
                                <td class="m-0 p-0" style="border:none;">
                                    <span style="font-size: 1.2rem;">{{data.value.name}}</span>
                                    <div style="height:1rem;"                    
                                        v-if="data.value.homeLocation != location.name">
                                        <div class="m-0 p-0 text-jail"> 
                                            <b-icon-box-arrow-in-right style="float:left;margin:0 .2rem 0 0;"/>
                                            <div style="float:left;font-size:10px; margin:0 .1rem 0 0;">Loaned in from </div>
                                        </div> 
                                        <div class="m-0 p-0 text-jail" style="font-size:10px"> {{data.value.homeLocation|truncate(35)}} </div>
                                    </div>
                                
                                    <div style="height:1rem;">
                                        <div style="float:left;font-size:10px; margin:0 .1rem 0 0;">
                                            {{data.value.rank}}
                                        </div>
                                    </div>
                                </td>
                                <td class="m-0 p-0" style="border:none;">
                                    <div style="height:1rem; margin:0.5rem;">
                                        <div class=" m-0 p-0" style="font-size:10px;"> #{{data.value.badgeNumber}} </div>
                                    </div>
                                    <div style="height:1rem; margin:0.5rem;">
                                        <div v-if="data.value.actingRank.length>0" style="font-size:10px; font-weight: 700;"> 
                                            <span class="dot">A</span> <span style="font-weight: 500;">{{data.value.actingRank[0].rank}}</span>
                                        </div>
                                    </div>
                                </td>
                            </template>

                            <template v-else v-slot:cell(name) = "data" >  
                                <td class="m-0 p-0" style="border:none;">
                                    <span style="font-size: 1.2rem;">{{data.value}}</span>
                                    <div style="height:1rem;"                    
                                        v-if="data.item.homeLocation != location.name">
                                        <div class="m-0 p-0 text-jail"> 
                                            <b-icon-box-arrow-in-right style="float:left;margin:0 .2rem 0 0;"/>
                                            <div style="float:left;font-size:10px; margin:0 .1rem 0 0;">Loaned in from </div>
                                        </div> 
                                        <div class="m-0 p-0 text-jail" style="font-size:10px"> {{data.item.homeLocation|truncate(35)}} </div>
                                    </div>
                                
                                    <div style="height:1rem;">
                                        <div style="float:left;font-size:10px; margin:0 .1rem 0 0;">
                                            {{data.item.rank}}
                                        </div>
                                    </div>
                                </td>
                                <td class="m-0 p-0" style="border:none;">
                                    <div style="height:1rem; margin:0.5rem;">
                                        <div class=" m-0 p-0" style="font-size:10px;"> #{{data.item.badgeNumber}} </div>
                                    </div>
                                    <div style="height:1rem; margin:0.5rem;">
                                        <div v-if="data.item.actingRank.length>0" style="font-size:10px; font-weight: 700;"> 
                                            <span class="dot">A</span> <span style="font-weight: 500;">{{data.item.actingRank[0].rank}}</span>                                        
                                        </div>
                                    </div>
                                </td>
                                
                            </template>
                            
                            <template v-if="weekView" v-slot:cell() = "data">                   
                                <b-card style="font-size: 1.1rem;" class="ml-auto" body-class="p-1" v-for="event in sortEvents(data.item[data.field.key])" :key="event.id + event.date + event.location">
                                    <div v-if="event.type == 'Shift'">
                                        <div v-if="event.workSection" :style="{float:'left',backgroundColor:event.workSectionColor, color:'white', width:'1.5rem', borderRadius:'15px',textAlign: 'center', margin:0}">{{event.workSection}}</div> 
                                        <div v-else style="float:left; background-color:white; color:white; width:1.5rem; border-radius:15px;text-align: center; margin:0; height:25px; "></div>
                                        <div style=" text-align: center; " class="m-0 p-0">{{event.startTime}} - {{event.endTime}}</div>
                                    </div>
                                    <div class="text-center" v-else-if="event.type == 'Unavailable' && event.startTime.length>0">Unavailable {{event.startTime}} - {{event.endTime}}</div>
                                    <div class="text-center ml-3" v-else-if="event.type == 'Unavailable' && event.startTime.length==0">Unavailable</div>
                                    <div class="text-center" v-else>
                                        <div style="display:inline;" class="text-white" v-if="event.type == 'Leave'">
                                            <div v-if="event.subType.toUpperCase().includes('SPL')" class="bg-spl-leave badge">Leave</div>
                                            <div v-else-if="event.subType.toUpperCase().includes('A/L')" class="bg-a-l-leave badge">Leave</div>
                                            <div v-else-if="event.subType.toUpperCase().includes('MED/DENTAL')" class="bg-med-dental-leave badge">Leave</div>
                                            <div v-else-if="event.subType.toUpperCase().includes('STIIP')" class="bg-stiip-leave badge">Leave</div>
                                            <div v-else-if="event.subType.toUpperCase().includes('CTO')" class="bg-cto-leave badge">Leave</div>
                                            <div v-else-if="event.subType.toUpperCase().includes('LWOP')" class="bg-lwop-leave badge">Leave</div>
                                            <div v-else-if="event.subType.toUpperCase().includes('BEREAVEMENT')" class="bg-bereavement-leave badge">Leave</div>
                                            <div v-else-if="event.subType.toUpperCase().includes('TRAINING')" class="bg-training-leave badge">Leave</div>
                                            <div v-else-if="event.subType.toUpperCase().includes('OVERTIME')" class="bg-overtime-leave badge">Leave</div>
                                            <div v-else  class="bg-primary badge">Leave</div>
                                        </div>                                    
                                            
                                        <b-badge v-if="event.type == 'Training'" class="bg-primary" >Training</b-badge> <span v-if="event.subType">({{ event.subType }})</span>
                                        <b-badge class="bg-primary"><b-icon-box-arrow-left v-if="event.type == 'Loaned'" font-scale="1.5"/></b-badge>
                                        <span v-if="event.startTime"> {{event.startTime}} - {{event.endTime}}</span>
                                        <span v-else > FullDay </span>   
                                        <div v-if="event.type == 'Loaned'" style="display:block;">{{event.location}}</div>                               
                                    </div>                          
                                </b-card>
                            </template>

                            <template v-else v-slot:cell(shifts) = "data">                                                   
                                <b-card style="font-size: 1.1rem;" class="ml-auto" body-class="p-1" v-for="event in sortEvents(data.item.conflicts)" :key="event.id + event.date + event.location">
                                    <div v-if="event.type == 'Shift'">
                                        <div v-if="event.workSection" :style="{float:'left',backgroundColor:event.workSectionColor, color:'white', width:'1.5rem', borderRadius:'15px',textAlign: 'center', margin:0}">{{event.workSection}}</div> 
                                        <div v-else style="float:left; background-color:white; color:white; width:1.5rem; border-radius:15px;text-align: center; margin:0; height:25px; "></div>
                                        <div style=" text-align: center; " class="m-0 p-0">{{event.startTime}} - {{event.endTime}}</div>
                                    </div>
                                    <div class="text-center" v-else-if="event.type == 'Unavailable' && event.startTime.length>0">Unavailable {{event.startTime}} - {{event.endTime}}</div>
                                    <div class="text-center ml-3" v-else-if="event.type == 'Unavailable' && event.startTime.length==0">Unavailable</div>
                                    <div class="text-center" v-else>
                                        <div style="display:inline;" class="text-white" v-if="event.type == 'Leave'">
                                            <div v-if="event.subType.toUpperCase().includes('SPL')" class="bg-spl-leave badge">Leave</div>
                                            <div v-else-if="event.subType.toUpperCase().includes('A/L')" class="bg-a-l-leave badge">Leave</div>
                                            <div v-else-if="event.subType.toUpperCase().includes('MED/DENTAL')" class="bg-med-dental-leave badge">Leave</div>
                                            <div v-else-if="event.subType.toUpperCase().includes('STIIP')" class="bg-stiip-leave badge">Leave</div>
                                            <div v-else-if="event.subType.toUpperCase().includes('CTO')" class="bg-cto-leave badge">Leave</div>
                                            <div v-else-if="event.subType.toUpperCase().includes('LWOP')" class="bg-lwop-leave badge">Leave</div>
                                            <div v-else-if="event.subType.toUpperCase().includes('BEREAVEMENT')" class="bg-bereavement-leave badge">Leave</div>
                                            <div v-else-if="event.subType.toUpperCase().includes('TRAINING')" class="bg-training-leave badge">Leave</div>
                                            <div v-else-if="event.subType.toUpperCase().includes('OVERTIME')" class="bg-overtime-leave badge">Leave</div>
                                            <div v-else  class="bg-primary badge">Leave</div>
                                        </div>                                    
                                            
                                        <b-badge v-if="event.type == 'Training'" class="bg-primary" >Training</b-badge> <span v-if="event.subType">({{ event.subType }})</span>
                                        <b-badge class="bg-primary"><b-icon-box-arrow-left v-if="event.type == 'Loaned'" font-scale="1.5"/></b-badge>
                                        <span v-if="event.startTime"> {{event.startTime}} - {{event.endTime}}</span>
                                        <span v-else > FullDay </span>   
                                        <div v-if="event.type == 'Loaned'" style="display:block;">{{event.location}}</div>                               
                                    </div>                          
                                </b-card>
                            </template>
                            
                    </b-table>
                    <div v-if="!isDistributeDataMounted && sheriffSchedules.length == 0" style="min-height:115.6px;">
                    </div>
                </b-overlay>
                <div v-if="(inx+1)<sheriffPages.length" class="new-page" />
            </div>

        </div>

        <b-modal v-model="openErrorModal" header-class="bg-warning text-light">
            <b-card class="h4 mx-2 py-2">
				<span class="p-0">{{errorText}}</span>
            </b-card>                        
            <template v-slot:modal-footer>
                <b-button variant="primary" @click="openErrorModal=false">Ok</b-button>
            </template>            
            <template v-slot:modal-header-close>                 
                <b-button variant="outline-warning" class="text-light closeButton" @click="openErrorModal=false"
                >&times;</b-button>
            </template>
        </b-modal>         
    </b-card>
</template>

<script lang="ts">
    import { Component, Vue, Watch } from 'vue-property-decorator';
    import { namespace } from 'vuex-class'
    import DistributeHeader from './components/DistributeHeader.vue'
    import "@store/modules/ShiftScheduleInformation";   
    const shiftState = namespace("ShiftScheduleInformation");
    import "@store/modules/CommonInformation";
    const commonState = namespace("CommonInformation");    
    import { locationInfoType } from '../../types/common';
    import { shiftRangeInfoType, scheduleInfoType, weekScheduleInfoType, distributeScheduleInfoType, distributeTeamMemberInfoType, sheriffPagesInfoType } from '../../types/ShiftSchedule/index'
    import { sheriffsAvailabilityJsonType, conflictJsonType } from '../../types/ShiftSchedule/jsonTypes';
    import moment from 'moment-timezone';
    import * as _ from 'underscore';

    @Component({
        components: {
            DistributeHeader
        }
    })
    export default class DistributeSchedule extends Vue {

        @commonState.State
        public location!: locationInfoType;

        @shiftState.State
        public shiftRangeInfo!: shiftRangeInfoType;

        @shiftState.State
        public dailyShiftRangeInfo!: shiftRangeInfoType;

        @shiftState.Action
        public UpdateTeamMemberList!: (newTeamMemberList: distributeTeamMemberInfoType[]) => void

        isDistributeDataMounted = false;
        weekView = false;
        headerDates: string[] = [];
        today = '';
        numberOfheaderDates = 7;
        updateTable=0;

        errorText=''
		openErrorModal=false;

        teamMembers: distributeTeamMemberInfoType[] = [];

        fields=[
            {key:'myteam', label:'Name', tdClass:'px-1 mx-0 align-middle', thClass:'text-center'},
            {key:'Sun', label:'', tdClass:'px-1 mx-0 align-middle', thStyle:'text-align: center;'},
            {key:'Mon', label:'', tdClass:'px-1 mx-0 align-middle', thStyle:'text-align: center;'},
            {key:'Tue', label:'', tdClass:'px-1 mx-0 align-middle', thStyle:'text-align: center;'},
            {key:'Wed', label:'', tdClass:'px-1 mx-0 align-middle', thStyle:'text-align: center;'},
            {key:'Thu', label:'', tdClass:'px-1 mx-0 align-middle', thStyle:'text-align: center;'},
            {key:'Fri', label:'', tdClass:'px-1 mx-0 align-middle', thStyle:'text-align: center;'},
            {key:'Sat', label:'', tdClass:'px-1 mx-0 align-middle', thStyle:'text-align: center;'}
        ]

        dailyFields=[
            {key:'name',        label:'Name',            tdClass:'px-1 mx-0 align-middle', thClass:'text-center'},
            {key:'shifts',      label:'Scheduled Shift', tdClass:'px-1 mx-0 align-middle', thStyle:'text-align: center;'},
            {key:'duties',      label:'Assignments',     tdClass:'px-1 mx-0 align-middle', thStyle:'text-align: center;'},
            {key:'notes',       label:'Notes',           tdClass:'px-1 mx-0 align-middle', thStyle:'text-align: center;'}
        ]

        WSColors = {
            'C':'#189fd4',
            'J':'#A22BB9',
            'E':'#ffb007',
            'O':'#7a4528'
        }

        sheriffSchedules: weekScheduleInfoType[] =[];
        dailySheriffSchedules: distributeScheduleInfoType[] = [];

        sheriffPages: sheriffPagesInfoType[]=[];
        marginToLastPageRows = '0rem';

        @Watch('location.id', { immediate: true })
        locationChange()
        {
            if (this.isDistributeDataMounted) {
                this.loadScheduleInformation(true, ''); 
                // console.log('watch')               
            }            
        }

        mounted() {
            this.isDistributeDataMounted=false;			
			//this.loadScheduleInformation(false, '');
            this.today = moment().tz(this.location.timezone).format();
        }

        public loadScheduleInformation(weekView: boolean, sheriffId: string) {
            console.log(weekView)
            console.log(this.dailyShiftRangeInfo)
            //TODO: remove once the api is updated
            const includeWS = true;
            
            this.isDistributeDataMounted=false;
            this.weekView = weekView;
            this.headerDate();

            const endDate = moment(this.shiftRangeInfo.endDate).endOf('day').format();
            let url = '';

            if (weekView){
                url = 'api/distributeschedule/location?locationId='
                        +this.location.id+'&start='+this.shiftRangeInfo.startDate+'&end='+endDate + '&includeWorkSection='+includeWS;
            } else {                
                url = 'api/distributeschedule/location?locationId='
                        +this.location.id+'&start='+this.dailyShiftRangeInfo.startDate+'&end='+this.dailyShiftRangeInfo.endDate + '&includeWorkSection='+includeWS;
            }            
            
            this.$http.get(url)
                .then(response => {
                    if(response.data){
                        this.extractTeamInfo(response.data);

                        let info = [];
                        if (sheriffId.length == 0) {
                            info = response.data;
                        } else {
                            info = response.data.filter(data =>{if(data.sheriffId == sheriffId ) return true})
                        }
                        //console.log(info)
                        if (this.weekView){
                            this.extractTeamScheduleInfo(info);
                        } else {
                            this.extractTeamDailyScheduleInfo(info); 
                        }
                                                 
                    }                                   
                },err => {
                    this.errorText=err.response.statusText+' '+err.response.status + '  - ' + moment().format(); 
                    if (err.response.status != '401') {
                        this.openErrorModal=true;
                    }      
                    this.teamMembers = [];
                    this.sheriffSchedules = [];
                    this.isDistributeDataMounted=true;
                })            
        }

        public extractTeamInfo (teamJson) {
            this.teamMembers = [];
            
            for(const sheriffJson of teamJson) {
                const sheriff = {} as distributeTeamMemberInfoType;
                console.log(sheriffJson)
                sheriff.sheriffId = sheriffJson.sheriffId;           
                sheriff.email = sheriffJson.sheriff.email;     
                sheriff.name = Vue.filter('capitalize')(sheriffJson.sheriff.lastName) 
                                        + ', ' + Vue.filter('capitalize')(sheriffJson.sheriff.firstName);
                this.teamMembers.push(sheriff);
            }
            this.UpdateTeamMemberList(this.teamMembers);
        }

        public headerDate() {
            this.headerDates = [];
            for(let dayOffset=0; dayOffset<this.numberOfheaderDates; dayOffset++)
            {
                const date= moment(this.shiftRangeInfo.startDate).add(dayOffset,'days').format();
                this.headerDates.push(date);
                this.fields[dayOffset+1].label = ' ' + Vue.filter('beautify-date')(date);
            }
        }

        public extractTeamScheduleInfo(sheriffsScheduleJson: sheriffsAvailabilityJsonType[]) {
            
            this.sheriffSchedules = [];
            
            for(const sheriffScheduleJson of sheriffsScheduleJson) {
                console.log(sheriffScheduleJson)
                const sheriffSchedule = {} as distributeScheduleInfoType;
                sheriffSchedule.sheriffId = sheriffScheduleJson.sheriffId;                
                sheriffSchedule.name = Vue.filter('capitalizefirst')(sheriffScheduleJson.sheriff.lastName) 
                                        + ', ' + Vue.filter('capitalizefirst')(sheriffScheduleJson.sheriff.firstName);
                sheriffSchedule.rank = sheriffScheduleJson.sheriff.rank;
                sheriffSchedule.actingRank = sheriffScheduleJson.sheriff.actingRank;
                sheriffSchedule.badgeNumber = sheriffScheduleJson.sheriff.badgeNumber; 
                sheriffSchedule.homeLocation = sheriffScheduleJson.sheriff.homeLocation.name;                                        
                const isInLoanLocation = (sheriffScheduleJson.sheriff.homeLocation.id !=this.location.id)
                sheriffSchedule.conflicts =isInLoanLocation? this.extractInLoanLocationConflicts(sheriffScheduleJson.conflicts) :this.extractSchedules(sheriffScheduleJson.conflicts, false);        
                
                
                this.sheriffSchedules.push({
                    myteam: sheriffSchedule,
                    Sun: sheriffSchedule.conflicts.filter(conflict=>{if(conflict.dayOffset ==0) return true}),
                    Mon: sheriffSchedule.conflicts.filter(conflict=>{if(conflict.dayOffset ==1) return true}),
                    Tue: sheriffSchedule.conflicts.filter(conflict=>{if(conflict.dayOffset ==2) return true}),
                    Wed: sheriffSchedule.conflicts.filter(conflict=>{if(conflict.dayOffset ==3) return true}),
                    Thu: sheriffSchedule.conflicts.filter(conflict=>{if(conflict.dayOffset ==4) return true}),
                    Fri: sheriffSchedule.conflicts.filter(conflict=>{if(conflict.dayOffset ==5) return true}),
                    Sat: sheriffSchedule.conflicts.filter(conflict=>{if(conflict.dayOffset ==6) return true})
                })
            }          
            this.splitSheriffPages()
            this.isDistributeDataMounted = true;            
            this.updateTable++;
        }
   
        public extractTeamDailyScheduleInfo(sheriffsScheduleJson: sheriffsAvailabilityJsonType[]) {
            
            this.dailySheriffSchedules = [];
            
            for(const sheriffScheduleJson of sheriffsScheduleJson) {
                console.log(sheriffScheduleJson)
                const sheriffSchedule = {} as distributeScheduleInfoType;
                sheriffSchedule.sheriffId = sheriffScheduleJson.sheriffId;                
                sheriffSchedule.name = Vue.filter('capitalizefirst')(sheriffScheduleJson.sheriff.lastName) 
                                        + ', ' + Vue.filter('capitalizefirst')(sheriffScheduleJson.sheriff.firstName);
                sheriffSchedule.homeLocation = sheriffScheduleJson.sheriff.homeLocation.name;   
                sheriffSchedule.rank = sheriffScheduleJson.sheriff.rank;
                sheriffSchedule.actingRank = sheriffScheduleJson.sheriff.actingRank;
                sheriffSchedule.badgeNumber = sheriffScheduleJson.sheriff.badgeNumber;                                                     
                const isInLoanLocation = (sheriffScheduleJson.sheriff.homeLocation.id !=this.location.id)
                sheriffSchedule.conflicts =isInLoanLocation? this.extractInLoanLocationConflicts(sheriffScheduleJson.conflicts) :this.extractSchedules(sheriffScheduleJson.conflicts, false);        
                
                console.log(sheriffSchedule)
                
                this.dailySheriffSchedules.push(sheriffSchedule)
            }          
            this.splitDailySheriffPages();
            this.isDistributeDataMounted = true;            
            this.updateTable++;
        }

        public extractInLoanLocationConflicts(conflictsJson: conflictJsonType[]){
            let conflictsJsonAwayLocation: any[] = []
            const conflicts: scheduleInfoType[] = []
            for(const conflict of conflictsJson){ 
                //console.log(conflict) 
                conflict.start = moment(conflict.start).tz(this.location.timezone).format();
                conflict.end = moment(conflict.end).tz(this.location.timezone).format();              
                if(conflict.conflict !='AwayLocation' || conflict.locationId != this.location.id) continue;
                conflict['startDay']=conflict.start.substring(0,10);
                conflict['endDay']=conflict.end.substring(0,10);
                conflictsJsonAwayLocation.push(conflict);
            }
            conflictsJsonAwayLocation = _.sortBy(conflictsJsonAwayLocation,'start')

            for(const dateIndex in this.headerDates){
                const date = this.headerDates[dateIndex]
                const day = date.substring(0,10);
                let numberOfConflictsPerDay = 0;
                let previousConflictEndDate = moment(date).startOf('day').format();
                for(const conflict of conflictsJsonAwayLocation){

                    if(day>=conflict.startDay && day<=conflict.endDay)
                    { 
                        numberOfConflictsPerDay++;
                        if(Vue.filter('isDateFullday')(conflict.start,conflict.end)){                            
                            break;
                        } else {                            
                            numberOfConflictsPerDay++;
                            //console.log( numberOfConflictsPerDay)
                            const start = moment(previousConflictEndDate)
                            const end = moment(conflict.start)
                            const duration = moment.duration(end.diff(start)).asMinutes();
                            if(duration>5)
                                conflicts.push({
                                    id:'0',
                                    location:conflict.conflict=='AwayLocation'?conflict.location.name:'',
                                    dayOffset: Number(dateIndex), 
                                    date:date, 
                                    startTime:Vue.filter('beautify-time')(previousConflictEndDate), 
                                    endTime:Vue.filter('beautify-time')(conflict.start),
                                    type:'Unavailable',
                                    workSection: '',
                                    workSectionColor:''
                                })
                            previousConflictEndDate = conflict.end;  
                        }
                    }   
                }

                if( numberOfConflictsPerDay == 0){
                    conflicts.push({
                        id:'0',
                        location:'',
                        dayOffset: Number(dateIndex), 
                        date:date, 
                        startTime:'', 
                        endTime:'',
                        type:'Unavailable', 
                        workSection: '',
                        workSectionColor:''
                    })
                } else if( numberOfConflictsPerDay > 1){
                    const start = moment(previousConflictEndDate)
                    const end = moment(date).endOf('day')
                    const duration = moment.duration(end.diff(start)).asMinutes();
                    if(duration>5)
                        conflicts.push({
                            id:'0',
                            location: '',
                            dayOffset: Number(dateIndex), 
                            date:date, 
                            startTime:Vue.filter('beautify-time')(previousConflictEndDate), 
                            endTime:Vue.filter('beautify-time')(end.format()),
                            type:'Unavailable', 
                            workSection:'',
                            workSectionColor:''
                        })
                }
            }
            const shifts = this.extractSchedules(conflictsJson, true);
            for (const shift of shifts) {
                conflicts.push(shift);
            }
            return conflicts
        }

        public getConflictsType(conflict){
            if(conflict.conflict =='AwayLocation') return 'Loaned'
            else if(conflict.conflict =='Scheduled') return 'Shift'
            else return conflict.conflict
        }

        public getWorkSection(conflict){
            if(conflict.conflict =='Scheduled') {
                const WS = conflict.workSection?conflict.workSection: '';
                return {WS:WS, color:this.WSColors[WS]};
            } 
            else return {WS:'', color:''};
        }

        public sortEvents (events: any) {            
            return _.sortBy(events, "startTime");
        }
        
        public extractSchedules(conflictsJson, onlyShedules){

            const schedules: scheduleInfoType[] = []

            for(const conflict of conflictsJson){
                if (conflict.conflict=="Scheduled" && conflict.locationId != this.location.id) continue;
                if (conflict.conflict!="Scheduled" && onlyShedules) continue;
                conflict.start = moment(conflict.start).tz(this.location.timezone).format();
                conflict.end = moment(conflict.end).tz(this.location.timezone).format();               
                if(Vue.filter('isDateFullday')(conflict.start,conflict.end))
                {               
                    for(const dateIndex in this.headerDates){
                        const date = this.headerDates[dateIndex]
                        if(date>=conflict.start && date<=conflict.end)
                        {
                            schedules.push({
                                id:conflict.shiftId? conflict.shiftId:0,
                                location:conflict.conflict=='AwayLocation'?conflict.location.name:'',
                                dayOffset: Number(dateIndex), 
                                date:date, 
                                startTime:'', 
                                endTime:'',
                                type:this.getConflictsType(conflict),
                                subType: (conflict.sheriffEventType)?conflict.sheriffEventType:'',
                                workSection: this.getWorkSection(conflict).WS,
                                workSectionColor: this.getWorkSection(conflict).color
                            })        
                        }                       
                    }
                }
                else{
                    
                    for(const dateIndex in this.headerDates){
                        const date = this.headerDates[dateIndex].substring(0,10);
                        const nextDate = moment(this.headerDates[dateIndex]).add(1,'days').format().substring(0,10);
                        if(date == conflict.start.substring(0,10) && date == conflict.end.substring(0,10))
                        {  
                                                                                  
                            schedules.push({
                                id:conflict.shiftId? conflict.shiftId:0,
                                location:conflict.conflict=='AwayLocation'?conflict.location.name:'',
                                dayOffset: Number(dateIndex), 
                                date:this.headerDates[dateIndex], 
                                startTime:Vue.filter('beautify-time')(conflict.start), 
                                endTime:Vue.filter('beautify-time')(conflict.end), 
                                type:this.getConflictsType(conflict),                                
                                subType: (conflict.sheriffEventType)?conflict.sheriffEventType:'', 
                                workSection:this.getWorkSection(conflict).WS,
                                workSectionColor: this.getWorkSection(conflict).color
                            })        
                        } else if(date == conflict.start.substring(0,10) && nextDate == conflict.end.substring(0,10))
                        {  
                            const midnight = moment(conflict.start).endOf('day');                                                        
                            schedules.push({
                                id:conflict.shiftId? conflict.shiftId:0,
                                location:conflict.conflict=='AwayLocation'?conflict.location.name:'',
                                dayOffset: Number(dateIndex), 
                                date:this.headerDates[dateIndex], 
                                startTime:Vue.filter('beautify-time')(conflict.start), 
                                endTime:Vue.filter('beautify-time')(midnight.format()),
                                type:this.getConflictsType(conflict),
                                subType: (conflict.sheriffEventType)?conflict.sheriffEventType:'', 
                                workSection:this.getWorkSection(conflict).WS,
                                workSectionColor: this.getWorkSection(conflict).color
                            })
                            schedules.push({
                                id:conflict.shiftId? conflict.shiftId:0,
                                location:conflict.conflict=='AwayLocation'?conflict.location.name:'',
                                dayOffset: Number(dateIndex)+1, 
                                date:moment(this.headerDates[dateIndex]).add(1,'day').format(), 
                                startTime:'00:00', 
                                endTime:Vue.filter('beautify-time')(conflict.end),
                                type:this.getConflictsType(conflict),
                                subType: (conflict.sheriffEventType)?conflict.sheriffEventType:'', 
                                workSection:this.getWorkSection(conflict).WS,
                                workSectionColor: this.getWorkSection(conflict).color
                            })        
                        }                       
                    }
                } 
            }

            return schedules
        } 
        
        public splitSheriffPages(){
            this.sheriffPages =[]
            const PAGE_ITEMS=16
            const len = this.sheriffSchedules.length
            for(let page=1; page<=(Math.ceil(len/PAGE_ITEMS)); page++){
                this.sheriffPages.push({
                    start:(page-1)*PAGE_ITEMS,
                    end:Math.min(len, page*PAGE_ITEMS)
                })
            }  
            const mod = this.sheriffSchedules.length % PAGE_ITEMS
            this.marginToLastPageRows = (mod==0)? '0rem' :((PAGE_ITEMS-mod)*2.1)+'rem'
        }

        public splitDailySheriffPages(){
            this.sheriffPages =[]
            const PAGE_ITEMS=16
            const len = this.dailySheriffSchedules.length
            for(let page=1; page<=(Math.ceil(len/PAGE_ITEMS)); page++){
                this.sheriffPages.push({
                    start:(page-1)*PAGE_ITEMS,
                    end:Math.min(len, page*PAGE_ITEMS)
                })
            }  
            const mod = this.dailySheriffSchedules.length % PAGE_ITEMS
            this.marginToLastPageRows = (mod==0)? '0rem' :((PAGE_ITEMS-mod)*2.1)+'rem'
        }

    }
</script>

<style scoped>    
    .card {
        border: white;
    }

    .table{
        border: 2px solid;
    }

    .table >>> tr {
       border: 3px solid;       
    } 

    .table >>> th {
        border: 3px solid;
        background-color: rgb(190, 211, 233);
    }  
    .table >>> td {
        height: 2.5rem;
        border: 3px solid;
    }   

    .dot {
        height: 20px;
        width: 20px;
        background-color: black;
        color: white;
        padding: 0.05rem 0.3rem 0.75rem 0.35rem;
        font-size: 0.75rem;
        border-radius: 50%;
        display: inline-block;
    }

</style>