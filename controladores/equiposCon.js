const { response, request } = require('express');
const  Equipo  = require('../modelos/equipos');


const equiposGet = async (req, res = response) =>{


    try {
      
        const equipos = await Equipo.find({});

       

        return res.status(201). json({
            ok: true,
           
          equipos
        });

    } catch (error) {
        console.log('error');
        return res.status(500).json({
            ok: false,
            msg: 'Por favor contacte con el administrador'
        });
    }
}

const equiposGetCliente = async(req, res = response) =>{
    
    
    
    const  {cliente}  = req.params;
    console.log(cliente);


    try {
      
        
        const equipos = await Equipo.find({cliente: cliente});

      

        return res.status(201). json({
            ok: true,
           
            equipos
        });

    } catch (error) {
        console.log('error');
        return res.status(500).json({
            ok: false,
            msg: 'Error en equipos find cliente'
        });
    }

}


const equiposPost = async (req, res = response) => {
    
    const { cliente, descripcion, marca, modelo, serie} = req.body;

  
    //console.log('Recibido :', cliente, descripcion, marca, modelo, serie);
 
    
    try {
      
        const equipo = await Equipo.findOne({ serie });
        if(equipo){
            return res.status(400).json({
                ok: false,
                msg: 'El equipo ya existe'
            });
        }
      
        const dbEquipo  = new Equipo({cliente, descripcion, marca, modelo, serie});
       

        await dbEquipo.save();

        return res.status(201). json({
            ok: true,
            //uid: dbUsuario.id,
            dbEquipo
        });

    } catch (error) {
        console.log('error');
        return res.status(500).json({
            ok: false,
            msg: 'Por favor contacte con el administrador'
        });
    }
}
const equiposPut = async (req, res) => {
    
    

    const {idr, cliente} = req.body;
    

    const dbEquipo = await Equipo.findByIdAndUpdate(idr, {cliente:cliente}, {new: true});
    
   
    
    res.json({
        msg: 'put desde el controlador',
        dbEquipo
        
    });
}

const equiposDelete = async(req, res) => {
    const { id } = req.params;
    console.log('id del equipo: ', id);
   

    try {
      
        const equipos = await Equipo.findByIdAndDelete( id );

       

        return res.status(201). json({
            ok: true,
          msg:'equipo eliminado' 
          
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
    equiposGet, equiposGetCliente,
    equiposPost, equiposPut,
    equiposDelete
}

