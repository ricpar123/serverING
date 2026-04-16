
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

const clienteGetporNombre = async(req, res=response) => {
    
    try {
        const nombre = req.params.nombre;
        console.log("Nombre:", nombre);
        if(!nombre) return res.json({msg:"Nombre no encontrado"});
        const cliente = await Cliente.findOne({nombre: nombre});
        if(!cliente) return res.status(404).json({msg: "Cliente no encontrado"});
        res.status(201). json({
            ok: true,
            cliente
        });
    
      } catch (error) {
        console.log('error:', error);
        return res.status(500).json({
            ok: false,
            msg: 'Por favor contacte con el administrador'
        });
    
      }
}




const clientesPost = async (req, res = response) => {
    
    const { nombre, emails, status} = req.body;
   
    
    try {
      
        const cliente = await Cliente.findOne({ nombre });
        if(cliente){
            return res.status(400).json({
                ok: false,
                msg: 'El cliente ya existe'
            });
        }
      
        const dbCliente  = new Cliente({nombre, emails, status});
       

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
       
   
       const {nombre, emails, status} = req.body;
   
       console.log('datos: ', req.body);
      
       
   
       const dbCliente = await Cliente.findByIdAndUpdate(id, {nombre, emails, status }, {new: true});
       
      
       
       res.json({
           msg: 'put desde el controlador',
           dbCliente
           
       });
}

 





    
 



module.exports = {
    clientesGet,
    clienteGetporNombre,
    clientesPost,
    clientesPut,
    clientesPutInactivar
}
