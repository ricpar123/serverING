const { response } = require("express");

const { request } = require("express");



const validarAuth = (req = request, res = response, next) => {

    const token = req.header('auth');

    if(!token){
        
        return res.send('<p><h1>Se debe autenticar para ingresar</h1></p>')
       
       
        
    }
    

   // console.log('token:', token);
    //console.log(__dirname+'../');

    next();

}



module.exports = {
    validarAuth
}