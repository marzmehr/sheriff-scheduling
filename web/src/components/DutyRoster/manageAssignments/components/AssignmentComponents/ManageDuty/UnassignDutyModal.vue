<template>
    <div>
        <b-modal v-model="showModal.show" header-class="bg-warning text-light">
            <template v-slot:modal-title>
                    <h2 class="mb-0 text-light">Confirm Unassign Duty</h2>                    
            </template>
            
            <div v-if="dutySlot.dutyType" > 
                Are you sure you want to unassign the "
                <b>
                    {{dutySlot.startTime}}-{{dutySlot.endTime}} {{ dutySlot.dutyType }} {{dutySlot.dutySubType}}
                </b>
                " duty ?
            </div>
            
            <template v-slot:modal-footer>
                <b-button variant="danger" @click="unassignDutySlot()">Confirm</b-button>
                <b-button variant="primary" @click="showModal.show=false;">Cancel</b-button>
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
    import { Component, Vue, Prop } from 'vue-property-decorator';
    import { manageAssignmentDutyInfoType } from '@/types/DutyRoster';

    @Component({})  
    export default class UnassignDutyModal extends Vue {

        @Prop({required: true})
        showModal!: {show: boolean};

        @Prop({required: true})
        dutySlot!: manageAssignmentDutyInfoType;

        unassignDutySlot(){
            this.$emit('unassign')
            this.showModal.show=false;
        }
    }
</script>
