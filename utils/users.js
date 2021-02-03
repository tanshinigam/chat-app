const users = []

//adduser, removeusers, usersinroom, getuser

const adduser = ({id, username, room}) =>{
    //clean the data
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    //Validate the data
    if(!username || !room){
        return {
            error: 'Username and room are required'
        }
    }

    //check for existing user
    const existinguser = users.find((user) => {
        return user.room===room && user.username===username
    });

    //validtae
    if(existinguser){
        return {
            error: "Username taken!"
        }
    }

    //Store user
    const user = {id, username, room}
    users.push(user)
    return {user}
}

const removeuser = (id)=>{
    const index = users.findIndex((user) => user.id==id)
    if(index!==-1){
        return users.splice(index, 1)[0]
    }
}

const finduser = (id)=>{
    return users.find((user) => user.id === id)
}

const getuserinroom = (room) => {
    return users.filter((user) => user.room===room)
}

module.exports = {
    adduser,
    removeuser,
    finduser,
    getuserinroom
}
// adduser({
//     id: 22,
//     username: "my",
//     room: "asnd"
// })
// adduser({
//     id: 23,
//     username: "maskldny",
//     room: "asnd"
// })
// adduser({
//     id: 25,
//     username: "maskldnyas",
//     room: "asnd"
// })

// removeuser(25)
// const userlist = getuserinroom("asnd");

// const userne = finduser(22);

// console.log(userlist);
