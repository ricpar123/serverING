
const { response, request } = require('express');



const Cliente = require('../modelos/cliente');
const Equipo = require('../modelos/equipos');


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
    
    const { nombre, email1, email2, email3, email4 } = req.body;
   
    
    try {
      
        const cliente = await Cliente.findOne({ nombre });
        if(cliente){
            return res.status(400).json({
                ok: false,
                msg: 'El cliente ya existe'
            });
        }
      
        const dbCliente  = new Cliente({nombre, email1, email2, email3, email4});
       

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
    
 const clientesPut = async (req, res) => {
    
   const {_id, nombre, email1, email2, email3, email4} = req.body;

   const dbCliente = await Cliente.findByIdAndUpdate(_id, {email1:email1, email2:email2, email3:email3, email4:email4}, {new: true});
  
    
    res.json({
        msg: 'put desde el controlador',
        
        dbCliente
    });
}

 const clientesDelete = (req, res) => {
   const {id, nombre} = req.body;
   console.log('id: ', id);
   console.log('nombre: ', nombre);

  Promise.all([
     Cliente.findByIdAndDelete(id),
     Equipo.deleteMany({cliente:nombre})
  ])
  .then(resultados => {
     const [cliente, equipos] = resultados;

     console.log('cliente', cliente);
     console.log('equipos', equipos);
  }).catch(err => {
     console.log('error algo salio mal', err);
  });

  res.json({
     msg:'Todo bien'
  });
    
}



    
 



module.exports = {
    clientesGet,
    
    clientesPost,
    clientesPut, 
    clientesDelete
    
   
    
}
