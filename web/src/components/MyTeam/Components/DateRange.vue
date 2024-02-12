<template>
  <b-row>
    <b-col>
        <label class="h4 mb-2 p-0 float-left">Start Date</label>
        <b-input-group class="mb-3">
            <b-form-input        
                v-model="dateRange.startDate"
                type="text"
                :formatter="formatterStart"
                placeholder="YYYY-MM-DD"
                autocomplete="off"
            />
            <b-input-group-append>
                <b-form-datepicker
                    v-model="dateRange.startDate"
                    button-only 
                    button-variant="primary" 
                    reset-button  
                    today-button offset="10"               
                    right
                    locale="en-US"            
                    @input="onContextStart"
                    />
            </b-input-group-append>
        </b-input-group>
    </b-col>
    <b-col class="ml-n3">
        <label class="h4 mb-2 p-0 float-left">End Date</label>
        <b-input-group class="mb-3">
            <b-form-input        
                v-model="dateRange.endDate"
                type="text"
                :formatter="formatterEnd"
                placeholder="YYYY-MM-DD"
                autocomplete="off"
            />
            <b-input-group-append>
                <b-form-datepicker
                    v-model="dateRange.endDate"
                    button-only
                    button-variant="primary"
                    reset-button
                    today-button
                    right
                    locale="en-US"            
                    @input="onContextEnd"
                    />
            </b-input-group-append>
        </b-input-group>
    </b-col>   
  </b-row>
</template>

<script lang="ts">
    import { Component, Vue, Prop } from 'vue-property-decorator';
    import moment from 'moment-timezone';
    import * as _ from 'underscore';  
    import Spinner from "@components/Spinner.vue";
    import { dateRangeInfoType } from '@/types/common';
    

    @Component
    export default class DateRange extends Vue {
        @Prop({required: true})
        dateRange!: dateRangeInfoType
        
        dateFormat = /^[0-9]{4}[-][0-9]{2}[-][0-9]{2}$/;

        public validateDates(){
            const isStartDate = (this.dateFormat.test(this.dateRange.startDate))
            const isEndDate = (this.dateFormat.test(this.dateRange.endDate))    
            this.dateRange.valid = isStartDate && isEndDate
            if(this.dateRange.valid) this.$emit('rangeChanged')
        }

        public onContextStart(ctx) {
            console.log(ctx)
            if(this.dateRange.endDate && ctx>this.dateRange.endDate)
                this.dateRange.startDate=""
            if(!this.dateRange.endDate) this.dateRange.endDate = this.dateRange.startDate
            this.validateDates() 
        }

        public onContextEnd(ctx) {
            console.log(ctx)
            if(this.dateRange.startDate && ctx<this.dateRange.startDate)
                this.dateRange.endDate=""
            this.validateDates() 
        }

        public formatterStart(value){
            return this.formatter(value, 'Start')
        }

        public formatterEnd(value){
            return this.formatter(value, 'End')
        }

        public formatter(value, type){
            
            const monthsDays = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
            this.validateDates() 

            const lastchar = value.slice(-1)
            const isNotNumber = isNaN(Number(lastchar))
            if(isNotNumber && lastchar !='-' ) return value.slice(0,-1)
            if(value.length>10) return value.slice(0,-1);
            //console.log('len = '+String(value.length))
            const startYear = Number(this.dateRange.startDate.slice(0,4)) 
            const endYear = Number(this.dateRange.endDate.slice(0,4))
            
            const isStartDate = (this.dateFormat.test(this.dateRange.startDate))
            const isEndDate = (this.dateFormat.test(this.dateRange.endDate))

            const year = Number(value.slice(0,4))
            const yearIsNotNumber = isNaN(year)
            
            const yearCondition = type=='Start'? (isEndDate && endYear>0 && year>endYear) : (isStartDate && startYear>0 && year<startYear)
            //console.log(year)
            if(value.length>=4 && (yearIsNotNumber || year<2000 || year>2100 ||  yearCondition)) return ''
            if(value.length==5) return value.slice(0,4)+'-'
            if(year%4==0) monthsDays[1]=29

            const startYearMonth = this.dateRange.startDate.slice(0,7)
            const endYearMonth = this.dateRange.endDate.slice(0,7)
            const yearMonth = value.slice(0,7)
            const yearMonthCondition = type=='Start'? (isEndDate && endYearMonth && yearMonth>endYearMonth) : (isStartDate && startYearMonth && yearMonth<startYearMonth)

            const month = Number(value.slice(5,7))
            const monthIsNotNumber = isNaN(month)
            //console.log(month)
            //console.log(yearMonthCondition)
            if(value.length>=7 && (monthIsNotNumber || month==0 || month>12 || yearMonthCondition)) return value.slice(0,4)+'-'
            if(value.length==8) return value.slice(0,7)+'-'

            const startDate = this.dateRange.startDate
            const endDate = this.dateRange.endDate
            const dateCondition = type=='Start'? (isEndDate && endDate && value>endDate) : (isStartDate && startDate && value<startDate)

            const day = Number(value.slice(8,10));
            const dayIsNotNumber = isNaN(day)
            //console.log(day)

            if(value.length>=10 && (dayIsNotNumber || day==0 || day>monthsDays[month-1] || dateCondition)) return value.slice(0,7)+'-'
              
            return value
        }
    }

</script>
