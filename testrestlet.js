/**
 *@NApiVersion 2.1
 *@NScriptType Restlet
 *@author Bryan Samos
 */
define(["N/record"], function (record) {
  function _post(context) {
    const response = { code: 500, success: false, data: [], error: [] };
    try {
      
    

      let newSalesOrder = record.create({
        //Se crea un registro que en este ejercicio es una orden de venta
        type: "salesorder",
        isDynamic: true,
      });
      //Se establecen los los campos a llenar
      newSalesOrder.setValue({
        fieldId: "entity",          //entidad que es el nombre de la empresa
        value: context.entity
      });

      context.items.forEach((i) => {                //bucle para colocar las lineas del articulo de inventario
        newSalesOrder.selectNewLine({ sublistId: "item" });
        newSalesOrder.setCurrentSublistValue({
          sublistId: "item",
          fieldId: "item",
          value: i.itemId,    // ID del articulo, que en este caso es un numero
        }); 
        newSalesOrder.setCurrentSublistValue({
          sublistId: "item",
          fieldId: "quantity",
          value: i.quantity,  // numero de articulos a ingresar
        }); 
        newSalesOrder.commitLine({ sublistId: "item" });
      });

      const saveSalesOrder = newSalesOrder.save();

      const data = context.data;    //genera el id de la orden de venta
     response.data.push({
        
        id: saveSalesOrder,
        saved: data,
      }); 
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
