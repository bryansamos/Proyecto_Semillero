/**
 *@NApiVersion 2.1
 *@NScriptType Restlet
 *@author Bryan Samos
 */
 define(["N/record"], function (record) {
    function _post(context) {
      const response = { code: 500, success: false, data: [], error: []};
      try {
        let newSalesOrder = record.create({   //Se crea un registro que en este ejercicio es una orden de venta
          type: "salesorder",
          isDynamic: true,
        });
        //Se establecen los los campos a llenar
        newSalesOrder.setValue({
          fieldId: "entity",          //entidad que es el nombre de la empresa
          value: context.Entidad
        });
  
        context.items.forEach((i) => {                //bucle para colocar las lineas del articulo de inventario
          newSalesOrder.selectNewLine({ sublistId: "item" });
          newSalesOrder.setCurrentSublistValue({
            sublistId: "item",
            fieldId: "item",
            value: i.articulo,    // ID del articulo, que en este caso es un numero
          }); 
          newSalesOrder.setCurrentSublistValue({
            sublistId: "item",
            fieldId: "quantity",
            value: i.cantidad,  // numero de articulos a ingresar
          }); 
          newSalesOrder.commitLine({ sublistId: "item" });
        });
  
        const saveSalesOrder = newSalesOrder.save();        //ID generada que se encuentra en la variable


       const fulfillmentRecord = record.transform({         //Orden de venta se pasa a ser una orden completa
            fromType: record.Type.SALES_ORDER,
            fromId: saveSalesOrder,
            toType: record.Type.ITEM_FULFILLMENT,
            isDynamic: true
          })

          fulfillmentRecord.setValue({ fieldId: 'shipstatus', value: 'C' })
          const countLine = fulfillmentRecord.getLineCount({ sublistId: 'item' });
          for (let i = 0; i < countLine; i++) {
              fulfillmentRecord.setSublistValue({ sublistId: 'item', fieldId: 'location', line: i, value: locationId })
          }

          const fulfillmentId = fulfillmentRecord.save() 
  
        
          const invoiceRecord = record.transform({ // genera la factura
            fromType: record.Type.SALES_ORDER,
            fromId: saveSalesOrder,
            toType: record.Type.INVOICE,
            isDynamic: true
          })
          const invoiceId = invoiceRecord.save()
       
        
        const data = context.data;    //genera el id de la orden de venta
       response.data.push({
          
          id: saveSalesOrder,
          saved: data,
        });  
        response.message = "La orden de venta se ha creado, su ID es: " + saveSalesOrder
        response.code = 200; //la orden de venta se pudo crear
        response.success = true;
      } catch (e) {
        response.code = 500;  //error durante la creacion
        response.error.push(e.message);
        response.success = false;
      } finally {
        return JSON.stringify(response);
      }
    }
  
    return {
      post: _post,
    };
  });


  // https://workdrive.zohoexternal.com/file/sxd1a1359d28b80884160ba6238c7c2434f10 