/**
 *@NApiVersion 2.1
 *@NScriptType UserEventScript
 *@author Bryan Samos

 */
define(['N/ui/serverWidget','N/https', 'N/search', 'N/email', 'N/runtime'], 
    function(serverWidget, https, search, email, runtime) {

        const fields = {
            'customrecord_s4_categorie_platzi':{
                name: 'name',
                image: 'custrecord_s4_categorie_img',
                id: 'custrecord_s4_categorie_id'
            },
            'customrecord_s4_product':{
                title:'name',
                price: 'custrecord_s4_product_price',
                description: 'custrecord_s4_product_description',
                categoryId: 'custrecord_s4_categorie_product',
                images:'custrecord_s4_imag_product',
                id:'custrecord_s4_product_id'
            },
            'customrecord_s4_user_platzi':{
                name:'name',
                email:'custrecord_s4_user_email',
                password:'custrecord_s4_user_password',
                avatar:'custrecord_s4_user_avatar',
                id:'custrecord_s4_user_id'

            }


        }

        const mode = {
            create: 'create',
            edit: 'edit',
            view: 'view',
            delete: 'delete'
        }


    const RECORD_USER = 'customrecord_s4_user_platzi';
    const RECORD_CATEGORIE = 'customrecord_s4_categorie_platzi';
    const RECORD_PRODUCT = 'customrecord_s4_product';
    const HOST_USER = 'https://api.escuelajs.co/api/v1/users/';
    const HOST_CATEGORIE = 'https://api.escuelajs.co/api/v1/categories/';
    const HOST_PRODUCT = 'https://api.escuelajs.co/api/v1/products/';

    const categoryPlatzi = (internalId) => {
        const tyoe = 'customrecord_s4_categorie_platzi'
        const platziId = search.lookupFields({
            type: type,
            id: internalId,
            columns: fields[type].id
        })[fields[type].id]
        return parseInt(platziId)
    }

    const handlers = {}
    handlers.beforeLoad = (context) => {
        try {
        const {newRecord, form, type} = context;
        const recordType = newRecord.type;
        if (type == 'create'){
            const field = form.getField({ id: fields[recordType].id})

            switch (recordType){
                case RECORD_USER:{
                    field.updateDisplayType({
                        displayType : serverWidget.FieldDisplayType.NORMAL
                    });
                    break;
                }
                case RECORD_CATEGORIE:{
                    field.updateDisplayType({
                        displayType : serverWidget.FieldDisplayType.NORMAL
                    });
                    break;
                }
                case RECORD_PRODUCT:{
                    field.updateDisplayType({
                        displayType : serverWidget.FieldDisplayType.NORMAL
                    });
                    break;
                }
                   
            }
        }

    }catch(e){
        log.error('el error es: ' + e.message,e)
    }
}

handlers.beforeSubmit = (context) => {
try{
    const { newRecord, oldRecord, type } = context;
    const recordType = newRecord.type;
    let [response, body, obj]=['',{},fields[recordType]];
    switch (type){
        case mode.create: {
            switch (recordType){
                case RECORD_USER:{
                    for (let i in obj){
                        if (obj[i] == fields[recordType].id) {
                            continue
                        }
                        body[i] = newRecord.getValue(obj[i])
                    }
                    response = https.post({body: body, url: HOST_USER})
                    const idPlatzi = JSON.parse(response.body).id
                    newRecord.setValue(fields[recordType].id, idPlatzi)
                    break;
                }
                case RECORD_CATEGORIE:{
                    for (let i in obj){
                        if (obj[i] == fields[recordType].id) {
                            continue
                        }
                        body[i] = newRecord.getValue(obj[i])
                    }
                    response = https.post({body: body, url: HOST_CATEGORIE})
                    const idPlatzi = JSON.parse(response.body).id
                    newRecord.setValue(fields[recordType].id, idPlatzi)
                    break;
                }
                case RECORD_PRODUCT:{
                    log.audit ('obj', obj)
                    for (let i in obj){
                        if (obj[i] == fields[recordType].id) {
                            continue
                        }else if (obj[i] == fields[recordType].categoryId){
                            body[i] = categoryPlatzi(newRecord.getValue(obj[i]))
                        }else if (obj[i] == fields[recordType].images){
                            body[i] = newRecord.getValue(obj[i])
                        }else {
                            body[i] = newRecord.getValue(obj[i])
                        }
                        
                    }
                    log.audit('body', body.images)
                    log.audit('body', typeof body.images)
                    response = https.post({body: body, url: HOST_PRODUCT})
                    log.audit('response', response)
                    const idPlatzi = JSON.parse(response.body).id
                    log.audit('idPlatzi'. idPlatzi)
                    newRecord.setValue(fields[recordType].id, idPlatzi)
                    break;
                }
                    
            }
            break;
        }
    }
    }catch(e){
        log.error('el error es: '+e.message, e)
    }
    

    }


handlers.afterSubmit = (context) => {

    try {
        const {newRecord, type, oldRecord} = context;
        const internalId = newRecord.id;
        if (type == 'create'){
            const user = runtime.getCurrentUser()
            let body = `<h1>Estimado usuario: ${user.name}</h1>`
            body += '<h2>El registro se ha creado exitosamente con el ID: </h2>' + internalId
            email.send({
                author: user.id,
                body: body,
                recipients: user.id,
                subject: 'Creacion de nuevo registro'
            })
        }
    } catch(e){
        log.error('el error es: '+e.message, e)
    }
}


    
    return  handlers
        
}
);
