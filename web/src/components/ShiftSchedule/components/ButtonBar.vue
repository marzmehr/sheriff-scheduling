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
                    @click="emailSchedulePdf()">
                    <spinner color="#FFF" 
                        v-if="emailingPdf" 
                        style="margin:0; padding: 0; height:1.9rem; transform:translate(0px,-25px);"/>
                    <span style="font-size: 14px;" v-else>
                        Email {{pdfType}}
                    </span>
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