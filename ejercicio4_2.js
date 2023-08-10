/**
 *@NApiVersion 2.1
 *@NScriptType ScheduledScript
 *@author Bryan Samos
 */
define(['N/search', 'N/log', 'N/email', 'N/runtime'], function(search, log, email, runtime) {

    function execute(context) {

        try {

        var salesorderSearchObj = search.create({         
            type: "salesorder",
            filters:
                [
                    ["type", "anyof", "SalesOrd"],
                    "AND",
                    ["mainline", "is", "T"],
                    "AND",
                    ["amount", "greaterthan", "0.00"],
                    "AND",
                    ["customer.email", "isnotempty", ""],
                    "AND",
                    ["trandate", "within", "previousoneyear"]  
                ],
            columns:
                [
                    search.createColumn({ name: "entity", label: "Nombre" }),
                    search.createColumn({ name: "amount", label: "Importe" }),
                    search.createColumn({ name: "trandate", label: "Fecha" })
                ]
        });
        var searchResultCount = salesorderSearchObj.runPaged().count;
        log.debug("salesorderSearchObj result count", searchResultCount);
        salesorderSearchObj.run().each(function (rs) {                     
            
            const name = rs.getText('entity');
            const id = rs.getValue('entity');
            const amount = rs.getValue('amount');
            const date = rs.getValue('trandate');

            var sum = 0;            //funcion que hace la suma del precio de las ordenes de venta
            for (var i=0; i<amount.length; i++){
            sum += parseFloat (amount[i])
            };

            const body =`<h1>Estimado cliente ${name} el monto de su compra fue de: ${sum} </h1>`
              email.send({
                  author: userId,
                  body: body,
                  recipients: value.id,
                  subject: 'Total de compras durante el año'
              })

            
            return true;
        });
    }catch (e) {
        log.error('el error es: ' + e.message, e)
    }
    }

    return {
        execute: execute
    }
});
