<template>
    <div>
        <b-alert
            v-for="item,inx in training"
            :key="'status-card-'+item.status+'-'+inx"
            class="mx-2 my-3"
            :variant="item['_rowVariant']"
            :show="true">
            <b-row class="mx-0">
                <div style="width:70%;">
                    {{item.trainingType}}
                </div>
                <div style="width:5%;"/>
                <div style="width:25%;" >
                    <div class="float-right">
                        <b-badge :variant="item['_rowVariant']" style="fontStyle:italic; line-height:1rem; padding:0.5rem 1rem;" v-html="item.status" />
                        <div v-if="item['_rowVariant']=='notify'" class="text-center font-italic font-weight-bold">{{item.expiryDate | expiry-date}}</div>                   
                    </div>
                </div>
            </b-row>
        </b-alert>
    </div>
</template>


<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { trainingReportInfoType } from '@/types/MyTeam';

@Component
export default class TrainingStatusCard extends Vue {

    @Prop({required: true})
    training!: trainingReportInfoType[];

}

</script>