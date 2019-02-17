const networks = require('os').networkInterfaces();
const express = require('express');
const path = require('path');
const app = express();

const port = 3000;
const host = [];

// configuracion de red del usuario

const network = () =>{
    for(var i = 0 in networks){
        for(var itwo in networks[i]){
            const address = networks[i][itwo];
            if(address.family === 'IPv4' && !address.internal){
                return address.address;
            }else if (address.family === 'IPv4'){
                return address.address;
            }
        }
    }
}

host.push(network());

// configuracion de los datos del servidor

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function(req, res){
    res.sendFile(path.join(__dirname, 'index.html'));
});

const io = require('socket.io')(app.listen(port, host, ()=>{
    if(host.toString() === '127.0.0.1'){
        console.log(`Loacal:   http://${host}:${port}`);
    }else{
        console.log(`En tu red:   http://${host}:${port}`);
    }
}));

// configuracion de emicion de datos del servidor

var clients = []

io.on('connection', function(socket){

    socket.on('newClient', function(name){
        clients.push(name);
        
        io.emit('createClient', clients);
    });
    
    socket.on('clientExit', function(name){
        for(i = 0; i < clients.length; i++){
            if(clients[i] === name){
                clients.splice(clients.indexOf(name), 1);
            }
        }

        io.emit('createClient', clients);
    });

    socket.on('inicializar', function(jugadores){

        io.emit('playGame', jugadores)
    })

    
    socket.on('sendMoved', function(moved, eval){
        io.emit('printMoved', moved, eval)
    })
    
    socket.on('playerExit', function(){
        io.emit('clearSala');
    })

    socket.on('terminarJuego', function(){
        io.emit('clearSala');
    })

    socket.on('disconnect', function(){ 
        
    });
});