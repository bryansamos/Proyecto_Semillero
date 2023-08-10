/**
 *@NApiVersion 2.1
 *@NScriptType MapReduceScript
 *@author Bryan Samos
 */
define(['N/search', 'N/email', 'N/runtime'], function (search, email, runtime) {
    //obligatorio
    function getInputData() {
        const response = [];
        const transactionSearchObj = search.create({
            type: "transaction",
            filters:
                [
                    ["type", "anyof", "Opprtnty"],
                    "AND",
                    ["mainline", "is", "T"],
                    "AND",
                    ["amount", "greaterthan", "0.00"],
                    "AND",
                    ["customer.email", "isnotempty", ""]
                ],
            columns:
                [
                    search.createColumn({ name: "entity", label: "Nombre" }),
                    search.createColumn({ name: "amount", label: "Importe" })
                ]
        });
        var searchResultCount = transactionSearchObj.runPaged().count;
        log.debug("transactionSearchObj result count", searchResultCount);
        transactionSearchObj.run().each(function (rs) {
            const obj = {};
            obj.name = rs.getText('entity');
            obj.id = rs.getValue('entity');
            obj.amount =rs.getValue('amount');
            response.push(obj)
            return true;
        });

        return response

       
    }
    //opcional condicionante
    function map(context) {
        try{
            const userId = -5;
        const value = JSON.parse(context.value)
        const body = `<h1>Estimado Sr(a). ${value.name}, gracias por su compra de $${value.amount} </h1>`
        email.send({
            author: userId,
            body: body,
            recipients: value.id,
            subject: 'Agradecimientos por la compra con id: '

        })
    }catch(e){
        log.error('el error es: ' + e.message, e)
    }
    }


    return {
        getInputData: getInputData,
        map: map,

    }
});
