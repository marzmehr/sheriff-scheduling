<template>
    <div>
        <h2 v-if="expireStatusError" class="mx-1 mt-0"><b-badge  variant="danger"> Unsuccessful  <b-icon class="ml-3" icon = x-square-fill @click="expireStatusError = false" /></b-badge></h2>
                                       
        <b-form-checkbox v-model="expireChecked" @change="showExpireWarning=true" :disabled="disabled" switch>
           {{expiryStatus}}
        </b-form-checkbox>


        <b-modal v-model="showExpireWarning" id="bv-modal-expire-sheriff-warning" header-class="bg-danger text-light">            
            <template v-slot:modal-title>                
                <h2 class="mb-0 text-light"> {{expiryTitle}} Profile </h2>             
            </template>
            <p>Are you sure you want to {{expiryTitle}} profile?</p>
            <template v-slot:modal-footer>
                <b-button variant="secondary" @click="cancelExpiryStatus"                   
                >No</b-button>
                <b-button variant="success" @click="changeProfileExpiryStatus()"
                >Yes</b-button>
            </template>            
            <template v-slot:modal-header-close>                 
                 <b-button variant="outline-warning" class="text-light closeButton" @click="cancelExpiryStatus"
                 >&times;</b-button>
            </template>
        </b-modal>
    </div>
</template>


<script lang="ts">
    import { Component, Vue, Prop } from 'vue-property-decorator';
    import { namespace } from 'vuex-class';
    import "@store/modules/CommonInformation";
    const commonState = namespace("CommonInformation");
    

    @Component
    export default class ExpireSheriffProfile extends Vue {

        @Prop({required: true})
        userID!: string;

        @Prop({required: true})
        userIsEnable!: boolean;

        @Prop({required: true})
        disabled!: boolean;

        showExpireWarning=false;
        expireChecked = false;
        expireStatusError = false;

        mounted()
        {
            this.expireChecked = !this.userIsEnable
            this.expireStatusError = false;
        }

        get expiryStatus(){
            if(this.expireChecked) return 'Activate Profile';else return 'Expire Profile'
        }

        get expiryTitle(){
            if(this.expireChecked) return 'Expire a Sheriff';else return 'Activate a Sheriff'
        }

        public changeProfileExpiryStatus(){
            Vue.nextTick().then(()=>{

                this.expireStatusError = false;
                const url ='api/sheriff/'+this.userID+ (this.expireChecked? '/disable' : '/enable');                
                this.showExpireWarning = false;
                this.$http.put(url)
                    .then(response => {
                        console.log(response)
                        this.$emit('change')
                                                                    
                    }, err=>{this.expireStatusError = true; this.expireChecked = !this.expireChecked;});
            });
        }

        public cancelExpiryStatus(){
            this.showExpireWarning = false;
            this.expireChecked = !this.expireChecked;
        }
    }
</script>