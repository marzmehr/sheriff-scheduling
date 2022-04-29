<template>
    <div v-if="dataready">
        <b-row style="width:95%; transform:translate(0,-3rem);">
            <div v-if="!multipleAssignments" class="h4 text-white ml-2 p-0 mb-0">{{assignmentName|truncate(30)}}</div> 
            <div v-if="multipleAssignments" class="h4 text-warning ml-2 mr-4 p-0 mb-0"> Multiple assignments are selected</div> 

            <div v-if="!multipleAssignments" style="float:left;font-size:14pt;" class="h4 text-warning ml-2 p-0 mb-0"> {{dutyBlock.startTimeString}} - {{dutyBlock.endTimeString}}</div>
            <b-button v-if="!multipleAssignments" style="margin:-0.45rem 0 0 1rem;" size="sm p-1" variant="info" @click="editDuty">Edit details</b-button>               

            <b-button style="margin:-0.45rem 0 0 1rem; font-size:8pt;" class="bg-success text-white p-1"  @click="drop('00000-00000-11111')">Not Required</b-button>
            <b-button style="margin:-0.45rem 0 0 0.25rem; font-size:8pt;" class="bg-danger text-white p-1"  @click="drop('00000-00000-22222')">Not Available</b-button>
            <b-button style="margin:-0.45rem -2rem 0 0.25rem; font-size:8pt;" class="bg-bright text-white p-1" @click="drop('00000-00000-33333')">Closed for Day</b-button>
        </b-row>
        <b-row style="background:#AABBCC; font-size:10pt; margin:-2.5rem -1rem 0.5rem -1rem; ">
            <div style="margin:0.2rem auto 0.2rem auto;">
                <b-row>
                    <div style="margin:0.1rem 1rem" class="text-primary h4 "><i>Sort By:</i></div>
                    <b-form-radio-group  class="mx-3 mb-n1 text-dark " size="sm"              
                        v-model="sortType">                
                        <b-form-radio value="best" v-if="!multipleAssignments">Best Match</b-form-radio>
                        <b-form-radio value="availability">Availability</b-form-radio>
                        <b-form-radio value="rank">Rank</b-form-radio>
                        <b-form-radio value="name">Name</b-form-radio>
                    </b-form-radio-group>
                </b-row>
            </div>
        </b-row>

        <b-row class="px-1">
            <b-card bg-variant="dark"                 
                style="width:7.5rem; margin:0.25rem 0.35rem;" 
                body-class="p-1" 
                v-for="member in sortedShiftAvailabilityInfo"
                @click="drop(member.sheriffId)" 
                :key="'sheriff-modal-'+member.sheriffId">                
                    <duty-roster-team-member-card editingBlockId :sheriffInfo="member" :weekView="weekView"/>
                    <sheriff-availability-bar :sheriffInfo="member" />
            </b-card>
        </b-row>
    </div>
</template>

<script lang="ts">
    import { Component, Vue, Prop } from 'vue-property-decorator';
    import { myTeamShiftInfoType, dutyBlockInfoType, selectedDutyCardInfoType} from '../../../types/DutyRoster';
    import DutyRosterTeamMemberCard from './DutyRosterTeamMemberCard.vue'
    import SheriffAvailabilityBar from './SheriffAvailabilityBar.vue'

    import * as _ from 'underscore';
    
    import { namespace } from "vuex-class";
    
    import "@store/modules/DutyRosterInformation";   
    const dutyState = namespace("DutyRosterInformation");


    @Component({
        components: {            
            DutyRosterTeamMemberCard,
            SheriffAvailabilityBar
        }        
    })  
    export default class SheriffModal extends Vue {
        
        @Prop({required: true})
        assignmentName!: string;

        @Prop({required: true})
        assignmentBlock!: number[];

        @Prop({required: true})
        dutyBlock!: dutyBlockInfoType;

        @dutyState.State
        public shiftAvailabilityInfo!: myTeamShiftInfoType[];

        @dutyState.State
        public selectedDuties!: selectedDutyCardInfoType[];

        weekView = false;
        maxRank = 1000;
        sortType= 'best';
        multipleAssignments = false
        dataready = false;

        mounted(){
            this.dataready = false;
            if(this.selectedDuties.length>0){
                this.multipleAssignments = true;
                this.sortType = 'availability'
            }else{
                this.multipleAssignments = false;
                this.sortType = 'best'
            }
            this.dataready = true;
        }

        public drop(sheriffId){
            this.$emit('drop','member-'+sheriffId, true )
        }

        get sortedShiftAvailabilityInfo() {
            const teamList = this.shiftAvailabilityInfo 
            if(this.sortType=='best'){
                return _.chain(teamList)
                    .sortBy(member =>{return (member['rankOrder']? member['rankOrder'] : this.maxRank + 1)})
                    .sortBy(member =>{return (member.availability.reduce((acc, arr) => acc - (arr>0?1:0), 0))})
                    .sortBy( member =>{
                        const intersection = this.unionArrays(member.availability, this.assignmentBlock);
                        return -this.sumOfArrayElements(intersection);
                    })                    
                    .value()
            }
            else if(this.sortType=='rank'){       
                return  _.chain(teamList)
                    .sortBy(member =>{return (member['lastName']? member['lastName'].toUpperCase() : '')})
                    .sortBy(member =>{return (member['rankOrder']? member['rankOrder'] : this.maxRank + 1)})
                    .value()
            }
            else if(this.sortType=='availability'){
                return  _.chain(teamList)
                    .sortBy(member =>{return (member['rankOrder']? member['rankOrder'] : this.maxRank + 1)})
                    .sortBy(member =>{return (member.availability.reduce((acc, arr) => acc - (arr>0?1:0), 0))})
                    .value()
            }
            else{       
                return _.sortBy(teamList, member =>{return (member['lastName']? member['lastName'].toUpperCase() : '')})
            }
        }

        public unionArrays(arrayA, arrayB){
            return arrayA.map((arr,index) =>{return arr*arrayB[index]});
        }

        public sumOfArrayElements(arrayA){
            return arrayA.reduce((acc, arr) => acc + (arr>0?1:0), 0)
        }

        public editDuty(){
            this.$emit('editDuty')
        }
    }
</script>

<style scoped lang="scss">

</style>