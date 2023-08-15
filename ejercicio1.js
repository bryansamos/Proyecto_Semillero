/**
 *@NApiVersion 2.1
 *@NScriptType ClientScript
 *@author Bryan Samos
 */
 define([], function() {

 function pageInit(context) { /*inciso a */
    var currentRecord = context.currentRecord;
    var mode = context.mode;
            if (mode == 'create'){
                    currentRecord.setValue({
                    fieldId: 'entity',
                    value: 336
                     })
    }

    }

function saveRecord(context) {
        var currentRecord = context.currentRecord;
        var mode = context.mode;
        var lineCount = currentRecord.getLineCount({
            sublistId: 'item'
        });
       
                if (lineCount < 3){
                    alert('transacciones deben ser mayores a 3 lineas')
            return false; }
                }
            
function fieldChanged(context){
        var currentRecord = context.currentRecord;
        var sublistValue = currentRecord.getCurrentSublistValue({
            sublistId: 'item',
            fieldId: 'quantity',
        
            });

            if (sublistValue > 5 ){
                alert('debes escoger menos de 5 unidades')
                return false;
            }
}

function lineInit(context){

    var currentRecord=context.currentRecord;
    var sublistId=context.sublistId;

        if(sublistId == 'item'){
            currentRecord.setCurrentSublistValue({
                sublistId: 'item',
                fieldId: 'quantity',
                value: 2
            })
        }


}
    
     return {
 pageInit:pageInit,
 saveRecord: saveRecord,
 fieldChanged: fieldChanged,
 lineInit: lineInit
}

});







