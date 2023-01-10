import Vue from 'vue'
import moment from 'moment-timezone';


Vue.filter('beautify-date', function(date){
    enum MonthList {'Jan' = 1, 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'}
    if(date)
        return date.substr(8,2) + ' ' + MonthList[Number(date.substr(5,2))] + ' ' + date.substr(0,4);
    else
        return ''
})

Vue.filter('beautify-full-date', function(date){
    
    if(date)
        return moment(date).format('MMMM DD, YYYY');
    else
        return ''
})

Vue.filter('beautify-date-weekday', function(date){
    if(date)
        return	moment(date).format('ddd DD MMM YYYY');
    else
        return ''
})

Vue.filter('beautify-date-time-weekday', function(date){
    if(date)
        return	moment(date).format('dddd MMM DD, YYYY HH:mm');
    else
        return ''
})

Vue.filter('beautify-date-time', function(date){
    enum MonthList {'Jan' = 1, 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'}
    if(date)
        return date.substr(8,2) + ' ' + MonthList[Number(date.substr(5,2))] + ' ' + date.substr(0,4)+ ' ' + date.substr(11,5);
    else
        return ''
})

Vue.filter('beautify-time', function(date){
    
    if(date)
        return date.substr(11,5);
    else
        return ''
})

Vue.filter('capitalize', function(str: string){
    
    if(str)
        return str.charAt(0).toUpperCase() + (str.slice(1)).toLowerCase();
    else
        return ''
    
})

Vue.filter('capitalizefirst', function(str: string){
    
    if(str)
        return str.charAt(0).toUpperCase() + (str.slice(1));
    else
        return ''
    
})

Vue.filter('truncate', function (text: string, stop: number) {
    if(text)
        return (stop+3 < text.length) ? text.slice(0, stop)+'...' : text
    else
        return ''
})

Vue.filter('truncateleft', function (text: string, stop: number) {
    return (stop+3 < text.length) ? '...'+text.slice(0, stop) : text
})

Vue.filter('convertDate', function(date: string, time: string, type: string, timezone: string){
    const tail="00:00:00.000";
    let result = "";
    if(!time && type=='StartTime') result = date+'T'+tail;
    else if(!time && type=='EndTime') result = date+"T23:59:00.000";
    else if(time.length==1) result = date+'T0'+time+ tail.slice(2);
    else  result = date+'T'+time+ tail.slice(time.length);
    return moment.tz(result, timezone).utc().format();
})

Vue.filter('isDateFullday', function(startDate: string, endDate: string){
    const tail="1900-01-01T00:00:00";
    const start = moment(startDate+ tail.slice(startDate.length)); 
    const end = moment(endDate+ tail.slice(endDate.length));
    const duration = moment.duration(end.diff(start));
    if(duration.asMinutes() < 1439 && duration.asMinutes()> -1439 ){
        return false; 
    }else{
        return true;
    }	 	
})


Vue.filter('printPdf', function(html, pageFooterLeft, pageFooterRight){

    const body = 
        `<!DOCTYPE html>
        <html lang="en">
        <head>		
        <meta charset="UTF-8">
        <title>Sheriff Scheduling</title>`+
        `<style>`+
            `@page {
                size: 11in 8.5in !important;
                margin: 0.2in 0.2in 0.2in 0.2in !important;
                font-size: 10pt !important;			
                @bottom-left {
                    content:`+ pageFooterLeft +
                    `white-space: pre;
                    font-size: 7pt;
                    color: #606060;
                }
                @bottom-right {
                    content:`+pageFooterRight+` "  Page " counter(page) " of " counter(pages);
                    font-size: 7pt;
                    color: #606060;
                }
            }`+
            `@media print{
                div.ss-header {
					position: fixed;
					top: 0in;
                    bottom: 1.5in;
					width:100%; 
					display:inline-block;
				}
                div.ss-body {
                    margin-top: 6rem;
                }                
                .new-page{
                    page-break-before: always;
                    position: relative; top: 8em;
                }
            }`+ 
            `@page label{font-size: 9pt;}            
            `+
            `.card {border: white;}`+
            `.table{border: 3px solid;width: 100%;}`+
            `tr {border: 3px solid;}`+
            `th {border: 3px solid black;}`+
            `td {height: 2.5rem;border: 3px solid; width: 6.5rem;}`+
            `td.my-team {height: 2.5rem;border: 3px solid; width: 11rem !important;}`+
            `td.my-notes {height: 2.5rem;border: 3px solid; width: 17rem !important;}`+
            `.bg-spl-leave {background-color: #ffee07;}`+
            `.bg-a-l-leave {background-color: #007bff;}`+
            `.bg-med-dental-leave {background-color: #fd7e14;}`+
            `.bg-stiip-leave {background-color: #dc3545;}`+
            `.bg-cto-leave {background-color: #33b652;}`+
            `.bg-lwop-leave {background-color: #6e42c1dc;}`+
            `.bg-bereavement-leave {background-color: #6c757d;}`+
            `.bg-training-leave {background-color: #b46d47;}`+
            `.bg-overtime-leave {background-color: #ced4da;}`+
            `.bg-primary {background-color: #1b4f86;}`+
            `.dot {height: 20px; width: 20px; background-color: black;
                color: white;
                padding: 0.25rem 0.3rem 0.75rem 0.35rem;
                font-size: 0.75rem;
                border-radius: 50%;
                display: inline-block;
            }` +                        
            `
            body{				
                font-family: BCSans;
            }
            `+
        `</style>
        </head>
        <body>            
            <div class="container">
                    `+html+
        `</div></body></html>`	 
    // console.log(body)
    return body
})