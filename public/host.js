const socket = io()
const activeList = document.querySelector('.js-active')
const buzzList = document.querySelector('.js-buzzes')
const clear = document.querySelector('.js-clear')
const deactivate = document.querySelector('.js-deactivate')
const timerApp = document.querySelector('.js-timer-app')

const FULL_DASH_ARRAY = 283;
const WARNING_THRESHOLD = 10;
const ALERT_THRESHOLD = 5;

const COLOR_CODES = {
  info: {
    color: "green"
  },
  warning: {
    color: "orange",
    threshold: WARNING_THRESHOLD
  },
  alert: {
    color: "red",
    threshold: ALERT_THRESHOLD
  }
};

let timeLimit = 0;
let timePassed = 0;
let timeLeft = 0;
let timerInterval = null;
let remainingPathColor = COLOR_CODES.info.color;

let globalUsers = []

socket.on('active', (users) => {
  globalUsers = JSON.parse(JSON.stringify(users))
  activeList.innerHTML =  users
    .map(user => [
      `<li>`,
        `<p class="user-list">${user.name} on Team ${user.team}</p>`,
        `<div class="kick-container js-kick-container" onclick="kick('${user.id}')">`,
          `<div class="leftright"></div>`,
          `<div class="rightleft"></div>`,
          `<label class="kick">kick</label>`,
        `</div>`,
      `</li>`,
      ].join('\n'))
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
  if (buzzes.length == 1) {
    startTimer()
  }
})

clear.addEventListener('click', () => {
  socket.emit('clear')
  resetTimer()
})

const resetTimer = () => {
  timerApp.classList.add("hidden")
  clearInterval(timerInterval);
  timeLimit = 30;
  timePassed = 0;
  timeLeft = timeLimit;
  timerInterval = null;
}

deactivate.addEventListener('click', () => {
  socket.emit('deactivate')
})

const kick = (userId) => {
  globalUsers.forEach(u => {
    if (u.id === userId) {
      console.log(`kick: ${userId}`)
      socket.emit('kick', u)
    }
  })
}

socket.emit('getUserList')




// Credit: Mateusz Rybczonec


const onTimesUp = () => {
  clearInterval(timerInterval);
}

const formatTime = (time) => {
  const minutes = Math.floor(time / 60);
  let seconds = time % 60;
  if (seconds < 10) {
    seconds = `0${seconds}`;
  }
  return `${minutes}:${seconds}`;
}

const setRemainingPathColor = (timeLeft) => {
  const timerRemaining = document.querySelector('.js-timer-remaining')
  const { alert, warning, info } = COLOR_CODES;
  if (timeLeft <= alert.threshold) {
    timerRemaining
      .classList.remove(warning.color);
    timerRemaining
      .classList.add(alert.color);
  } else if (timeLeft <= warning.threshold) {
    timerRemaining
      .classList.remove(info.color);
    timerRemaining
      .classList.add(warning.color);
  }
}

const calculateTimeFraction = () => {
  const rawTimeFraction = timeLeft / timeLimit;
  return rawTimeFraction - (1 / timeLimit) * (1 - rawTimeFraction);
}

const setCircleDasharray = () => {
  const timerRemaining = document.querySelector('.js-timer-remaining')
  const circleDasharray = `${(
    calculateTimeFraction() * FULL_DASH_ARRAY
  ).toFixed(0)} 283`;
  timerRemaining
    .setAttribute("stroke-dasharray", circleDasharray);
}

const startTimer = () => {
  if (timerInterval != null) {
    console.log(`timer already running`)
    return
  }
  const timerLabel = document.querySelector('.js-timer-label')
  timerInterval = setInterval(() => {
    timePassed = timePassed += 1;
    timeLeft = timeLimit - timePassed;
    timerLabel.innerHTML = formatTime(
      timeLeft
    );
    setCircleDasharray();
    setRemainingPathColor(timeLeft);
    if (timeLeft === 0) {
      onTimesUp();
    }
  }, 1000);
  timerApp.classList.remove("hidden")
}

  
const setupTimer = () => {
  resetTimer()
  timerApp.innerHTML = `
    <div class="timer">
    <svg class="timer-svg" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <g class="timer-circle">
        <circle class="timer-path-elapsed" cx="50" cy="50" r="45"></circle>
        <path
        stroke-dasharray="283"
        class="js-timer-remaining timer-path-remaining ${remainingPathColor}"
        d="
        M 50, 50
        m -45, 0
        a 45,45 0 1,0 90,0
        a 45,45 0 1,0 -90,0
        "
        ></path>
    </g>
    </svg>
    <span class="js-timer-label timer-label">${formatTime(timeLeft)}</span>
    </div>
    `;
}

setupTimer();