const { response, request } = require('express');
const  Usuario  = require('../modelos/usuario');



const usuariosRegistro = async (req, res = response) => {
    
    const { userid, clave, rol} = req.body;

    console.log(userid, clave, rol);
 
    
    try {
      
        const usuario = await Usuario.findOne({ userid });
        if(usuario){
            return res.status(400).json({
                ok: false,
                msg: 'El usuario ya existe'
            });
        }
      
        const dbUsuario  = new Usuario({userid, clave, rol});
       

        await dbUsuario.save();

        return res.status(201). json({
            ok: true,
            //uid: dbUsuario.id,
            dbUsuario
        });

    } catch (error) {
        console.log('error');
        return res.status(500).json({
            ok: false,
            msg: 'Por favor contacte con el administrador'
        });
    }
}

const usuariosListar = async (req, res = response) => {
    
    
   
 
    try {
      
        const usuarios = await Usuario.find({}, {userid:1} );
        
        return res.status(200). json({
            usuarios
        });

    } catch (error) {
        console.log('error');
        return res.status(500).json({
            ok: false,
            msg: 'Por favor contacte con el administrador'
        });
    }
}

const usuariosListarCompleto = async (req, res = response) => {
    
    
    try {
      
        const usuarios = await Usuario.find({} );

       

        return res.status(201). json({
            ok: true,
           
          usuarios
        });

    } catch (error) {
        console.log('error');
        return res.status(500).json({
            ok: false,
            msg: 'error en usuarios completo'
        });
    }
}

const usuariosLogin = async (req, res = response) => {
    
    const { userid, clave} = req.body;

    
   
 
    try {
      
        const usuario = await Usuario.findOne({ userid });
        if(!usuario){

            return res.status(400).json({
                ok: false,
                msg:'Usuario no existe'
            });
            
        }
        if((clave != usuario.clave && usuario.status != 'activo' )){
            return res.status(400).json({
                ok: false,
                msg:'Clave/status no son correctos'
            }); 
        }
      res.json({
          ok: true,
          msg:'login exitoso',
          usuario
      })
        

        

    } catch (error) {
        console.log('error');
        return res.status(500).json({
            ok: false,
            msg: 'Por favor contacte con el administrador'
        });
    }
}

const usuariosPut = async (req, res) => {
    
    

    const {_id, userid, clave, rol} = req.body;

    console.log('datos: ', req.body);
    console.log('datos 1', _id, userid, clave, rol);
    

    const dbEquipo = await Usuario.findByIdAndUpdate(_id, {userid, clave, rol }, {new: true});
    
   
    
    res.json({
        msg: 'put desde el controlador',
        dbEquipo
        
    });
}



const usuariosDelete = async(req, res) => {
    const { id } = req.params;
    console.log('id del usuario: ', id);
   

    try {
      
        const usuario = await Usuario.findByIdAndDelete( id );

       

        return res.status(201). json({
            ok: true,
          msg:'usuario eliminado' 
          
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
    usuariosRegistro,
    usuariosLogin,
    usuariosListar,
    usuariosDelete,
    usuariosListarCompleto,
    usuariosPut
}
