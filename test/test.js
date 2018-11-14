const assert = require('assert');
var io = require('socket.io-client');
describe('socket.io test', function()
{
   var socket;
   var msg;
   beforeEach(function(done)
   {
       socket = io.connect('http://localhost:1337', {
           'reconnection delay': 0
           , 'reopen delay': 0
           , 'force new connection': true
           , transports: ['websocket']
       });

       var nick = 'Hello World';

       socket.on('connect', ()=>
       {
           console.log('hello')
           socket.json.emit("hello", {"name": nick});
           done();
       });

       socket.on('msg', (value) =>
       {
           console.log(value);
           msg = value.message;
       });
   });

    afterEach(function(done) {
        // Cleanup
        if(socket.connected) {
            console.log('disconnecting...');
            socket.disconnect();
        } else {
            // There will not be a connection unless you have done() in beforeEach, socket.on('connect'...)
            console.log('no connection to break...');
        }


        done();
    });

   it('should say hello', (done)=> {
       setTimeout(()=>
       {
           if(msg.includes(`Присоединился Hello World`))
               done();
       }, 100);
   });

   it('should communicate', (done)=> {
        var CUSTOM_MSG = 'ПИДОРАСЫ ВАМ ПИЗДА))))))))))'
        socket.json.emit("bid", `${CUSTOM_MSG}`);
        setTimeout(()=>
        {
            if(msg.includes(`Hello World сделал ставку: ${CUSTOM_MSG}`))
                done();
        }, 100);
        //done();
   })

   it('should say goodbye', (done)=>
   {
       var anotherSocket = io.connect('http://localhost:1337', {
           'reconnection delay': 0
           , 'reopen delay': 0
           , 'force new connection': true
           , transports: ['websocket']
       });

       var anotherMsg;

       anotherSocket.on('msg', (value) =>
       {
           console.log(value);
           anotherMsg = value.message;
       });

       anotherSocket.on('connect', ()=>
       {
           console.log('hello LISTENER')
           anotherSocket.json.emit("hello", {"name": "Listener"});
       });

       setTimeout(()=>{
            socket.disconnect();

            setTimeout(()=>
            {
                if(anotherMsg.includes(`Покинул Hello World`))
                {
                    console.log('HELP ME');
                    if (anotherSocket.connected)
                    {
                        console.log('disconnecting...');
                        anotherSocket.disconnect();
                    } else
                    {
                        // There will not be a connection unless you  have done() in beforeEach, socket.on('connect'...)
                        console.log('no connection to break...');
                    }
                    done();
                }
            }, 200);
       }, 200);


   });
});