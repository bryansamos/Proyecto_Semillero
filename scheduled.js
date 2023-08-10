/**
 *@NApiVersion 2.1
 *@NScriptType ScheduledScript
 *@author Bryan Samos
 */
define(['N/search', 'N/email', 'N/runtime'], function (search, email, runtime) {

    function execute(context) {

        try {

            const transactionSearchObj = search.create({
                type: "transaction",
                filters:
                    [
                        ["type", "anyof", "Opprtnty"],
                        "AND",
                        ["mainline", "is", "T"],
                        "AND",
                        ["amount", "greaterthan", "0.00"]
                    ],
                columns:
                    [
                        search.createColumn({ name: "entity", label: "Nombre" }),
                        search.createColumn({ name: "amount", label: "Importe" })
                    ]
            });
            var searchResultCount = transactionSearchObj.runPaged().count;
            log.debug("transactionSearchObj result count", searchResultCount);
            const userId = runtime.getCurrentUser().id;
            log.debug('userId', userId)
            transactionSearchObj.run().each(function (rs) {
                const name = rs.getText('entity');
                const internalId = rs.getValue('entity');
                const amount = rs.getValue('amount');
                const body = `<h1>Estimado Sr(a). ${name}, gracias por su compra de $${amount} </h1>`
                email.send({
                    author: userId,
                    body: body,
                    recipients: internalId,
                    subject: 'Agradecimientos por la compra con id: ' + rs.id

                })
                return true;
            });
        } catch (e) {
            log.error('el error es: ' + e.message, e)
        }

    }

    return {
        execute: execute
    }
});
