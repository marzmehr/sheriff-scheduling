<template>
    <b-card bg-variant="white">
        <b-row>
            <b-col cols="11">
                <page-header pageHeaderText="Reports"></page-header>
            </b-col>            
        </b-row>

        <b-card class="border-0 w-80 text-center mx-auto"> 

            <b-row class="h3 ml-1 mb-3 text-primary">
                Report Parameters:
            </b-row>
            
            <b-row class="ml-1 mt-3">                
                <b-col>                    
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
                </b-col>
                <b-col>
                    <b-form-group style="margin: 0.05rem 0 0 0.5rem; height: 2rem;">
                        <label class="h4 mb-2 p-0 float-left">Location</label> 
                        <b-form-select                                                                                                           
                            v-model="reportParameters.location">
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
                    <b-col cols="9"></b-col>
                    <b-col cols="3">
                        <b-button
                            name="search"
                            style="margin-top: 0rem; padding: 0.25rem 2rem;" 
                            :disabled="searching"
                            v-on:keyup.enter="find()"
                            variant="success"
                            @click="find()"
                            ><spinner color="#FFF" v-if="searching" style="margin:0; padding: 0; height:2rem; transform:translate(0px,-24px);"/>
                            <span style="font-size: 20px;" v-else>Generate Report</span>
                        </b-button>
                    </b-col>  
                       
            </b-row>
                   
        </b-card> 

        <loading-spinner color="#000" v-if="searching && !dataLoaded" waitingText="Loading ..." />         

       

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
        reportParameters = {} as reportInfoType;
        results;
        searching = false;
        reportTypeOptions = ['Training']
        reportTypeState = true;
        
        mounted() {              
            this.searching = false;
            this.dataLoaded = false;         
        }
        
        public find(){ 
            
            this.reportTypeState = true;
            if (!this.reportParameters.reportType){
                this.reportTypeState = false;
            } else {

                this.dataLoaded = false;
                this.searching = true;
                const start = this.reportParameters.startDate? this.reportParameters.startDate?.slice(0,10) : null
                const end = this.reportParameters.endDate? this.reportParameters.endDate?.slice(0,10) : null
                const location = this.reportParameters.location? this.reportParameters.location : null
                const url = '/statistics/?start_date='+start+
                            '&end_date='+end+
                            '&tz='+moment().utcOffset() + 
                            '&location='+location+
                            '&reportType='+this.reportParameters.reportType;
                
                this.$http.get("api/sheriff/training")
                .then((response) => {            
                    // if(response?.data){
                    //     this.results = response.data;
                    //     this.generateExcel();                                          
                    // }
                    this.searching = false;
                    
                },(err) => {
                    this.searching = false;
                    this.error = err.response.data           
                });  

            }           
            
        }

        public generateExcel(){ 

            if (this.reportParameters.reportType == 'Training'){
                this.gatherTrainingReportData()
            }

            this.dataLoaded = true;  

        }

        public gatherTrainingReportData(){

            const fileName = 'Training Report';
            const data = [
                {
                    name: 'Marzieh Mehrnejad',
                    trainingType: 'Fire Arm',
                    start: '2022-01-11',
                    end: '2022-01-16',
                    expiryDate: '2023-01-16'
                },
                {
                    name: 'Wade Barnes',
                    trainingType: 'DNA',
                    start: '2022-03-11',
                    end: '2022-03-16',
                    expiryDate: '2023-03-16'
                },
                {
                    name: 'Travis Semple',
                    trainingType: 'Search Gate',
                    start: '2022-05-11',
                    end: '2022-05-16',
                    expiryDate: '2023-05-16'
                }
            ];
 
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
 
            csvExporter.generateCsv(data);
        }


}
</script>

<style scoped>   

    .card {
        border: white;
    }

</style>