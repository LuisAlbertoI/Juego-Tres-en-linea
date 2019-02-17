const socket = io();
// variables globales
var name, playing = false, players = [];

// elementos vasicos del dom
const $form = document.getElementById('form');
const $name = document.getElementById('name');
const $game = document.getElementById('game');
const $clients = document.getElementById('clients');
const $players = document.getElementById('players');
const $gameEnd = document.getElementById('gameEnd');
const $navLeft = document.getElementsByClassName('nav-left')[0];
const $btnMovil = document.getElementsByClassName('btn-movil')[0];

// confiuracion del nombre de usuario
$form.addEventListener('submit', (event) =>{
    event.preventDefault();
    name = $name.value;
    
    if(name.length > 0 && name.length < 15){

        socket.emit('newClient', name);
        $name.setAttribute("disabled", "");
        event.srcElement[1].setAttribute("disabled", "");
    
    }else{
        alert('Datos ingrezados invalidos');
    }
})

// templates dinamicos
function createClients(name){
    return(`
        <li onclick="challenge(event)">${name}</li>
    `)
}

function createPlayers (data){
    return(`
        <div class="players">
            <li>${data[0]}</li>
            <li>VS</li>
            <li>${data[1]}</li>
        </div>
    `)
}

// respusta del servidor de los nuevos clients
socket.on('createClient', function(clients){
    $clients.children[0].remove();
    $clients.innerHTML = '<div></div>';
    for(var i = 0 in clients){
        $clients.children[0].innerHTML += createClients(clients[i]);
    }
});

// configurando la salida de un usuario 
window.addEventListener('beforeunload', function(){
    if(name){
        for(i = 0; i < players.length; i++){
            if(name === players[i]){
                
                socket.emit('playerExit');
            }
        }
        socket.emit('clientExit', name);
        name = '';
    }
});

// configurando los jugadores 
function challenge (event){
    const clitChallange = event.srcElement.textContent;
    if(playing === false){
        if(name){
            if(clitChallange === name){
                alert('deves de retar a un oponente valido')
            }else{
                players.push(name);
                players.push(clitChallange);
                socket.emit('inicializar', players,);
                $navLeft.classList.remove('active');
                $btnMovil.classList.remove('active');
            }
        }else{
            alert('deves de ingrezar un nombre para participar');
        }
    }else{
        var jugando = false;
        for(i = 0; i < players.length; i++){
            if(name === players[i]){
                jugando = true;
            }
        }
        if(jugando){
            alert('actualmente jugando');
        }else{
            alert('lo lamentamos sala ocupada espera un momento');
        }
    }
}

// configurando el area de juego de los jugadores
socket.on('playGame', function(jugadores){
    $players.innerHTML = createPlayers(jugadores);
    players = jugadores;

    playing = true;
})

var statePlayers = {challenge: true, oponente: false}

// reciviendo las entradas del cliente en la sala de juego
function button (event){
    if(playing){
        if(statePlayers.challenge){
            if(players[0] === name){

                if(event.srcElement.textContent === ''){
                    var claseElement = event.srcElement.className;

                    socket.emit('sendMoved', claseElement, true);

                }else{
                    alert('opcion invalida');
                }

            }else if(players[1] === name){
                alert('turno del retador');
            }else{
                alert('contenido disponible solo para los jugadores');
            }
        }

        if(statePlayers.oponente){
            if(players[1] === name){

                if(event.srcElement.textContent === ''){
                    var claseElement = event.srcElement.className;

                    socket.emit('sendMoved', claseElement, false);

                }else{
                    alert('opcion invalida');
                }

            }else if(players[0] === name){
                alert('turno del oponente');
            }else{
                alert('contenido disponible solo para los jugadores');
            }
        }
    }else{
        alert('lo lamentamos contenido no disponible deves de retar a alguien primero');
    }
}

// obtenidendo la movida del jugador para imprimir una nueva
const element = (moved) =>{
    for(i = 0; i < $game.children.length; i++){
        if($game.children[i].className === moved){
            return $game.children[i];
        }
    }
}

// imprimiendo las movidas de los jugadores
socket.on('printMoved', function(moved, active){
    for(var i = 0; i < players.length; i++){
        if(name === players[i]){
            $gameEnd.innerHTML = '<button onclick="endGame()">Terminar Juego</button>';
        }
    }

    if(active){
        statePlayers.oponente = true;
        statePlayers.challenge = false;
        var movedClit = element(moved);
        movedClit.innerText = '✖';
        movedClit.style.color = '#18BC9C';

    }else{
        statePlayers.oponente = false;
        statePlayers.challenge = true;
        var movedClit = element(moved);
        movedClit.innerText = '◉';
        movedClit.style.color = '#2C3E50';
    }
});

// reiniciando la configuracion del juego
socket.on('clearSala', function(){
    playing = false;
    players = [];
    $players.children[0].remove();
    $gameEnd.children[0].remove();
    for(i = 0; i < $game.children.length; i++){
        $game.children[i].innerText = '';
    }
})

// terminado el juego x decicionn del usuario
function endGame (){
    socket.emit('terminarJuego');
}

// configuracion del menu movil de los usuarios
function barUsers(){
    $navLeft.classList.toggle('active');
    $btnMovil.classList.toggle('active');
}