const dns = require("dns").promises;

async function verificarDominioEmail(email) {
    try {
        const dominio = email.split("@")[1];

        if(!dominio) {
            return{
                valido: false,
                motivo: "Dominio inexistente"
            };
        }

        //Primero intentamos registros mx

        try {
         const mx = await dns.resolveMx(dominio);
         
         if(mx && mx.length > 0) {
            return {
                valido: true,
                mx
            };
         }
        } catch (error) {
            //seguimos con fallback DNS
        }

        //Algunos dominios pueden recibir correo
        //mediante A/AAAA aunque no tengan mx explicito
        try {
          const direcciones = await dns.lookup(
            dominio, { all: true }
          );
          if(direcciones.length > 0 ) {
            return {
                valido: true,
                fallback: true
            };
          }
        } catch(error) {
            "dominio sin resolucion valida"
        }  
          return {
            valido: false,
            motivo: "El dominio no psee registros DNS validos"
          };

        } catch (error) {
            return {
                valido: false,
                motivo:"No fue posible verificar el dominio"
            }
        }
        
    
}

module.exports = {
    verificarDominioEmail
};