//IMPORTING LIBRARY
const express = require('express');
const http = require("http");
const socketio = require('socket.io');
const badword = require('bad-words');
const { generatemessage, generatelocation} = require('./utils/message')
const {adduser, removeuser, finduser, getuserinroom} = require('./utils/users')


//SETTING 
const app = express();
const server = http.createServer(app);
const io = socketio(server);


//socket.emit - particular
//io.emit - to all
//socket.broadcast.emit - everyone leaving current
//io.to.emit - specific to a particular room(everyone)
//socket.broadcast.to.emit - everyone leacing the user in a user

app.set("view engine", "ejs");
app.use(express.static("public"));


io.on('connection', (socket)=>{
    console.log("client is connected");

    //Server grabs room id and value
    socket.on('join', ({ username, room }, callback) => {


        const {error, user} = adduser({ id: socket.id, username, room})

        if(error){
            return callback(error)
        }


       
        socket.join(user.room)
   
        socket.emit('message', generatemessage("Admin",'Welcome!'))
        socket.broadcast.to(user.room).emit('message', generatemessage(`${user.username} has joined!`))
        io.to(user.room).emit("roomdata", {
            room: user.room,
            users: getuserinroom(user.room)
        })


        callback()

    })
    socket.on("display", (message, callback)=>{

        const filter = new badword();

        const user = finduser(socket.id)

        if(filter.isProfane(message)){
            return callback('Abusing is not allowed');
        }
        else{
        io.to(user.room).emit("message", generatemessage(user.username, message));
        callback();
        }
    });

    socket.on('sendLocation', (coords, callback) => {
        const user = finduser(socket.id)

        const username = user.username
        io.to(user.room).emit('locationmessage', generatelocation(user.username,`https://google.com/maps?q=${coords.latitude},${coords.longitude}`))
        callback();
    });
    socket.on('disconnect', ()=>{

        const user = removeuser(socket.id)

        if(user){
            io.to(user.room).emit("message", generatemessage("Admin", `${user.username} has left the chat room`));
            io.to(user.room).emit('roomdata', {
                room: user.room,
                users: getuserinroom(user.room)
            })
        }

    })
})


//ROUTES
app.get("/", function(req, res){
    res.render("home");
});
app.get("/chatroom", function(req, res){
    res.render("chat");
})


//PORT NUMBER
const port = process.env.PORT || 3000
server.listen(port, function(){
    console.log('server started on ',port);
})