const socket = io()
const activeList = document.querySelector('.js-active')
const buzzList = document.querySelector('.js-buzzes')
const clear = document.querySelector('.js-clear')
const deactivate = document.querySelector('.js-deactivate')

socket.on('active', (users) => {
  activeList.innerHTML =  users
    .map(user => `<li>${user.name} on Team ${user.team}</li>`)
    .join('')
})

socket.on('buzzes', (buzzes) => {
  buzzList.innerHTML = buzzes
    .map(buzz => {
      const p = buzz.split('-')
      return { name: p[0], team: p[1] }
    })
    .map(user => `<li>${user.name} on Team ${user.team}</li>`)
    .join('')
})

clear.addEventListener('click', () => {
  socket.emit('clear')
})

deactivate.addEventListener('click', () => {
  socket.emit('deactivate')
})

