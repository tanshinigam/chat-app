// const { error } = require("console");

// const message = require("./utils/message");

const socket = io()

const $messageform = document.querySelector("#newinput");
const $messageforminput = $messageform.querySelector('input');
const $messageformsubmit = $messageform.querySelector('button');
const $locationbutton = document.querySelector('#location')
const $messages = document.querySelector('#messages')

const messagetemplate = document.querySelector("#message-template").innerHTML
const locationtemplate = document.querySelector("#location-template").innerHTML
const sidebartemplate = document.querySelector("#sidebar-template").innerHTML


const autoscroll = () => {
    // New message element
    const $newMessage = $messages.lastElementChild

    // Height of the new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    // Visible height
    const visibleHeight = $messages.offsetHeight

    // Height of messages container
    const containerHeight = $messages.scrollHeight

    // How far have I scrolled?
    const scrollOffset = $messages.scrollTop + visibleHeight

    if (containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight
    }
}

//Options
//Grabbing the username and room id values
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })

socket.on("message", (message)=>{
    console.log(message);
    const html = Mustache.render(messagetemplate,{
        usernamesend: message.username,
        messageinside: message.text,
        createdata: moment(message.createdat).format('LT')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
});

socket.on("users", (message)=>{
    console.log(message);
})

document.querySelector('form').addEventListener('submit', (e)=>{
    e.preventDefault()

    $messageformsubmit.setAttribute('disabled', 'disabled');

    let message = e.target.message.value
    socket.emit("display", message, (error)=>{
        $messageformsubmit.removeAttribute('disabled');
        $messageforminput.value = '';
        $messageforminput.focus()
        if(error){
            return alert(error);
        }
        else{
        console.log("message delivered");
        }
    });
});

socket.on("locationmessage", (url)=>{
    const htmllocation = Mustache.render(locationtemplate,{
        usernamesend: url.username,
        locationinside: url.url,
        createdata: moment(url.createdat).format('LT')
    });
    $messages.insertAdjacentHTML('beforeend', htmllocation);
    autoscroll()
})

socket.on("roomdata", ({room, users})=>{
    const html = Mustache.render(sidebartemplate, {
        room,
        users
    })
    document.getElementById("sidebar").innerHTML = html

})


$locationbutton.addEventListener('click', () => {
    $locationbutton.setAttribute('disabled', 'disabled');
    if (!navigator.geolocation) {
        return alert('Geolocation is not supported by your browser.')
    }

    navigator.geolocation.getCurrentPosition((position) => {
        socket.emit('sendLocation', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }, ()=>{
            $locationbutton.removeAttribute('disabled');
            console.log("Location shared");
        })
    })
})

//Clients sends this to server
socket.emit('join', { username, room }, (error) => {
    if(error){
        alert(error);
        location.href = '/'
    }
});