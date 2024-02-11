<template>
    <div>
        <b-modal v-model="showModal.show" header-class="bg-primary text-light">
           
            <template v-slot:modal-title>
                <div class="h2 mb-2 text-light"> Editing Duty: </div> 
                <div style="float:left; text-transform: capitalize;" class="h5 ml-0 p-0 mb-0">{{assignmentName}}</div>             
                <div style="float:left; margin:.1rem 0 0 1rem;" class="h5 text-warning p-0"> {{assignmentTime}}</div>
                <div style="float:left; margin:.1rem 0 0 1rem;" class="h6 text-white p-0"> {{assignmentDate| beautify-date-weekday}}</div>                 
            </template>

            <loading-spinner v-if="savingData" />
            <div v-else>
                <div v-if="!confirmView">
                    <b-row style="height:4.25rem; border-radius:4px;" class="mx-auto my-0 p-0 bg-primary text-white">
                        <div style="width: 2%;" />
                        <div style="width: 17%; margin:1.6rem 0 0 0;" class="h6 p-0">Comment:</div>
                        <b-form-group class="mt-2" style="width: 60%">                        
                            <b-form-textarea
                                v-model="selectedComment"
                                size="sm"
                                placeholder="Enter a comment"
                                type="text" 
                                :formatter="commentFormat"                           
                            ></b-form-textarea>
                        </b-form-group>
                        <div style="width: 2%;" />
                        <b-button
                            style="width:17%; height: 75%;"
                            variant="success"
                            class="mt-2"
                            @click="updateComment(duty.id, selectedComment)"
                            size="sm">
                            <b-icon-check2 style="padding:0; vertical-align: middle; margin-right: 0.25rem;"/>
                            Save Comment
                        </b-button>                                    
                    </b-row>
                </div>
                <div v-else>
                    <h2 class="mb-0 py-2 text-center text-light bg-warning">Confirm Delete Duty</h2>
                    <h4 class="mt-4 mx-3">Are you sure you want to delete this Duty?</h4>            
                </div>
            </div>

            <template v-slot:modal-footer>
                <b-button
                    v-if="!confirmView"
                    :disabled="!hasPermissionToExpireDuty || savingData"
                    size="sm"
                    variant="danger"
                    class="mr-auto"
                    @click="confirmView=true;"
                    ><b-icon-trash-fill style="padding:0; vertical-align: middle; margin-right: 0.25rem;" />
                    Delete Duty
                </b-button>
                <b-button
                    v-if="confirmView"
                    :disabled="!hasPermissionToExpireDuty || savingData"
                    size="sm"
                    variant="warning"
                    class="mr-auto"
                    @click="deleteDuty()"
                    ><b-icon-trash-fill style="padding:0; vertical-align: middle; margin-right: 0.25rem;" />
                    Confirm Delete
                </b-button>
                <b-button
                    :disabled="savingData"
                    size="sm"
                    variant="secondary"
                    @click="showModal.show=false;"
                    ><b-icon-x style="padding:0; vertical-align: middle; margin-right: 0.25rem;" />
                    {{confirmView?'Cancel':'Close'}}
                </b-button>			
            </template>    
                    
            <template v-slot:modal-header-close>                 
                <b-button variant="outline-warning" 
                    class="text-light closeButton" 
                    @click="showModal.show=false;"
                    >&times;
                </b-button>
            </template>
        </b-modal>
    </div>
</template>

<script lang="ts">
    import { Component, Vue, Prop, Watch } from 'vue-property-decorator';    
    import { namespace } from "vuex-class"; 
    import moment from 'moment-timezone';   

    import "@store/modules/CommonInformation";
    const commonState = namespace("CommonInformation");

    import { attachedDutyInfoType } from '@/types/DutyRoster';
    import { userInfoType } from '@/types/common';


    @Component  
    export default class EditAssignmentDutyModal extends Vue {

        @Prop({required: true})
        showModal!: {show: boolean};

        @Prop({required: true})
        duty!: attachedDutyInfoType;

        @commonState.State
        public userDetails!: userInfoType;

        @Watch('showModal.show')
        openModal(show){
            if(show) this.initModal()
        }

        hasPermissionToEditDuty=false;
        hasPermissionToExpireDuty=false;
        assignmentName=""
        assignmentTime=""
        assignmentDate=""
        selectedComment=""
        errMsg=""
        confirmView=false
        savingData=false


        mounted(){
            this.hasPermissionToEditDuty = this.userDetails.permissions.includes("EditDuties");
            this.hasPermissionToExpireDuty = this.userDetails.permissions.includes("ExpireDuties");
            
        }

        public initModal(){
            this.savingData=false
            this.confirmView=false
            this.selectedComment = this.duty.comment? this.duty.comment : ''
            this.assignmentName = this.duty.assignment.lookupCode.code+(this.duty.assignment.name? ' ('+this.duty.assignment.name+')': '')
            this.assignmentTime = this.duty.assignment.start.slice(0,5)+' - '+this.duty.assignment.end.slice(0,5)
            this.assignmentDate = moment(this.duty.startDate).tz(this.duty.timezone).format('YYYY-MM-DD')
        }

        public commentFormat(value) {
            return value.slice(0,100);
        }

        public updateComment(id: number, comment: string){
            this.savingData=true;
            this.errMsg = "";
            const url = 'api/dutyroster/updatecomment?dutyId='+id+'&comment='+comment;
            this.$http.put(url)
                .then(response => {
                    if(response.status == 204){                        
                        this.$emit('change');
                        this.showModal.show=false;
                    }else{
                        this.savingData=false
                        this.errMsg = response.data? response.data: (response.status+' '+response.statusText);                        
                    }
                }, err => {
                    this.errMsg = err.response.data.error? err.response.data.error: (err.response.data +'('+err.response.status +' '+err.response.statusText+')') ;                   
                    this.savingData=false
                })
        }

        public deleteDuty(){
            this.savingData=true;
            this.errMsg = "";
            const body = [this.duty.id]
            const url = 'api/dutyroster?id=' + this.duty.id;        
            this.$http.delete(url, {data:body})
                .then(response => {
                    this.$emit('change'); 
                    this.showModal.show=false;                   
                }, err=>{
                    this.errMsg = err.response.data.error;
                    this.savingData=false
                });		
            
        }

    }
</script>
