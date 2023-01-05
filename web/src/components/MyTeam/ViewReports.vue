<template>
    <b-card bg-variant="white">
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
                        <label class="h4 mb-2 p-0 float-left">Location</label> 
                        <b-form-select                                                                                                           
                            v-model="reportParameters.location">
                            <b-form-select-option value="All">
                                All Locations
                            </b-form-select-option>							
                            <b-form-select-option
                                v-for="homelocation in locationList" 
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
                bordered            
                small 
                responsive="sm">
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
    import {reportInfoType, locationInfoType} from '../../types/common';
    import { trainingReportInfoType } from '@/types/MyTeam';

    @Component({
        components: {
            PageHeader,
            Spinner
        }
    })
    export default class ViewReports extends Vue {

        @commonState.State
        public locationList!: locationInfoType[]; 

        dataLoaded = false;    
        error = '';
        updated = 0;
        printReady = false;
        reportParameters = {location: 'All'} as reportInfoType;        
        trainingReportData: trainingReportInfoType[] = []
        searching = false;
        generatingReport = false;
        reportTypeOptions = ['Training']
        reportTypeState = true;        

        trainingFields = [
            {key:"name",         label:"Name",                      thClass: 'border-bottom align-middle text-center', tdClass:'align-middle text-center'},
            {key:"trainingType", label:"Training Type",             thClass: 'border-bottom align-middle text-center', tdClass:'align-middle text-center'},
            {key:"start",        label:"Start",                     thClass: 'border-bottom align-middle text-center', tdClass:'align-middle text-center'},
            {key:"end",          label:"End",                       thClass: 'border-bottom align-middle text-center', tdClass:'align-middle text-center'},
            {key:"expiryDate",   label:"Certification Expiry Date", thClass: 'border-bottom align-middle text-center', tdClass:'align-middle text-center'}            
        ];
        
        mounted() {   
            this.trainingReportData = [];      
            this.reportParameters.location = 'All';     
            this.searching = false;
            this.dataLoaded = false;    
            this.generatingReport = false;     
        }
        
        public find(){ 

            this.trainingReportData = [];
            this.reportTypeState = true;
            if (!this.reportParameters.reportType){
                this.reportTypeState = false;
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
                this.gathertrainingReportData(data)
            }             
        }

        public gathertrainingReportData(data: any[]){

            let reportInfo: any[] = [];            
            
            if (this.reportParameters.location && this.reportParameters.location != 'All'){
                reportInfo = data.filter(sheriff=>(sheriff.homeLocationId == this.reportParameters.location))
            } else {
                reportInfo = data;
            }

            for (const sheriffData of reportInfo){

                if (sheriffData.training){
                    for (const trainingData of sheriffData.training){

                        const trainingInfo = {} as trainingReportInfoType;
                        trainingInfo.name = sheriffData.firstName + ' ' + sheriffData.lastName;
                        trainingInfo.trainingType = trainingData.trainingType.description;
                        trainingInfo.start = Vue.filter('beautify-date-time')(moment(trainingData.startDate).tz(trainingData.timezone).format());
                        trainingInfo.end = Vue.filter('beautify-date-time')(moment(trainingData.endDate).tz(trainingData.timezone).format());
                        trainingInfo.expiryDate = trainingData.trainingCertificationExpiry?Vue.filter('beautify-date-time')(moment(trainingData.trainingCertificationExpiry).tz(trainingData.timezone).format()):'';
                        this.trainingReportData.push(trainingInfo);
                    }
                }
            } 
            
            this.searching = false;
            this.dataLoaded = true;            
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

            const csvExporter = new ExportToCsv(options);
            csvExporter.generateCsv(this.trainingReportData);
            this.generatingReport = false;
        }

}
</script>

<style scoped>   

    .card {
        border: white;
    }

</style>