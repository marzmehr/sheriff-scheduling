<template>
    <div>
        <b-row  class="m-0 p-0" cols="2" >
            <b-col class="m-0 p-0" cols="12" >
                <b-table
                    :items="myTeamMembers" 
                    :fields="gaugeFields"
                    small
                    striped
                    head-row-variant="transparant"                    
                    sort-by="availability"
                    :sort-desc="true"
                    :style="{ overflowX: 'scroll', height: getHeight, maxHeight: '100%', marginBottom: '0px' }"                     
                    :sticky-header="getHeight"                        
                    borderless
                    fixed>
                        <template v-slot:table-colgroup> 
                            <col style="width:9rem">
                            <col>
                        </template>

                        <template v-slot:head(availability) >
                            <div class="gridfuel24">
                                <div v-for="i in 24" :key="i" :style="{gridColumnStart: i,gridColumnEnd:(i+1), gridRow:'1/1'}">{{getBeautifyTime(i-1)}}</div>
                            </div>
                        </template>

                        <template v-slot:cell(availability)="data" >
                            <sheriff-availability-card class="m-0 p-0" :sheriffInfo="data.item" :fullview="true" />
                        </template>

                        <template v-slot:head(name) > 
                            My Team                                                      
                            <b-button                                
                                @click="closeFullViewMyteam()"
                                v-b-tooltip.hover                            
                                title="Exit Fullview of MyTeam "                            
                                style="font-size:10px; width:1.1rem; margin:0 0 0 .2rem; padding:0; background-color:white; color:#725433;" 
                                size="sm">
                                    <b-icon-arrow-left-right /> 
                            </b-button>
                            
                        </template>

                         <template v-slot:cell(name)="data" >
                            <div
                                :id="'gauge--'+data.item.sheriff.sheriffId"                                                                                                 
                                style="height:2rem; font-size:14px; line-height: 1rem; text-transform: capitalize; margin:0; padding:0.5rem 0 0 0.25rem"
                                class="text-primary"
                                v-b-tooltip.hover.right                            
                                :title="data.item.fullName">
                                    {{data.value}}
                            </div>
                        </template>
                </b-table> 
            </b-col>            
        </b-row>

        <b-modal size="xl" v-model="printSheriffFullview" footer-class="d-none" header-class="bg-primary text-light" title-class="h2" title="Print Duties">            
            
            <duty-pdf-view :myTeamMembers="myTeamMembers"/>

            <template v-slot:modal-header-close>                 
                <b-button variant="outline-white" class="text-light closeButton" @click="closePrint()"
                >&times;</b-button>
            </template>
        </b-modal>
    </div>
</template>

<script lang="ts">
    import { Component, Vue, Watch } from 'vue-property-decorator';
    import SheriffAvailabilityCard from './SheriffAvailabilityCard.vue'
    import { myTeamShiftInfoType, dutiesDetailInfoType} from '@/types/DutyRoster';
    import { userInfoType } from '@/types/common';

    import DutyPdfView from "./pdf/DutyPdfView.vue"

    import { namespace } from "vuex-class";   
    import "@store/modules/CommonInformation";
    const commonState = namespace("CommonInformation");

    import "@store/modules/DutyRosterInformation";   
    const dutyState = namespace("DutyRosterInformation");

    @Component({
        components: {
            SheriffAvailabilityCard,
            DutyPdfView
        }
    })
    export default class SheriffDayView extends Vue {
       
        @dutyState.State
        public shiftAvailabilityInfo!: myTeamShiftInfoType[];

        @dutyState.State
        public sheriffFullview!: boolean;

        @dutyState.Action
        public UpdateSheriffFullview!: (newSheriffFullview) => void

        @dutyState.State
        public printSheriffFullview!: boolean;

        @dutyState.Action
        public UpdatePrintSheriffFullview!: (newPrintSheriffFullview: boolean) => void;
        
       
        @commonState.Action
        public UpdateDisplayFooter!: (newDisplayFooter: boolean) => void
       
        @commonState.State
        public userDetails!: userInfoType;
        
        hasPermissionToAddAssignDuty = false;

        myTeamMembers: any[] = []

        gaugeFields = [
            {key:'name', label:'My Team', stickyColumn: true, thClass:'text-center text-white', tdClass:'border-bottom py-0 my-0', thStyle:'margin:0; padding:0;background-color:#556077;'},
            {key:'availability', label:'', thClass:'', tdClass:'p-0 m-0 bg-white', thStyle:'margin:0; padding:0;'},
            
        ]

        @Watch('shiftAvailabilityInfo')
        shiftAvailability() 
        {
            this.extractSheriffAvailability()
        }

        mounted()
        {   //document.body.style.zoom = "80%";           
            this.hasPermissionToAddAssignDuty = this.userDetails.permissions.includes("CreateAndAssignDuties");
            this.extractSheriffAvailability() 
        }

        dutyColors = [
            {name:'court' , colorCode:'#189fd4'},
            {name:'jail' ,  colorCode:'#A22BB9'},
            {name:'escort', colorCode:'#ffb007'},
            {name:'other',  colorCode:'#7a4528'},
            {name:'overtime',colorCode:'#e85a0e'},
            {name:'free',   colorCode:'#e6d9e2'}            
        ]

        public extractSheriffAvailability(){
            this.myTeamMembers = [];
            for(const sheriff of this.shiftAvailabilityInfo){
                // console.log(sheriff.availability)
                //this.findIsland(sheriff.availability)
                this.myTeamMembers.push({                     
                    name: Vue.filter('truncate')(sheriff.lastName,10) + ', '+ sheriff.firstName.charAt(0).toUpperCase(),
                    fullName: sheriff.firstName + ' ' + sheriff.lastName,
                    availability: this.sumOfArrayElements(sheriff.availability),
                    sheriff: sheriff,
                    availabilityDetail: this.findAvailabilitySlots(sheriff.availability)
                })
            }
        }

        public findAvailabilitySlots(array){
            const availabilityDetail: dutiesDetailInfoType[] =[]
            const discontinuity = this.findDiscontinuity(array);
            const iterationNum = Math.floor((this.sumOfArrayElements(discontinuity) +1)/2);
            //console.log(iterationNum)
            for(let i=0; i< iterationNum; i++){
                const inx1 = discontinuity.indexOf(1)
                let inx2 = discontinuity.indexOf(2)
                discontinuity[inx1]=0
                if(inx2>=0) discontinuity[inx2]=0; else inx2=discontinuity.length 
                //console.error(inx1 + ' ' +inx2)
                availabilityDetail.push({
                        id: 10000+inx1 , 
                        startBin:inx1, 
                        endBin: inx2,
                        name: 'free' ,
                        colorCode: '#e6d9e2',
                        color: '#e6d9e2',
                        type: '',
                        code: ''
                    })
            }

            return availabilityDetail            
        }


        public findDiscontinuity(array){
            return array.map((arr,index)=>{
                if((index==0 && arr>0)||(arr>0 && array[index-1]==0)) return 1 ;
                else if(index>0 && arr==0 && array[index-1]>0) return 2 ;
                else return 0
            })
        }


        public getBeautifyTime(hour: number){
            return( hour>9? hour+':00': '0'+hour+':00')
        }

        public closeFullViewMyteam(){
            if(this.sheriffFullview){
                this.UpdateSheriffFullview(false)
                this.UpdateDisplayFooter(false)                
                const el = document.getElementsByClassName('b-table-sticky-header') 
                Vue.nextTick(()=>{            
                    if(el[1]) el[1].scrollLeft = el[0].scrollLeft
                })
            }
        }

        public sumOfArrayElements(arrayA){
            return arrayA.reduce((acc, arr) => acc + (arr>0?1:0), 0)
        }


        get getHeight() {
            const windowHeight = document.documentElement.clientHeight;
            return windowHeight - this.calculateTableHeight() + 'px'
        }

        public calculateTableHeight() {
            const topHeaderHeight = (document.getElementsByClassName("app-header")[0] as HTMLElement)?.offsetHeight || 0;
            const secondHeader =  document.getElementById("dutyRosterNav")?.offsetHeight || 0;
            const footerHeight = document.getElementById("footer")?.offsetHeight || 0;            
            const bottomHeight = footerHeight;
            return (topHeaderHeight + bottomHeight + secondHeader)
        }

        public closePrint(){
            this.UpdatePrintSheriffFullview(false);
        }

    }
</script>

<style scoped>   

    .card {
        border: white;
    }

    .gridfuel24 {        
        display:grid;
        grid-template-columns: repeat(24, 8.333%);
        grid-template-rows: 1.57rem;
        inline-size: 100%;
        font-size: 9px;         
    }

    .gridfuel24 > * {      
        padding: .25rem 0;
        border: 1px dotted rgb(185, 143, 143);
        background-color: #003366;
        color: white;
        font-size: 12px;
    }
</style>