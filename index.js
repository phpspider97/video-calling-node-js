import express from 'express'
const app = express()

import { Server } from 'socket.io';

const PORT = process.env.PORT || 4200
const server = app.listen(PORT,()=>{
    console.log('Server started !!')
})

import bodyParser from 'body-parser'

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.set('view engine','ejs')
app.set('views','./views')

app.use(express.static('public'))

import userRoute from './routes/userRoute.js'

app.use('/',userRoute)  
 
const io = new Server(server);

io.on('connection', (socket) => {
    
    socket.on('join',(roomName)=>{
        console.log('User ID : '+socket.id);
        var rooms = io.sockets.adapter.rooms
        var room = rooms.get(roomName)
       
        if(room == undefined){
            socket.join(roomName)
            socket.emit('created')
        }else if(room.size == 1){
            socket.join(roomName)
            socket.emit('joined')
        }else{
            console.log('Already full!!')
            socket.emit('full')
        } 
    }) 

    socket.on('ready',(roomName)=>{
        console.log('ready__')
        socket.broadcast.to(roomName).emit('ready')
    })

    socket.on('candidate',(candidate,roomName)=>{
        console.log('candidate__')
        socket.broadcast.to(roomName).emit('candidate',candidate)
    })

    socket.on('offer',(offer,roomName)=>{
        console.log('offer__',offer)
        socket.broadcast.to(roomName).emit('offer',offer)
    })

    socket.on('answer',(answer,roomName)=>{
        console.log('answer__')
        socket.broadcast.to(roomName).emit('answer',answer)
    })

});