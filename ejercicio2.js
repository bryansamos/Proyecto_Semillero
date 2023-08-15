/**
 *@NApiVersion 2.1
 *@NScriptType ClientScript
 *@author Bryan Samos
 */
define([], function() {

    function saveRecord(context) {
        var currentRecord=context.currentRecord;
        var lineCount = currentRecord.getLineCount({
            sublistId: 'item'
        });
        var total = 0;

        for (var i=0; i < lineCount; i++) {
            var quantity = currentRecord.getSublistValue({
                sublistId: 'item',
                fieldId: 'quantity',
                line: i
            });
            total += quantity;
        }

        if (total > 25){
            alert("la suma de las lineas no puede rebasar a 25")
            return false;
        }
              
    } 
  function validateDelete(context) {

        var currentRecord = context.currentRecord;
        var lineItem = context.line;
        if (confirm('estas seguro que deseas eliminar esta linea')){
            currentRecord.getCurrentSublistValue({
                sublistId: 'item',
                fieldId: 'quantity',
                line: lineItem
            });
            return true;
        }
    } 
    return {
     saveRecord: saveRecord,
     validateDelete: validateDelete 
    }
});

