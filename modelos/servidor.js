require('dotenv').config();

const express = require('express');
const cors = require('cors');

const { dbConn } = require('../baseDatos/configDB');
const { json } = require('express');

class Server {

    constructor(){
        this.app = express();
        this.port = process.env.PORT;
        this.clientesPath = '/clientes';
        this.usuariosPath= '/usuarios';
        this.numerosPath = '/numeros',
        this.equiposPath = '/equipos',
        this.informesPath = '/informes'
        this.calibracionPath = '/calibraciones';
     
        
       
       

        //Conectar a Base de Datos
       this.conectarDB();

        //Middlewares
        this.middlewares();

        this.routes();
    }

    async conectarDB() {
        await dbConn();
    }


    middlewares(){
        //Directorio publico
        this.app.use( express.static('publico'));
        this.app.use(cors());
        this.app.use(express.json());//para parsear el body
    }

    routes(){
    
     this.app.use(this.clientesPath, require('../rutas/clienteRutas'));
     this.app.use(this.usuariosPath, require('../rutas/usuarioRutas'));
     this.app.use(this.numerosPath, require('../rutas/numeroRutas'));
     this.app.use(this.equiposPath, require('../rutas/equipoRutas'));
     this.app.use(this.informesPath, require('../rutas/informeRutas'));
     this.app.use(this.calibracionPath, require('../rutas/calibracionRutas'));
     

    }

    listen(){
        this.app.listen(this.port, () => {
            console.log('Śervidor corriendo en puerto:' , this.port);
        });
    }

    
}









module.exports = Server;
