/**
 *@NApiVersion 2.1
 *@NScriptType MapReduceScript
 *@author Bryan Samos
 */
define(['N/search', 'N/log', 'N/email', 'N/runtime'], function (search, log, email, runtime) { //definir modulos

    function getInputData() {                              //primera fase
        const response = [];
        var salesorderSearchObj = search.create({             //codigo de la busqueda guardada
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
        salesorderSearchObj.run().each(function (rs) {                     //objeto de la busqueda guardada
            const obj = {};
            obj.name = rs.getText('entity');
            obj.id = rs.getValue('entity');
            obj.amount = rs.getValue('amount');
            obj.date = rs.getValue('trandate');
            response.push(obj);
            return true;
        });
        return response
    }

    function map(context) {             //segunda fase
        try {
            const salesOrder = JSON.parse(context.value);       //se introducen las variables de los objetos en llaves
            context.write({
                key: salesOrder.date,
                value: salesOrder.amount
            });
            /* const body =`<h1>Estimado cliente ${value.name} el monto de su compra fue de: ${value.amount} con fecha ${value.date}</h1>`
              email.send({
                  author: userId,
                  body: body,
                  recipients: value.id,
                  subject: 'Total de compras durante el año'
              })  */
        } catch (e) {
            log.error('el error en map es: ' + e.message, e)
        }
    }

    function reduce(context) {              //tercera fase
        try {

            var sum = 0;            //funcion que hace la suma del precio de las ordenes de venta
            for (var i=0; i<context.values.length; i++){
            sum += parseFloat (context.values[i])
            };
           
            context.write({         //se introducen en otras llaves para la siguiente fase
                key: context.key,
                value: sum
            })


        } catch (e) {
            log.error('el error en reduce es: ' + e.message, e)
        }
    }

    function summarize(context) {                  //cuarta dase
                                                 //cambie summary por context, de esa forma lee el log audit
        try {
                    const summary=context.summary;
            const contents = `Total de ingresos en el año  : ${context.value}` // context.value aparece como undefined
            log.audit({ title: 'Resultado: ', details: contents })
            log.audit(' Time Elapsed', summary.inputSummary.seconds);  //aparece un error y dice que no puede leer inputSummary
            log.audit(' Time Elapsed', summary.mapSummary.seconds);
            log.audit(' Time Elapsed', summary.reduceSummary.seconds);
            log.audit(type + ' Total seconds elapsed', summary.seconds);

        } catch (e) {
            log.error('el error en summarize es: ' + e.message, e)
        }
    }

    return {
        getInputData: getInputData,
        map: map,
        reduce: reduce,
        summarize: summarize
    }
});
