/**
 *@NApiVersion 2.1
 *@NScriptType UserEventScript
 *@author Bryan Samos
 */

define(['N/record', 'N/log', 'N/search', 'N/email', 'N/runtime'], function(record, log, search, email, runtime) {
    const mode = {
        create: 'create', //variables declaradas para modo crear o editar
        edit: 'edit',
        
    }

    function beforeSubmit(context) {                       //Función beforeSubmit porque se requiere que se haga un descuento antes de que el pedido se mande al servidor
      let customerId = context.newRecord.getValue({ // Obtener el ID del cliente desde la orden de venta
        fieldId: 'entity'
      });
      let customer = record.load({   // Cargar registro del cliente
        type: record.Type.CUSTOMER,
        id: customerId
      });
      let isRecurringCustomer = customer.getValue({   // Obtiene el valor del campo de verificación de Cliente recurrente, es decir, si está marcado o no
        fieldId: 'custentity_cliente_recurrente'
      });

      var salesorderSearchObj = search.create({               // A partir de esta línea, el código es generado por una búsqueda guardada, el script fue exportado usando un plugin de google chrome
        type: "salesorder",                                   // Originalmente aparecían más campos en la búsqueda pero las eliminé manualmente desde NS, así que el código es un poco más pequeño
        filters:
        [
           ["type","anyof","SalesOrd"],               //Filtro que va a buscar Ordenes de venta
           "AND", 
           ["name","anyof","336"],                     //Filtro del cliente, el numero 336 corresponde al ID de un cliente que se creó en un ejercicio previo
           "AND", 
           ["trandate","within","previousonehalf"]
        ],
        columns:
        [
           search.createColumn({
              name: "ordertype",
              sort: search.Sort.ASC,
              label: "Tipo de orden"
           }),
           search.createColumn({name: "mainline", label: "*"}),
           search.createColumn({name: "trandate", label: "Fecha"}),
           search.createColumn({name: "asofdate", label: "Fecha de corte"}),
           search.createColumn({name: "postingperiod", label: "Período"}),
           search.createColumn({name: "taxperiod", label: "Período fiscal"}),
           search.createColumn({name: "type", label: "Tipo"}),
           search.createColumn({name: "tranid", label: "Número de documento"}),
           search.createColumn({name: "entity", label: "Nombre"}),
           search.createColumn({name: "account", label: "Cuenta"}),
           search.createColumn({name: "memo", label: "Nota"}),
           search.createColumn({name: "amount", label: "Importe"}),
           search.createColumn({name: "custbody_acctg_approval", label: "Aprobación contable"})
        ]
     });
     let searchResultCount = salesorderSearchObj.runPaged().count;
     log.debug("salesorderSearchObj result count",searchResultCount);
     salesorderSearchObj.run().each(function(result){
        // .run().each has a limit of 4,000 results
        return true;
     });
     
     /*
     salesorderSearchObj.id="customsearch1691127905676";
     salesorderSearchObj.title="Búsqueda de Transacción2 (copy)";
     var newSearchId = salesorderSearchObj.save();
     */                                                                                                  //Fin del código generado por la busqueda guardada

     const rec=context.newRecord;                         // Se crea una variable para que se pueda setear el porcentaje de descuento
      
      if (isRecurringCustomer) {                        // Declaracion en donde si el cliente es recurrente se hace el descuento, de lo contrario no hace nada
        
        if (searchResultCount >=1 && searchResultCount<=5){  //Si el cliente es recurrente y tiene entre 1 a 5 compras en los ultimos 6 meses, se hace un descuento del 10% total del pedido
            rec.setValue({
                fieldId: 'discountitem',
                value: '10'
            })
        }else if (searchResultCount >= 6 && searchResultCount<=10){ //Si el cliente es recurrente y tiene entre 6 a 10 compras en los ultimos 6 meses, se hace un descuento del 15% total del pedido
            rec.setValue({
                fieldId: 'discountitem',
                value: '15'
            })
        }else if (searchResultCount>10){                //Si el cliente es recurrente y tiene mas de 10 compras en los ultimos 6 meses, se hace un descuento del 20% total del pedido
            rec.setValue({
                fieldId: 'discountitem',
                value: '20'
            })
        }
                                                          //en esta parte del codigo tengo problema ya que NS sí lee las condiciones e intenta aplicarlas
                                                          //me aparece un mensaje en el que el valor del campo discountitem es invalido y muestra la cantidad, por ejemplo: 20
                                                          //sin embargo, en SuiteAnswers veo que utilizan de esa forma la sintaxis  https://suiteanswers.custhelp.com/app/answers/detail/a_id/89674/loc/en_US

        
      } else {}  //Si el cliente no es recurrente, entonces no se hace descuento

      
    }

    function afterSubmit(context){  // Email de confirmacion de transaccion

        const obj = context.newRecord;
        const discount = obj.getText("discountitem"); //Menciona el porcentaje de descuento aplicado
        const total = obj.getValue("total"); //Muestra el total ya con el descuento
        const newRecord=context.newRecord;
        const type=context.type;
        const oldRecord=context.oldRecord;
       
        if (type == 'create'){
            const user = runtime.getCurrentUser()
            let body = `<h1>Estimado usuario: ${user.name}</h1>`
            body += `<h2>Su compra fue realizada con un descuento de ${discount} , siendo el total de: ${total} </h2>` // se usan comillas francesas porque no reconoce discount con doble coma
            email.send({
                author: user.id,
                body: body,
                recipients: user.id,
                subject: 'Transaccion completada'
            })
        }
        

    }


    return {
      beforeSubmit: beforeSubmit,
      afterSubmit: afterSubmit
    };
  });
