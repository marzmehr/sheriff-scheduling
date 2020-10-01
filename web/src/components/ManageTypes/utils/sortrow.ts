
import { DirectiveOptions } from  'vue';
import Sortable from 'sortablejs';

import store from "../../../store"; 
import { namespace } from "vuex-class"; 
const commonState = namespace("CommonInformation");


// const createSortable = (el, options, vnode) => {

//     return Sortable.create(el, {
        
//     });
//   };
  
//   const sortable = {
//     name: 'sortable',
//     bind(el, binding, vnode) {
//       createSortable(el.querySelector("tbody"), binding.value, vnode);
//     }
//   };
  
//   export default sortable;


const sortrow: DirectiveOptions = {

   
    bind(el,  binding, vnode) {
        

        
        const tableRows = el.querySelector('tbody');
        console.log(el)      
          
         Sortable.create(tableRows, {        
            animation: 50, 
            chosenClass: 'is-selected',
            sort: true,
            onStart: function(evt: any) { 
                console.log('start')
                console.log(evt.oldIndex)
                console.log(evt.newIndex)
                //draggable: 'td.text-center', handle: '.badge',
            //     //     
            //     //     // for(let i=1; i < tableRows.length; i++){
            //     //     //     tableRows[i].querySelectorAll('td')[evt.oldIndex].classList.add('sorting');
            //     //     // }
            },

            onChange: function(evt: any) {
                console.log('change')
                console.log(evt.oldIndex)
                console.log(evt.newIndex)
        //     //     
        //     //     // for(let i=1; i < tableRows.length; i++){
        //     //     //     const thisRow = tableRows[i];
        //     //     //     const oldPos = thisRow.querySelector('.sorting');
        //     //     //     let newPos = thisRow.querySelectorAll('td')[evt.newIndex];
        //     //     //     const cells = thisRow.querySelectorAll('td');
        //     //     //     let oldIndex = 0;
        //     //     //     for (let x = 0; x < cells.length; x++) {
        //     //     //         if (cells[x].classList.contains('sorting')) {
        //     //     //             oldIndex = x;
        //     //     //         }
        //     //     //     }
        //     //     //     if(oldIndex < evt.newIndex) {
        //     //     //         newPos = thisRow.querySelectorAll('td')[evt.newIndex + 1];
        //     //     //         if(oldPos) oldPos.classList.add('sort-right');
        //     //     //         thisRow.querySelectorAll('td')[evt.newIndex].classList.add('sort-left');
        //     //     //     } else {
        //     //     //         if(oldPos) oldPos.classList.add('sort-left');
        //     //     //         thisRow.querySelectorAll('td')[evt.newIndex].classList.add('sort-right');
        //     //     //     }
        //     //     //     setNewPos(oldPos, newPos, cells, evt.newIndex, thisRow);
        //     //     // }
            },

            onEnd: function(evt: any) {
                console.log('end')

                console.log(evt.oldIndex)
                console.log(evt.newIndex)
                console.log(binding.value.state.CommonInformation.location.name)
                //binding.value.state.CommonInformation.location.name = "kelown"
                console.log(store)
                store.commit('CommonInformation/setLocation',{name: '', id: ''});
        //     //     // for(let i=1; i < tableRows.length; i++){
        //     //     //     const tb = tableRows[i];
        //     //     //     const tbqu = tb.querySelector('td.sorting');
        //     //     //     if(tbqu) tbqu.classList.remove('sorting');
        //     //     // }
        //     //     // const sorted = tableRows[0].querySelectorAll('th');
            }
        })
    }
}

export default sortrow;