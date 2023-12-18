<template>
    <div>
        <b-table-simple small borderless>
            <b-tbody>
                <b-tr>
                    <b-td style="width:29%;">
                        <b-form-group style="margin: 0.25rem 0 0 0.5rem;">
                            <label class="h6 ml-1 mb-0 pb-0" > {{type}}: </label> 
                            <b-form-input
                                size = "sm"
                                v-model="selectedLeaveTraining"
                                type="text"
                                :placeholder="'Enter '+ type"
                                :state = "leaveTrainingState?null:false">                                           
                            </b-form-input>
                        </b-form-group>           
                    </b-td>
                    <b-td v-if="type == 'Training'" style="width:15%;">
                        <b-form-group style="margin: 0.25rem 0 0 0rem;">
                            <label class="h6 ml-1 mb-0 pb-0" > Validity: </label> 
                            <b-form-select
                                size = "sm"
                                :options="trainingValidityPeriod"
                                v-model="selectedTrainingValidityPeriod">
                            </b-form-select>
                        </b-form-group>           
                    </b-td>
                    <b-td v-if="type == 'Training'" style="width:9%;">
                        <b-form-group style="margin: 0.25rem 0 0 0rem;">
                            <label class="h6 ml-1 mb-0 pb-0" > Mandatory: </label> 
                            <b-form-checkbox
                                class="text-center"
                                size = "lg"                                
                                v-model="selectedTrainingMandatory">                                                                 
                            </b-form-checkbox>
                        </b-form-group>           
                    </b-td>
                    <b-td v-if="type == 'Training'" style="width:15%;">
                        <b-form-group style="margin: 0.25rem 0 0 0rem;">
                            <label class="h6 ml-1 mb-0 pb-0" > Advance Notice: </label> 
                            <b-form-select
                                size = "sm"
                                :options="trainingAdvanceNotice"                                
                                v-model="selectedTrainingAdvanceNotice">                                                                   
                            </b-form-select>
                        </b-form-group>           
                    </b-td>
                    <b-td v-if="type == 'Training'" style="width:7%;">
                        <b-form-group style="margin: 0.25rem 0 0 0rem;">
                            <label class="h6 ml-1 mb-0 pb-0" > Rotating: </label> 
                            <b-form-checkbox
                                class="text-center"
                                size = "lg"                                
                                v-model="selectedTrainingRotating">                                                                 
                            </b-form-checkbox>
                        </b-form-group>           
                    </b-td>
                    <b-td v-if="type == 'Training'" style="width:10%;">
                        <b-form-group style="margin: 0.25rem 0 0 0rem;">
                            <label class="h6 ml-1 mb-0 pb-0" > Category: </label> 
                            <b-form-select
                                size = "sm"
                                :options="trainingCategory"
                                v-model="selectedTrainingCategory">
                            </b-form-select>
                        </b-form-group>
                    </b-td>

                    <b-td style="width:15%;" >
                        <b-button                                    
                            style="margin: 1.9rem .5rem 0 1.2rem; padding:0 .5rem;"
                            variant="secondary"
                            @click="closeForm()">
                            Cancel
                        </b-button>   
                        <b-button                                    
                            style="margin: 1.9rem 0 0 0; padding:0 0.8rem; "
                            variant="success"                        
                            @click="saveForm()">
                            Save
                        </b-button>  
                    </b-td>
                </b-tr>   
            </b-tbody>
        </b-table-simple>  

        <b-modal v-model="showCancelWarning" id="bv-modal-leaveTraining-cancel-warning" header-class="bg-warning text-light">            
            <template v-slot:modal-title>
                <h2 v-if="isCreate" class="mb-0 text-light"> Unsaved New {{type}} </h2>                
                <h2 v-else class="mb-0 text-light"> Unsaved {{type}} Changes </h2>                                 
            </template>
            <p>Are you sure you want to cancel without saving your changes?</p>
            <template v-slot:modal-footer>
                <b-button variant="secondary" @click="$bvModal.hide('bv-modal-leaveTraining-cancel-warning')"                   
                >No</b-button>
                <b-button variant="success" @click="confirmedCloseForm()"
                >Yes</b-button>
            </template>            
            <template v-slot:modal-header-close>                 
                 <b-button variant="outline-warning" class="text-light closeButton" @click="$bvModal.hide('bv-modal-leaveTraining-cancel-warning')"
                 >&times;</b-button>
            </template>
        </b-modal> 

        <b-modal v-model="showSaveWarning" id="bv-modal-save-change-warning" header-class="bg-warning text-light m-0 pt-3 pb-0">            
            <template v-slot:modal-title>                                
                <h3 class="m-0 p-0 text-light"> <b-icon variant="danger" class="mr-2" icon="exclamation-triangle"/> Changes to {{type}} Type </h3>                                 
            </template>
            <h3 class="text-justify"> Are you sure you want to make changes to this {{type}} type? </h3>
            <template v-slot:modal-footer>
                <b-button variant="secondary" @click="$bvModal.hide('bv-modal-save-change-warning')"                   
                >Cancel</b-button>
                <b-button variant="success" @click="confirmedSaveForm()"
                >Confirm</b-button>
            </template>            
            <template v-slot:modal-header-close>                 
                 <b-button variant="outline-warning" class="text-light closeButton" @click="$bvModal.hide('bv-modal-save-change-warning')"
                 >&times;</b-button>
            </template>
        </b-modal>             
    </div>
</template>

<script lang="ts">
    import { Component, Vue, Prop } from 'vue-property-decorator';
    import { namespace } from 'vuex-class';
    
    import {leaveTrainingTypeInfoType}  from '@/types/ManageTypes/index';
    import {locationInfoType} from '@/types/common';     

    import "@store/modules/CommonInformation";
    const commonState = namespace("CommonInformation");

    @Component
    export default class AddLeaveTrainingForm extends Vue {        

        @commonState.State
        public location!: locationInfoType;

        @Prop({required: true})
        type!: string;
       
        @Prop({required: true})
        formData!: leaveTrainingTypeInfoType;

        @Prop({required: true})
        isCreate!: boolean;

        @Prop({required: true})
        sortOrder!: number;

        originalLeaveTraining = '';
        selectedLeaveTraining = '';

        trainingValidityPeriod = [
            {value:'',   text:'One Time'},
            {value:90,   text:'3 Months (90 days)'},
            {value:180,  text:'6 Months (180 days)'},
            {value:365,  text:'Annually (365 days)'},
            {value:730,  text:'Every Two Years (730 days)'},
            {value:1095, text:'Every Three Years (1095 days)'},
            {value:1461, text:'Every Four Years (1461 days)'},
            {value:1826, text:'Every Five Years (1826 days)'}
        ];

        trainingAdvanceNotice = [
            {value:'',   text:'Not Required'},
            {value:7,    text:'1 Week'},
            {value:14,   text:'2 Weeks'},
            {value:30,   text:'1 Month (30 days)'},
            {value:60,   text:'2 Months (60 days)'},
            {value:90,   text:'3 Months (90 days)'},            
        ]

        trainingCategory = [            
            {value:'Provincial Standard', text:'Provincial Standard'},
            {value:'Local', text:'Local'},
            {value:'Branch', text:'Branch'},            
        ];

        
        leaveTrainingState = true;

        formDataId = 0;
        showCancelWarning = false;
        showSaveWarning = false;

       
        selectedTrainingValidityPeriod: number | ""= ""
        selectedTrainingCategory = '';
        selectedTrainingAdvanceNotice: number | ""= "";
        selectedTrainingMandatory = true;
        selectedTrainingRotating = false;
       
        originalTrainingValidityPeriod: number | ""= "";
        originalTrainingCategory = '';
        originalTrainingAdvanceNotice: number | ""= "";
        originalTrainingMandatory = true;
        originalTrainingRotating = false;
        
        mounted()
        { 
            this.clearSelections();
            if(this.formData.id) {
                this.extractFormInfo();
            }               
        }        

        public extractFormInfo(){
            this.formDataId = this.formData.id? this.formData.id:0;
            this.originalLeaveTraining = this.selectedLeaveTraining = this.formData.code;
            if (this.type == 'Training'){
                this.originalTrainingValidityPeriod = this.selectedTrainingValidityPeriod = this.formData.validityPeriod? this.formData.validityPeriod : '';
                this.originalTrainingAdvanceNotice = this.selectedTrainingAdvanceNotice = this.formData.advanceNotice? this.formData.advanceNotice:'';
                this.originalTrainingCategory = this.selectedTrainingCategory = this.formData.category? this.formData.category:'';
                this.originalTrainingMandatory = this.selectedTrainingMandatory = this.formData.mandatory?this.formData.mandatory:false;
                this.originalTrainingRotating = this.selectedTrainingRotating = this.formData.rotating?this.formData.rotating:false;
            }         
            
        }

        public saveForm(){
            if(!this.isCreate && this.isChanged())
                this.showSaveWarning = true;
            else 
                this.confirmedSaveForm();               
        }              

        public confirmedSaveForm(){                
            this.leaveTrainingState   = true;

            if(!this.selectedLeaveTraining ){
                this.leaveTrainingState  = false;
            }else{
                this.leaveTrainingState  = true;

                const body = {
                    code: this.selectedLeaveTraining,
                    locationId: null,
                    id: this.formDataId,
                    sortOrderForLocation : {locationId: null, sortOrder: this.sortOrder}
                }

                if (this.type == 'Training'){                    
                    body['validityPeriod'] = this.selectedTrainingValidityPeriod
                    body['mandatory'] = this.selectedTrainingMandatory
                    body['rotating'] = this.selectedTrainingRotating
                    body['advanceNotice'] = this.selectedTrainingAdvanceNotice
                    body['category'] = this.selectedTrainingCategory
                }              
                
                this.$emit('submit', body, this.isCreate);                  
            }
        }

        public closeForm(){
            if(this.isChanged())
                this.showCancelWarning = true;
            else
                this.confirmedCloseForm();
        }

        public isChanged(){
            if(this.isCreate){

                if( this.selectedLeaveTraining) return true;
                return false;

            } else {                
                if (this.type == 'Training'){
                    if( this.originalLeaveTraining != this.selectedLeaveTraining ||
                        this.originalTrainingValidityPeriod != this.selectedTrainingValidityPeriod ||
                        this.originalTrainingAdvanceNotice != this.selectedTrainingAdvanceNotice ||
                        this.originalTrainingCategory != this.selectedTrainingCategory ||
                        this.originalTrainingMandatory != this.selectedTrainingMandatory ||
                        this.originalTrainingRotating != this.selectedTrainingRotating) {
                        return true;
                    } 
                    return false;
                } else {
                    if(this.originalLeaveTraining != this.selectedLeaveTraining) return true;
                    return false;
                }                
            }
        }

        public confirmedCloseForm(){           
            this.clearSelections();
            this.$emit('cancel');
        }

        public clearSelections(){
            this.selectedLeaveTraining = '';
            this.leaveTrainingState = true;            
        }

    }
</script>

<style scoped>
    td {
        margin: 0rem 0.5rem 0.1rem 0rem;
        padding: 0rem 0.5rem 0.1rem 0rem;
        
        background-color: white ;
    }
</style>