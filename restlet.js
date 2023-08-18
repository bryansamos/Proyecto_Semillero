/**
 *@NApiVersion 2.1
 *@NScriptType Restlet
 */
 define(['N/record', 'N/search'],

 function (record, search) {

     function _get(context) {
         let response = { code: 500, message: '', data: {} }
         try {
             const dataContac = searchContact(context.document)
             response.code = 200
             response.message = 'Success'
             response.data = dataContac.success ? dataContac : 'No existe el tercero'
         } catch (e) {
             response.message = e.message
             response.data = e
             log.error('error in get: ' + e.message, e)
         } finally {
             return JSON.stringify(response)
         }
     }

     function _post(context) {
         let response = { code: 500, message: '', internalId: 0 }
         try {
             response.internalId = recordCreated(context)
             response.code = 200
             response.message = 'Successsss'
         } catch (e) {
             response.message = e.message
             response.data = e
         } finally {
             return response
         }
     }

     function searchContact(nit) {
         let response;
         const contactSearchObj = search.create({
             type: "contact",
             filters:
                 [
                     ["externalidstring", "is", "1084789485"]
                 ],
             columns:
                 [
                     search.createColumn({
                         name: "firstname",
                         label: "Nombre"
                     }),
                     search.createColumn({ name: "lastname", label: "Apellido" }),
                     search.createColumn({ name: "email", label: "Correo electrónico" }),
                     search.createColumn({ name: "phone", label: "Teléfono" }),
                     search.createColumn({ name: "subsidiarynohierarchy", label: "Subsidiaria (sin jerarquía)" })
                 ]
         });

         const contact = contactSearchObj.run().getRange({
             start: 0,
             end: 1
         })
         if (contact.length > 0) {
             response = {
                 success: true,
                 internalId: contact[0].id,
                 firstName: contact[0].getValue('firstname'),
                 lastName: contact[0].getValue('lastname'),
                 email: contact[0].getValue('email'),
                 phone: contact[0].getValue('phone'),
                 subsidiary: contact[0].getValue('subsidiarynohierarchy')
             }
         } else {
             response = {
                 success: false
             }
         }
         return response
     }

     function recordCreated({ firstName, lastName, subsidiary, phone, email, document }) {

         const recordContac = record.create({
             type: 'contact'
         })
             .setValue('firstname', firstName)
             .setValue('externalid', document)
             .setValue('lastname', lastName)
             .setValue('email', email)
             .setValue('phone', phone)
             .setValue('subsidiary', subsidiary)
             .save()
         return recordContac

     }
     return {
         get: _get,
         post: _post
     }
 }
);