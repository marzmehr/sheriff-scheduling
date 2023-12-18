<template>
    <b-card >
        <div v-if="!dataReady">
            <loading-spinner />
        </div>
        <div v-else>
            <b-row class="mb-5">
                <b-col cols="2" class="">
                    <b-img-lazy v-if="imgError==false" style="width:100%; margin:0 0 0 0;" 
                        src="./images/bcss-crest-lw.png"
                        @error.native="handleImage(true)"                                                   
                        alt="B.C. Sheriff System"/>
                    <img v-if="imgError==true" style="width:100%; margin:0 0 0 0;" 
                        src="../assets/bcss-crest-lw.png"
                        @error="handleImage(false)"                      
                        alt="B.C. Sheriff System"/>
                </b-col>
                <b-col cols="10">
                    <b-row class="info-box">
                        <b-col >
                            <b-col class="text-light text-center mt-0">
                                <div style="font-size:25pt;" ><b>Sheriff Scheduling System</b></div>                                
                            </b-col>
                            <div class=" mt-n1 mb-2 text-center text-shift" style="font-size:16pt;">
                                <i>Welcome <b class="ml-1">{{sheriffName}}</b></i>
                            </div>
                        </b-col>

                        <b-col cols="5" >
                            <div class="float-right mr-4">
                                <div class="text-info h2 mt-3"><b-icon-house /> {{location.name}}</div>                        
                                <div class="text-warning mt-n3" style="font-size:16pt;"><b-icon-calendar2 /> <b class="ml-2">{{today}}</b> </div>                                                    
                            </div> 
                        </b-col>   
                    </b-row>
                    <b-row class="mt-5">
                        <b-col cols="6" v-if="trainingAlert">
                            <b-card class="border training-box" no-body>
                                <b-card-header class="h3 bg-primary text-white">Training Status</b-card-header>
                                <b-card-body>                        
                                    <training-status-card :training="training.danger" />
                                    <training-status-card :training="training.alert" />  
                                    <training-status-card :training="training.warning" />
                                    <training-status-card :training="training.notify" />
                                </b-card-body>
                            </b-card>
                        </b-col>
                        <b-col cols="6" v-if="sheriffEvents.length>0">
                            <b-card class="border training-box" no-body>
                                <b-card-header class="h3 bg-primary text-white">Upcoming Events</b-card-header>
                                <b-card-body>                        
                                    <b-alert
                                        v-for="item,inx in sheriffEvents"
                                        :key="'sheriff-events-'+inx"
                                        class="mx-2 my-3"
                                        variant="info"
                                        :show="true">
                                        <b-icon-box-arrow-left v-if="item.type=='Loaned'" font-scale="1.5" v-b-tooltip.hover.v-primary.left="'Loaned To'" class="mr-1 mt-0 mb-n1" />                                
                                        <font-awesome-icon v-if="item.type=='Training'" icon="graduation-cap" v-b-tooltip.hover.v-primary.left="'Training'"  style="font-size: 1.5rem;" />
                                        <b class=""> {{item.start | event-date-time}}</b>
                                        <i class="ml-4 text-dark">{{item.name}}</i>
                                        <b-icon-chat-square-text-fill v-if="item.comment" v-b-tooltip.hover.left="item.comment"  class="ml-2" variant="info" font-scale="0.99"/> 
                                    </b-alert>
                                </b-card-body>
                            </b-card>
                        </b-col>
                    </b-row>
                </b-col>                  
            </b-row>            
        </div>
        
    </b-card>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { namespace } from 'vuex-class';
import moment from 'moment-timezone';
import * as _ from 'underscore';
import "@store/modules/CommonInformation";
import { locationInfoType, userInfoType } from '@/types/common';
import { teamMemberJsonType, userEventsInfoType } from '@/types/MyTeam/jsonTypes';
import { trainingReportInfoType, trainingStatusCardInfoType, trainingStatusInfoType } from '@/types/MyTeam';
import { leaveTrainingTypeInfoType } from '@/types/ManageTypes';
import TrainingStatusCard from './common/TrainingStatusCard.vue'

const commonState = namespace("CommonInformation");    

@Component({
    components:{
        TrainingStatusCard
    }
})
export default class Home extends Vue {
    
    @commonState.State
    public userDetails!: userInfoType;

    sheriffName = ''
    location = {} as locationInfoType;
    
    trainingTypeOptions: leaveTrainingTypeInfoType[] = [];
    statusOptions: trainingStatusInfoType = { danger:'Not Taken', alert:'Expired', warning:'Requalification <br> Requierd', notify:'Requalify Soon' };
    training: trainingStatusCardInfoType = { danger: [], alert: [], warning: [], notify: [] };

    trainingAlert=false;

    sheriffEvents: userEventsInfoType[] = []

    today=""
    dataReady=false
    errorText=''
    imgError=false;

    mounted() {
        this.dataReady=false;
        this.trainingAlert=false;
        this.getTrainingTypes()
    }

    handleImage(imgErr: boolean){
        console.log(imgErr)
        this.imgError=imgErr
    }

    public getTrainingTypes() {                      
                
        const url = 'api/managetypes?codeType=TrainingType&showExpired=false';
        this.$http.get(url)
            .then(response => {
                if(response.data){
                    this.trainingTypeOptions = response.data;
                    this.loadUserDetails(this.userDetails.userId)                  
                }
                else 
                    this.dataReady = true;
                
            },err => {
                console.log(err.response)
                this.dataReady = true; 
            }) 
                
    }

    public loadUserDetails(userId): void {
        this.errorText='';
        this.dataReady=false;

        const url = 'api/sheriff/' + userId;
        this.$http.get(url)
            .then(response => {
                if(response.data){                                              
                   this.extractUserInfo(response.data);          
                }else  
                    this.dataReady=true;                  
            },err => {
                this.errorText=err.response.statusText+' '+err.response.status + '  - ' + moment().format();
                this.dataReady=true;              
            });
    }


    public extractUserInfo(user: teamMemberJsonType){
        //
        // console.log(user)
        this.location = user.homeLocation
        this.sheriffName = user.firstName + ' ' + user.lastName; 
        this.extractTrainings(user);
        this.extractAwayLocations(user);
        this.sheriffEvents = _.sortBy(this.sheriffEvents, 'start')
        this.today = moment().tz(this.location.timezone).format("dddd - MMM DD, YYYY");
        this.dataReady=true;
    }

    
    public extractTrainings(sheriffData){
        const mandetoryTrainings = this.trainingTypeOptions.filter(training => training.mandatory)
        const sheriffTrainingsId = sheriffData.training? sheriffData.training.map(training => training.trainingTypeId): [];
        const sheriffTrainings = sheriffData.training? JSON.parse(JSON.stringify(sheriffData.training)) : [];
        
        for(const training of mandetoryTrainings){
            if(!sheriffTrainingsId.includes(training.id)){
                sheriffTrainings.push({
                    comment: "",
                    endDate: "",
                    firstNotice: false,
                    id: null,
                    sheriffId: sheriffData.id,
                    startDate: "",
                    timezone: "",
                    trainingCertificationExpiry: "",
                    trainingType: training,
                    trainingTypeId: training.id
                })
            }
        }
        this.training = { danger:[], alert:[], warning:[], notify:[] }
        for (const trainingData of sheriffTrainings){
            this.addTrainingToReport(sheriffData, trainingData);            
        }
    }

    public addTrainingToReport(sheriffData, trainingData){
        //console.log(sheriffData)
        let rowType = ''
        const trainingInfo = {} as trainingReportInfoType;
        trainingInfo.name = sheriffData.firstName + ' ' + sheriffData.lastName;
        trainingInfo.sheriffId = sheriffData.id;
        trainingInfo.trainingType = trainingData.trainingType.description;
        const timezone = trainingData.timezone?trainingData.timezone:'America/Vancouver';
        trainingInfo.start = trainingData.startDate? moment(trainingData.startDate).tz(timezone).format():'';
        trainingInfo.end = trainingData.endDate? moment(trainingData.endDate).tz(timezone).format():'';
        trainingInfo.expiryDate = trainingData.trainingCertificationExpiry? moment(trainingData.trainingCertificationExpiry).tz(timezone).format():'';
        let fullExpiryDate = '';
        if(trainingData.trainingCertificationExpiry){
            if(this.isRotatingTraining(trainingData.trainingType))
                fullExpiryDate = moment(trainingData.trainingCertificationExpiry).tz(timezone).format()
            else
                fullExpiryDate = moment(trainingData.trainingCertificationExpiry).tz(timezone).add(1,'year').format()
        } 
        
        trainingInfo.excluded = false;
        const todayDate = moment().tz(timezone).format();
        const advanceNoticeDate = moment().tz(timezone).add(trainingData.trainingType.advanceNotice, 'days').format()

        if(!trainingData.endDate) rowType ='danger'
        else if(fullExpiryDate && todayDate>fullExpiryDate) rowType ='alert'
        else if(trainingInfo.expiryDate && todayDate>trainingInfo.expiryDate) rowType ='warning'
        else if(trainingInfo.expiryDate && trainingData.trainingType.advanceNotice && advanceNoticeDate>trainingInfo.expiryDate) rowType ='notify'
        trainingInfo['_rowVariant'] = rowType; //danger alert warning notify
        trainingInfo.status = rowType? this.statusOptions[rowType] : ''
        // console.log(trainingInfo)
        
        if(rowType){
            this.trainingAlert=true;
            this.training[rowType].push(trainingInfo)
        }
        const currentDate = moment().format()
        const nextWeekDate = moment().add(7,'days').format()
        if(currentDate<=trainingInfo.start && nextWeekDate>=trainingInfo.start){
            // console.log(trainingInfo.trainingType)
            this.sheriffEvents.push({
                name: trainingInfo.trainingType,
                type: 'Training',
                start: trainingInfo.start,
                comment: trainingData.comment
            })
        }        
    }

    public extractAwayLocations(sheriffData){
        for (const awayInfo of sheriffData.awayLocation){
            const start = awayInfo.startDate? moment(awayInfo.startDate).tz(awayInfo.timezone).format():'';
            const currentDay = moment().tz(awayInfo.timezone).startOf("day").format();            
            if(start && currentDay <= start){
                this.sheriffEvents.push({
                    name: awayInfo.location.name,
                    type: 'Loaned',
                    start: start,
                    comment: awayInfo.comment
                })
            }
        }
    }

    public isRotatingTraining(trainingType){
        const yearsInDays = [365, 730, 1095, 1461, 1826, 2191, 2556, 2922, 3287, 3652]; 
        return trainingType.rotating || !yearsInDays.includes(trainingType.validityPeriod);               
    }

}
</script>

<style scoped>

    .card {
        border: white;
    }

    .info-box {
        margin: 0 1.5rem;
        border-radius: 6px;
        /* background: #487080; */
        background: #024f6d;
        color: white;
        box-shadow: 0 6px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);
    }

    .training-box {
        margin: 0 1.5rem;
        font-size: 15pt;
        background: #eef3f5;
        box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);
    }

</style>
