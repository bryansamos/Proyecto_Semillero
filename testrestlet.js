/**
 *@NApiVersion 2.1
 *@NScriptType Restlet
 *@author Bryan Samos
 */
define(["N/record"], function (record) {
  function _post(context) {
    const response = { code: 400, success: false, data: [], error: [] };
    try {
      log.debug("intizializing creating a contact", context); //Un mensaje de consola para comprobar si entra la función al enviar el POST en Postman
      const data = context.data;

      let newSalesOrder = record.create({
        //Utilizamos el módulo record con su método .create, que nos permitirá crear un registro
        type: "salesorder",
        isDynamic: true,
      });
      //A continuación rellenamos los campos del registro con los valores que escribirimos en al body del Postman
      newSalesOrder.setValue({
        fieldId: "entity",
        value: context.entity
      });

      context.items.forEach((i) => {
        newSalesOrder.selectNewLine({ sublistId: "item" });
        newSalesOrder.setCurrentSublistValue({
          sublistId: "item",
          fieldId: "item",
          value: i.itemId,
        }); // value: i.itemId
        newSalesOrder.setCurrentSublistValue({
          sublistId: "item",
          fieldId: "quantity",
          value: i.quantity,
        }); // value: i.quantity
        newSalesOrder.commitLine({ sublistId: "item" });
      });

      const saveSalesOrder = newSalesOrder.save();

      response.data.push({
        //Con el método push mandamos lo que quedó guardado en la variable saveContact
        id: saveSalesOrder,
        saved: data,
      });
      response.code = 201; //Este código significa Created
      response.success = true;
    } catch (e) {
      response.code = 500;
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
