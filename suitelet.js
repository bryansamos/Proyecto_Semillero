/**
 *@NApiVersion 2.1
 *@NScriptType Suitelet
 *@author Bryan Samos
 */
 define(['N/ui/serverWidget', 'N/file', 'N/record'], function(serverWidget, file, record) {

    function onRequest(context) {  
        const {request, response} = context;
        const {method, parameters} = request;

        if (method === 'GET'){
            
            const htmlFile = file.load({ id: 1105})         //variable para cargar el archivo almacenado en ns
            let htmlContent = htmlFile.getContents();      //variable para obtener el contenido del archivo     
            response.write (htmlContent);                  //despliega el contenido

        }else{                                      //Inicia el POST
            const nombre = parameters.nombre;           //obtiene el valor de name, que se obtiene del html
            const telefono = parameters.telefono;         //obtiene el telefono
            const email = parameters.email;    
            
            const htmlFile = file.load({ id: 1104})         //variable para cargar el archivo almacenado en ns
            let htmlContent = htmlFile.getContents();      //variable para obtener el contenido del archivo     
        
            const leadId = record.create ({          //crea un nuevo registro en ns
                type: 'lead',                         //tipo de registro
                isDynamic: true,
                defaultValues: {                       //tipo de formulario, es el -2 porque es el id del formulario estandar
                    customForm: -2
                }
            });

            leadId.setValue({fieldId: 'companyname', value: nombre})          //obtiene los valores introducidos en el formulario y crea
            leadId.setValue({fieldId: 'email', value: email})               //el registro de acuerdo a los campos relacionados
            leadId.setValue({fieldId: 'phone', value: telefono})
            leadId.setValue({fieldId: 'subsidiary', value: 1})
            leadId.save()

            response.write(htmlContent);

        }


    }
    
    return {
        onRequest: onRequest
    }
});