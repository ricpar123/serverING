


const API_URL = "https://api.hunter.io/v2/email-verifier";

const apiKey = process.env.HUNTER_API_KEY; 




/* email ya viene normalizado desde enviarCorreo()*/

function normalizarEmail(email) {
   return String (email || "").trim().toLowerCase();
   
}

async function validarEmail(email) {
   
   
    const emailNormalizado = normalizarEmail(email);

    if(!emailNormalizado) {
        return {
            msg: "No existen correos para validar",
        };
    }

    // -----------------------
    // 1. Revisar si el correo ya fue validado y está en cache
    // -----------------------
   /* if(correosValidadosCache.has(emailNormalizado)) {
        return {
            valido: true,
            email : emailNormalizado,
            estado: "en_cache",
            motivo: "Correo previamente validado",
            sugerencia: null
        };
    }
*/
    // --------------------------------------
    // 2. Verificar API KEY
    // --------------------------------------


    
    if(!apiKey) {
        console.error("API_KEY HUNTER no está definida en las variables de entorno.");
        return {
            valido: false,
            email : emailNormalizado,
            estado: "error",
            motivo: "API_KEY HUNTER.IO no definida"
        };
    } 

            // --------------------------------------
            // 3. Construir URL con Hunter.io API
            // --------------------------------------
            
            const url = `${API_URL}` + `?email=${encodeURIComponent(emailNormalizado)}` +
                `&api_key=${encodeURIComponent(apiKey)}`;

               
               
       
            try {
                const respuesta = await fetch(url);
                console.log(
                    "Hunter status:",
                    respuesta.status,
                    respuesta.statusText
                );

                if(!respuesta.ok) {
                    const textoError = await respuesta.text();
                    console.error ("RESPUESTA ERROR HUNTER:", textoError);
                    return {
                        valido: false,
                        email : email,
                        estado: "error",
                        motivo: `Error en la respuesta de Humter.io API: ${respuesta.status} ${respuesta.statusText}`,
                        
                    };
                }

                const { data } = await respuesta.json();

               

                return data;
            
            } catch(err) {
                console.log("error en Hunter", err);
            }
            
            
        }
              
module.exports = {
    validarEmail
};
