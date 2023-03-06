<template>
    <b-card v-if="dataReady" bg-variant="white">
        <b-row>
            <b-col cols="12">
                <page-header pageHeaderText="Reports"></page-header>
            </b-col>            
        </b-row>

        <b-card class="border-0 text-center"> 

            <b-row class="h4 ml-1 mb-3 text-primary">
                Search Criteria:
            </b-row>
            
            <b-row class="ml-1 mt-3">                
                <!-- <b-col>                    
                    <b-form-group>  
                        <label class="h4 mb-2 p-0 float-left"> From: </label>
                        <b-form-datepicker
                            class="mb-1"                        
                            v-model="reportParameters.startDate"
                            placeholder="Start Date"
                            :date-format-options="{ year: 'numeric', month: 'short', day: '2-digit' }"
                            locale="en-US">
                        </b-form-datepicker>
                    </b-form-group>
                </b-col>
                <b-col>                    
                    <b-form-group>  
                        <label class="h4 mb-2 p-0 float-left"> To: </label>
                        <b-form-datepicker
                            class="mb-1"
                            v-model="reportParameters.endDate"
                            placeholder="End Date"                            
                            :date-format-options="{ year: 'numeric', month: 'short', day: '2-digit' }"                            
                            locale="en-US">
                        </b-form-datepicker>
                    </b-form-group>
                </b-col> -->
                <b-col>
                    <b-form-group style="margin: 0.05rem 0 0 0.5rem; height: 2rem;">
                        <label class="h4 mb-2 p-0 float-left">Region</label> 
                        <b-form-select                                                                                                           
                            v-model="reportParameters.region"
                            @change="updateRegion()">
                            <b-form-select-option value="All">
                                All Regions
                            </b-form-select-option>							
                            <b-form-select-option
                                v-for="homeRegion in regionList" 
                                :key="homeRegion.id"
                                :value="homeRegion.id">
                                    {{homeRegion.name}}
                            </b-form-select-option>    
                        </b-form-select>
                    </b-form-group>
                </b-col>
                <b-col>
                    <b-form-group :key="updateRegionId" style="margin: 0.05rem 0 0 0.5rem; height: 2rem;">
                        <label class="h4 mb-2 p-0 float-left">Location</label> 
                        <b-form-select                                                                                                           
                            v-model="reportParameters.location">
                            <b-form-select-option value="All">
                                All Locations
                            </b-form-select-option>							
                            <b-form-select-option
                                v-for="homelocation in locationOptionsList" 
                                :key="homelocation.id"
                                :value="homelocation.id">
                                    {{homelocation.name}}
                            </b-form-select-option>    
                        </b-form-select>
                    </b-form-group>
                </b-col>   
                <b-col>
                    <b-form-group style="margin: 0.05rem 0 0 0.5rem;"> 
                        <label class="h4 mb-2 p-0 float-left"> Report Type: </label>
                        <b-form-select                          
                            v-model="reportParameters.reportType"
                            :state = "reportTypeState?null:false">
                                <b-form-select-option
                                    state=true
                                    v-for="reportType in reportTypeOptions" 
                                    :key="reportType"
                                    :value="reportType">
                                        {{reportType}}
                                </b-form-select-option>     
                        </b-form-select>
                    </b-form-group>
                </b-col>
            </b-row>
            <b-row v-if="reportParameters.reportType && reportParameters.reportType == 'Training'"  class="ml-1 mt-3">
                <b-col>                    
                </b-col> 
                <b-col>                    
                </b-col>   
                <b-col>
                    <b-form-group style="margin: 0.05rem 0 0 0.5rem;"> 
                        <label class="h4 mb-2 p-0 float-left"> Training Type: </label>
                        <b-form-select                          
                            v-model="reportParameters.reportSubtype"
                            :state = "reportSubTypeState?null:false">
                                <b-form-select-option value="All">
                                    All Training Types
                                </b-form-select-option>
                                <b-form-select-option
                                    state=true
                                    v-for="trainingType in trainingTypeOptions" 
                                    :key="trainingType.id"
                                    :value="trainingType.id">
                                        {{trainingType.code}}
                                </b-form-select-option>     
                        </b-form-select>
                    </b-form-group>
                </b-col>
            </b-row>
            <b-row class="mt-5">
                <b-col cols="10"></b-col>
                <b-col cols="2">
                    <b-button                        
                        style="margin-top: 0rem; padding: 0.25rem 1rem;" 
                        :disabled="searching"
                        v-on:keyup.enter="find()"
                        variant="success"
                        @click="find()"
                        ><spinner color="#FFF" v-if="searching" style="margin:0; padding: 0; height:2rem; transform:translate(0px,-24px);"/>
                        <span style="font-size: 18px;" v-else><b-icon-table class="mr-2"/>Generate Report</span>
                    </b-button>
                </b-col> 
            </b-row>
                   
        </b-card> 

        <loading-spinner color="#000" v-if="searching && !dataLoaded" waitingText="Loading ..." />  

        <b-row v-if="!searching && dataLoaded && trainingReportData.length == 0" class="h4 ml-3 mb-3 text-primary">
            No Records Found.
        </b-row>  
        
        <b-card class="text-center" v-if="trainingReportData.length > 0">  

            <b-table            
                :items="trainingReportData"
                :fields="trainingFields"     
                sort-by="start"       
                bordered            
                small 
                responsive="sm">
                <template v-slot:cell(start) ="data">{{data.value | beautify-date}}</template>
                <template v-slot:cell(end) ="data">{{data.value | beautify-date}}</template>
                <template v-slot:cell(expiryDate) ="data">{{data.value | beautify-date}}</template>
            </b-table>

            <b-row class="mt-5">
                <b-col cols="10"></b-col>
                <b-col cols="2">
                    <b-button                        
                        style="margin-top: 0rem; padding: 0.25rem 1rem;" 
                        :disabled="generatingReport"
                        v-on:keyup.enter="downloadReport()"
                        variant="primary"
                        @click="downloadReport()"
                        ><spinner color="#FFF" v-if="generatingReport" style="margin:0; padding: 0; height:2rem; transform:translate(0px,-24px);"/>
                        <span style="font-size: 18px;" v-else><b-icon-download class="mr-2"/>Download SCV File</span>
                    </b-button>
                </b-col> 
            </b-row>            

        </b-card>

    </b-card>
</template>

<script lang="ts">
    import { Component, Vue } from 'vue-property-decorator';
    import { namespace } from 'vuex-class';
    import moment from 'moment-timezone';
    import * as _ from 'underscore';  
    import { ExportToCsv } from 'export-to-csv';

    import "@store/modules/CommonInformation";
    const commonState = namespace("CommonInformation");      
    import PageHeader from "@components/common/PageHeader.vue";
    import Spinner from "@components/Spinner.vue";
    
    import {reportInfoType, locationInfoType, regionInfoType} from '@/types/common';
    import { trainingReportInfoType } from '@/types/MyTeam';
    import { leaveTrainingTypeInfoType } from '@/types/ManageTypes';

    @Component({
        components: {
            PageHeader,
            Spinner
        }
    })
    export default class ViewReports extends Vue {

        @commonState.State
        public locationList!: locationInfoType[]; 

        @commonState.State
        public regionList!: regionInfoType[]; 

        dataReady = false;
        dataLoaded = false;    
        error = '';
        updateRegionId = 0;
        printReady = false;
        reportParameters = {region: 'All', location: 'All', reportSubtype: 'All'} as reportInfoType;        
        trainingReportData: trainingReportInfoType[] = []
        searching = false;
        generatingReport = false;
        reportTypeOptions = ['Training']
        reportTypeState = true;        
        trainingTypeOptions: leaveTrainingTypeInfoType[] = [];
        reportSubTypeState = true; 

        locationOptionsList: locationInfoType[] = []; 

        trainingFields = [
            {key:"name",         label:"Name",                      thClass: 'border-bottom align-middle text-center', tdClass:'align-middle text-center', sortable: true},
            {key:"trainingType", label:"Training Type",             thClass: 'border-bottom align-middle text-center', tdClass:'align-middle text-center', sortable: true},
            {key:"start",        label:"Start",                     thClass: 'border-bottom align-middle text-center', tdClass:'align-middle text-center', sortable: true},
            {key:"end",          label:"End",                       thClass: 'border-bottom align-middle text-center', tdClass:'align-middle text-center', sortable: true},
            {key:"expiryDate",   label:"Certification Expiry Date", thClass: 'border-bottom align-middle text-center', tdClass:'align-middle text-center', sortable: true}            
        ];
        
        mounted() {   
            this.dataReady = false;
            this.trainingReportData = [];  
            this.reportParameters.region = 'All';     
            this.reportParameters.location = 'All';  
            this.reportParameters.reportSubtype = 'All';   
            this.searching = false;              
            this.dataLoaded = false;            
            this.generatingReport = false;     
            this.locationOptionsList = this.locationList;
            this.getTrainingTypes();
        }
        
        public find(){ 

            this.trainingReportData = [];
            this.reportTypeState = true;
            this.reportSubTypeState = true;
            if (!this.reportParameters.reportType){
                this.reportTypeState = false;
            } else if (!this.reportParameters.reportSubtype){
                this.reportSubTypeState = false;
            } else {

                this.dataLoaded = false;
                this.searching = true;
                
                this.$http.get("api/sheriff/training")
                .then((response) => {            
                    if(response?.data){                     
                        this.extractData(response.data);                                          
                    }                    
                    
                },(err) => {
                    this.searching = false;
                    this.error = err.response.data           
                });
            } 
        }

        public extractData(data){ 

            if (this.reportParameters.reportType == 'Training'){
                this.gatherTrainingReportData(data)
            }             
        }

        public updateRegion(){
            
            if (this.reportParameters.region != 'All'){
                this.locationOptionsList = this.locationList.filter(location=>{if(location.regionId == this.reportParameters.region)return true;});                
            } else {
                this.locationOptionsList = this.locationList;
            }
            this.updateRegionId ++; 
        }

        public gatherTrainingReportData(data: any[]){

            let reportInfo: any[] = [];               
            
            if (this.reportParameters.location && this.reportParameters.location != 'All'){
                reportInfo = data.filter(sheriff=>(sheriff.homeLocationId == this.reportParameters.location));               
                
            } else {
                reportInfo = data.filter(sheriff=>(this.locationOptionsList.some(location => sheriff.homeLocationId == location.id)))
            }

            for (const sheriffData of reportInfo){

                if (sheriffData.training && sheriffData.isEnabled){
                    for (const trainingData of sheriffData.training){
                        if (this.reportParameters.reportSubtype != 'All' && this.reportParameters.reportSubtype == trainingData.trainingType.id){
                            this.addTrainingToReport(sheriffData, trainingData);
                        } else if (this.reportParameters.reportSubtype == 'All') {
                            this.addTrainingToReport(sheriffData, trainingData);
                        }
                    }
                }
            } 
            
            this.searching = false;
            this.dataLoaded = true;            
        }

        public addTrainingToReport(sheriffData, trainingData){

            const trainingInfo = {} as trainingReportInfoType;
            trainingInfo.name = sheriffData.firstName + ' ' + sheriffData.lastName;
            trainingInfo.trainingType = trainingData.trainingType.description;
            const timezone = trainingData.timezone?trainingData.timezone:'America/Vancouver';
            trainingInfo.start = moment(trainingData.startDate).tz(timezone).format();
            trainingInfo.end = moment(trainingData.endDate).tz(timezone).format();
            trainingInfo.expiryDate = trainingData.trainingCertificationExpiry?moment(trainingData.trainingCertificationExpiry).tz(timezone).format():'';
            this.trainingReportData.push(trainingInfo);
        }

        public downloadReport(){ 

            this.generatingReport = true;

            const fileName = 'Training Report';
            const options = { 
                fieldSeparator: ',',
                quoteStrings: '"',
                decimalSeparator: '.',
                showLabels: true, 
                showTitle: false,
                title: '',
                filename: fileName,
                useTextFile: false,
                useBom: true,
                useKeysAsHeaders: false,
                headers: ['Name', 'Training Type', 'Start Date', 'End Date', 'Expiry Date']
            };

            const reportData: trainingReportInfoType[] = [];

            for (const trainingData of this.trainingReportData){

                const trainingInfo = {} as trainingReportInfoType;
                trainingInfo.name = trainingData.name;
                trainingInfo.trainingType = trainingData.trainingType;
                trainingInfo.start = trainingData.start?.length>0?Vue.filter('beautify-date')(trainingData.start):'';
                trainingInfo.end = trainingData.end?.length>0?Vue.filter('beautify-date')(trainingData.end):'';
                trainingInfo.expiryDate = trainingData.expiryDate?.length>0?Vue.filter('beautify-date')(trainingData.expiryDate):''; 
                reportData.push(trainingInfo)                
            }

            const csvExporter = new ExportToCsv(options);
            csvExporter.generateCsv(reportData);
            this.generatingReport = false;
        }

        public getTrainingTypes() {                      
                
            const url = 'api/managetypes?codeType=TrainingType&showExpired=false';
            this.$http.get(url)
                .then(response => {
                    if(response.data){
                        this.extractTrainingTypes(response.data);                        
                    }
                   
                },err => {
                    console.log(err.response)
                    this.dataLoaded = true; 
                }) 
                  
        }

        public extractTrainingTypes(trainingTypesJson) {

            this.trainingTypeOptions = [];
            let sortIndex = trainingTypesJson.length? 5000+trainingTypesJson.length : 0;
            for(const trainingJson of trainingTypesJson)
            {                
                const leaveTraining = {} as leaveTrainingTypeInfoType;
                leaveTraining.id = trainingJson.id;
                leaveTraining.code = trainingJson.code;
                
                leaveTraining['_rowVariant'] = '';
                let sortOrderOffset = 0;
                if(trainingJson.expiryDate){
                    leaveTraining['_rowVariant'] = 'info';
                    sortOrderOffset = 10000;
                }
                leaveTraining.sortOrder = trainingJson.sortOrderForLocation?trainingJson.sortOrderForLocation.sortOrder:(sortOrderOffset+sortIndex++);
                leaveTraining.type = trainingJson.type;
                this.trainingTypeOptions.push(leaveTraining)                
            }
            this.dataReady = true;
           
        }

}
</script>

<style scoped>   

    .card {
        border: white;
    }

</style>
