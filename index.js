const http = require('http')
const express = require('express')
const socketio = require('socket.io')

const app = express();
const server = http.Server(app);
const io = socketio(server);

const title = 'Buffer Buzzer'

let data = {
  users: new Set(),
  buzzes: new Set(),
}

const getData = () => ({
  users: [...data.users].map(u => JSON.parse(u)),
  buzzes: [...data.buzzes].map(b => {
    const [ name, team ] = b.split('-')
    return { name, team }
  })
})

app.use(express.static('public'))
app.set('view engine', 'pug')

app.get('/', (req, res) => res.render('index', { title }))
app.get('/host', (req, res) => res.render('host', Object.assign({ title }, getData())))

io.on('connection', (socket) => {
  
  socket.on('join', (user) => {
    data.users.add(JSON.stringify(user))
    io.emit('active', [...data.users].map(u => JSON.parse(u)))
    console.log(`${JSON.stringify(user)} joined!`)
  })

  socket.on('buzz', (user) => {
    data.buzzes.add(`${user.name}-${user.team}`)
    io.emit('buzzes', [...data.buzzes])
    console.log(`${user.name} buzzed in!`)
  })

  socket.on('clear', () => {
    data.buzzes = new Set()
    io.emit('buzzes', [...data.buzzes])
    console.log(`Clear buzzes`)
  })

  socket.on('deactivate', () => {
    data.users = new Set()
    io.emit('deactivate', [])
    io.emit('active', [...data.users].map(u => JSON.parse(u)))
    console.log(`Clear users`)
  })

  socket.on('getUserList', () => {
    io.emit('active', [...data.users].map(u => JSON.parse(u)))
  })

  socket.on('kick', (kickUser) => {
    console.log(`kick user ${JSON.stringify(kickUser)}`)
    data.users.delete(JSON.stringify(kickUser))
    io.emit('kick', kickUser)
    io.emit('active', [...data.users].map(u => JSON.parse(u)))
  })
})

server.listen(8090, () => console.log('Listening on 8090'))
