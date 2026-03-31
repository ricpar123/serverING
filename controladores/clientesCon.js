
const { response, request } = require('express');



const Cliente = require('../modelos/cliente');

const clientesGet = async(req, res=response) => {
    
   
    try {
        const listaClientes = await Cliente.find({});
        return res.status(201). json({
            ok: true,
            listaClientes
        });
    
      } catch (error) {
        console.log('error');
        return res.status(500).json({
            ok: false,
            msg: 'Por favor contacte con el administrador'
        });
    
      }
}



const clientesPost = async (req, res = response) => {
    
    const { nombre, email1, email2, email3, email4, status} = req.body;
   
    
    try {
      
        const cliente = await Cliente.findOne({ nombre });
        if(cliente){
            return res.status(400).json({
                ok: false,
                msg: 'El cliente ya existe'
            });
        }
      
        const dbCliente  = new Cliente({nombre, email1, email2, email3, email4, status});
       

        await dbCliente.save();

        return res.status(201). json({
            ok: true,
            uid: dbCliente.id,
            dbCliente
        });

    } catch (error) {
        console.log('error');
        return res.status(500).json({
            ok: false,
            msg: 'Por favor contacte con el administrador'
        });
    }

}

const clientesPutInactivar = async (req, res) => {
    
    

    const {id, status} = req.body;

    console.log('datos: ', req.body);
    
    

    const dbCliente = await Cliente.findByIdAndUpdate(id, {status }, {new: true});
    
   
    
    res.json({
        msg: 'put inactivar desde el controlador',
        dbCliente
        
    });
}

    
 const clientesPut = async (req, res) => {
    
   const {id} = req.params;
       console.log("id del cliente: ", id);
       
   
       const {nombre, email1, email2, email3, email4, status} = req.body;
   
       console.log('datos: ', req.body);
      
       
   
       const dbCliente = await Cliente.findByIdAndUpdate(id, {nombre, email1, email2, email3, email4, status }, {new: true});
       
      
       
       res.json({
           msg: 'put desde el controlador',
           dbCliente
           
       });
}

 const clientesDelete = async(req, res) => {
   const { id } = req.params;
   console.log('id usuario: ', id);
  

  
   try {
      
    const cliente = await Cliente.findByIdAndDelete( id );

   

    return res.status(201). json({
        ok: true,
      msg:'cliente eliminado' 
      
    });

} catch (error) {
    console.log('error en la eliminacion');
    return res.status(500).json({
        ok: false,
        msg: 'Error en la eliminacion'
    });
}


}



    
 



module.exports = {
    clientesGet,
    clientesPost,
    clientesPut,
    clientesPutInactivar, 
    clientesDelete
    
   
    
}
