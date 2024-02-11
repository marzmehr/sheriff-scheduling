<template>
    <div>        
        <b-row class="border-0">
            <b-col cols="4">
                <b-button 
                    class="float-left ml-1" 
                    variant="dark" 
                    @click="closeEmail">
                    <span style="font-size: 14px;">Cancel</span>
                </b-button>
            </b-col>
            <b-col cols="8">
                <b-button 
                    variant="warning"
                    :disabled="emailingPdf" 
                    @click="emailSchedulePdf()">
                    <b-overlay :show="emailingPdf" rounded="sm" :opacity="0.1" spinner-small spinner-variant="primary">                        
                        <span style="font-size: 14px;">
                            Email {{pdfType}}
                        </span>
                    </b-overlay>                   
                </b-button>
            </b-col>
        </b-row>
        
    </div> 
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import Spinner from "@components/Spinner.vue";

@Component({
    components:{
        Spinner
    }
})
export default class ButtonBar extends Vue {

    @Prop({required: true})
    pdfType!: string;

    @Prop({required: true})
    emailingPdf!: boolean

    public emailSchedulePdf(){
        this.$emit('emailSchedulePdf')
    }

    public closeEmail(){
        this.$emit('closeEmail')
    }

}
</script>