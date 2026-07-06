require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require("path");



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
        //this.app.use(express.json());//para parsear el body
        this.app.use(express.json({ limit: "50mb"}));
        this.app.use(express.urlencoded({limit: "50mb", extended: true}));
        this.app.set("view engine", "ejs");
        this.app.set("views", path.join(process.cwd(), "views"));
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
