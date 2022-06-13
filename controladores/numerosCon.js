const { response, request } = require('express');
const  Numero  = require('../modelos/numero');



const numerosRegistro = async (req, res = response) => {
    
    const { numero } = req.body;

  
 
    
    try {
      
        const dbNumero = new Numero({ numero });

       
      
        await dbNumero.save();

        return res.status(201). json({
            ok: true,
            //uid: dbUsuario.id,
            dbNumero
        });

    } catch (error) {
        console.log('error');
        return res.status(500).json({
            ok: false,
            msg: 'Por favor contacte con el administrador'
        });
    }
}



const numerosActualizar = async (req, res = response) => {
    
    const id  = '6181b7ec919d2ecc2ai9f4f1';
    //console.log(id);
      
        const numeros = await Numero.find({}, '-_id' );
    //console.log(numeros[0].numero);

    
     var nuevoNum = numeros[0].numero + 1;
     //   console.log(nuevoNum);
       
    
        await Numero.findByIdAndUpdate(id, {$set:{numero: nuevoNum}}, {new:true});

       

        return nuevoNum;

    
    
}



module.exports = {
    numerosRegistro,
    numerosActualizar
    
}