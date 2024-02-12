<template>
    <div>
        <b-row class="m-0 mb-n1">
            <h3 class="mx-4 mb-0 font-weight-normal"> {{pageHeaderText}} </h3>
            <b-button 
                v-if="pageHeaderText=='Reports' && hasPermissionToAdjustTrainingExpiry"
                class="mb-0 mt-n2 ml-auto mr-4"
                @click="adjustTrainingExpiry()"
                variant="danger">
                    <spinner color="#FFF" v-if="searching" style="margin:0; padding:0 3.25rem; height:1.8rem; transform:translate(0px,-24px);"/>
                    <span style="font-size: 18px;" v-else>Adjust Training Expiry</span>
            </b-button>
        </b-row>
        <hr class="mx-3 bg-light" style="height: 5px;"/> 
    </div>
</template>


<script lang="ts">
  import { Component, Prop, Vue } from 'vue-property-decorator';
  import Spinner from "@components/Spinner.vue";
  import { namespace } from "vuex-class";
  import "@store/modules/CommonInformation";  
  import {userInfoType} from '@/types/common';  
  const commonState = namespace("CommonInformation");    

  @Component({
    components: {            
        Spinner
    }
  })
  export default class PageHeader extends Vue {

    @Prop({required: true})
    pageHeaderText!: string;

    @commonState.State
    public userDetails!: userInfoType;

    searching = false;
    hasPermissionToAdjustTrainingExpiry = false;

    mounted() {
        this.searching = false;
        this.hasPermissionToAdjustTrainingExpiry = this.userDetails.permissions.includes("AdjustTrainingExpiry");
    }

    public adjustTrainingExpiry(){            
        this.searching = true;
        this.$http.get("api/sheriff/training/adjust-expiry")
        .then(() => {            
            this.searching = false;                   
        },err => {
            console.log(err.response)
            this.searching = false;
        })
    } 
       

  }

  </script>