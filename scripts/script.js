let dateObject;
let exercisesArray;
let exerciseCardsArray;

const currentDate = {
  day: new Date().getDate(),
  month: new Date().getMonth() + 1,
  year: new Date().getFullYear()
}

if(localStorage.getItem('dateObject') && localStorage.getItem('exercisesArray') && localStorage.getItem('exerciseCardsArray')) {
  dateObject = JSON.parse(localStorage.getItem('dateObject'));
  exercisesArray = JSON.parse(localStorage.getItem('exercisesArray'));
  exerciseCardsArray = JSON.parse(localStorage.getItem('exerciseCardsArray'));

  startMainPage();

  //Checks completion on all rendered progression inputs on start
  checkCompletion(document.querySelectorAll('.js-goal-progression-input'))
}
else {
  dateObject = {};
  exercisesArray = [];
  exerciseCardsArray = [];

  startSetupPage();
}

setupOnStartListeners();

function setupOnStartListeners() {

  //Setup Page
  const setupExCountEl = document.getElementById('exercise-count');
  setupExCountEl.addEventListener('change', updateExerciseInputList);

  const generatePlanButton = document.getElementById('generate-plan-btn');
  generatePlanButton.addEventListener('click', checkInputs);

  //Main Page Menu
  const dropdown = document.querySelector('.dropdown-menu');
  const menuButton = document.getElementById('menu-btn');

  function changeMenuState() {
    menuButton.classList.toggle('cross');
    dropdown.classList.toggle('not-visible');
  }

  menuButton.addEventListener('click', changeMenuState);

  const topScrollBtn = document.getElementById('to-top-btn'); 
  topScrollBtn.addEventListener('click', () => {
    scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth'
    });

    changeMenuState();
  });

  const btmScrollBtn = document.getElementById('to-btm-btn');
  btmScrollBtn.addEventListener('click', () => {
    scrollTo({
      top: document.body.scrollHeight,
      left: 0,
      behavior: 'smooth'
    });

    changeMenuState();
  });

  const currentDateScrollBtn = document.getElementById('to-current-date-btn');
  currentDateScrollBtn.addEventListener('click', () => {

    let cardFound = false;
    let targetCard;

    exerciseCardsArray.forEach((card, index) => {
      const cardDate = card.date;
      if(JSON.stringify(cardDate) === JSON.stringify(currentDate)) {
        cardFound = true;
        targetCard = document.querySelector(`[data-card-index="${index}"]`);
        return;
      }
    });
    if(cardFound) {
      targetCard.scrollIntoView({
        block: 'center',
        behavior: 'smooth'
      });
    }
    else if(!cardFound) {
      alert('Card of current date could not be found');
    }

    changeMenuState();
  });

  const resetPlanBtn = document.getElementById('reset-plan-btn');
  resetPlanBtn.addEventListener('click', () => {
    toggleOverlay();
    changeMenuState();
  });

  //Reset plan overlay, buttons
  const yesBtn = document.getElementById('yes-btn');
  yesBtn.addEventListener('click', () => {

    localStorage.removeItem('dateObject');
    localStorage.removeItem('exercisesArray');
    localStorage.removeItem('exerciseCardsArray');

    dateObject = {};
    exercisesArray = [];
    exerciseCardsArray = [];

    startSetupPage();
    toggleOverlay();
  });

  const noBtn = document.getElementById('no-btn');
  noBtn.addEventListener('click', () => {
    toggleOverlay();
  });

  function toggleOverlay() {
    const overlayEl = document.getElementById('reset-plan-confirmation-overlay');
    overlayEl.classList.toggle('hide-overlay');
  }
}

//removes keyboard input from number- and date input elements
function removeKeyboardNumberInput() {
  const inputElements = document.getElementsByTagName('input');

  for(let i = 0; i < inputElements.length; i++) {
    const inputType = inputElements[i].getAttribute('type');
    if(inputType === 'date' || inputType === 'number') {
      inputElements[i].addEventListener('keydown', (e) => {
        //e.preventDefault();
      });
    }
  }
}

function startSetupPage() {
  const setupPageEl = document.getElementById('setup-page');
  const mainPageEl = document.getElementById('main-page');

  setupPageEl.style.removeProperty('display');
  mainPageEl.style.setProperty('display', 'none');
  
  updateStartDateRestrictions();
  updateExerciseInputList();
  removeKeyboardNumberInput();
}

function updateStartDateRestrictions() {
  const startDateEl = document.getElementById('start-date');
  const endDateEl = document.getElementById('end-date');

  const date = new Date();
  const day = date.getDate().toString().length === 1 ? '0' + date.getDate() : date.getDate();
  const month = (date.getMonth() + 1).toString().length === 1 ? '0' + (date.getMonth() + 1) : (date.getMonth() + 1);
  const year = date.getFullYear();

  const minDate = `${year}-${month}-${day}`;
  const maxDate = `${year + 1}-${month}-${day}`;

  startDateEl.setAttribute('min', minDate);
  startDateEl.setAttribute('max', maxDate);
  
  endDateEl.setAttribute('min', minDate);
  endDateEl.setAttribute('max', maxDate);
}

function updateExerciseInputList() {
  const countEl = document.getElementById('exercise-count');
  const inputList = document.getElementById('exercise-input-list');

  const count = Number(countEl.value);

  let html = '';
  for(let elementNum = 0; elementNum < count; elementNum++) {
    html += 
    `
    <div class="exercise">
      <div class="name-container">
        <label class="name-label">Name <span>(max 20 characters)<span></label>
        <input type="text" minlength="1" maxlength="20" placeholder="Ex: Pushups" class="name js-setup-name-input">
      </div>
      <div class="goal-container">
        <label class="goal-label">Goal</label>
        <input type="number" inputmode="numeric" value="1" min="1" max="999" class="goal js-setup-goal-input">
      </div>
    </div>
    `
  }
  inputList.innerHTML = html;

  removeKeyboardNumberInput();
}

function checkInputs() {
  const startDateEl = document.getElementById('start-date');
  const endDateEl = document.getElementById('end-date');

  if(startDateEl.value === '' || endDateEl.value === '' ) {
    alert('Please check date inputs');
    return;
  }

  const startDateArray = startDateEl.value.split('-');
  const endDateArray = endDateEl.value.split('-');

  for(let i = 0; i < 3; i++) {
    if(Number(startDateArray[i]) < Number(endDateArray[i])) {
      break;
    }
    else if(Number(startDateArray[i]) > Number(endDateArray[i])) {
      alert('End date must be a later date than the Start date');
      return;
    }
  }


  const nameInputs = document.getElementById('exercise-input-list').querySelectorAll('.js-setup-name-input');
  for(let i = 0; i < nameInputs.length; i++) {
    const element = nameInputs[i];
    if(element.value.length < element.getAttribute('minlength')) {
      alert('Check name inputs');
      return;
    }
  }

  const goalInputs = document.getElementById('exercise-input-list').querySelectorAll('.js-setup-goal-input');
  for(let i = 0; i < goalInputs.length; i++) {
    const element = goalInputs[i];

    console.log(element.value + ' ' + typeof(element.value));
    console.log(element.getAttribute('max') + ' ' + typeof(element.getAttribute('max')));
    console.log(element.value > Number(element.getAttribute('max')));


    if(element.value < Number(element.getAttribute('min')) || element.value > Number(element.getAttribute('max'))) {
      alert('Check goals, goal must be between 1 and 999');
      return;
    }
  }
  
  gatherData();
}
function gatherData() {

  //For Date Object
  const startDateString = document.getElementById('start-date').value;
  const endDateString = document.getElementById('end-date').value;

  let year, month, day;

  const startDateValues = startDateString.split('-');
  year = Number(startDateValues[0]);
  month = Number(startDateValues[1]);
  day = Number(startDateValues[2]);

  dateObject.startDate = {year, month, day};

  const endDateValues = endDateString.split('-');
  year = Number(endDateValues[0]);
  month = Number(endDateValues[1]);
  day = Number(endDateValues[2]);

  dateObject.endDate = {year, month, day};

  dateObject.interval = Number(document.getElementById('interval').value);

  localStorage.setItem('dateObject', JSON.stringify(dateObject));


  //For Exercise Array
  const names = document.querySelectorAll('.js-setup-name-input');
  const goals = document.querySelectorAll('.js-setup-goal-input');

  let name, goal;

  for(let i = 0; i < names.length; i++) {
    name = names[i].value;
    goal = Number(goals[i].value);
    exercisesArray.push({name, goal});
  }

  localStorage.setItem('exercisesArray', JSON.stringify(exercisesArray));

  //Resetting inputs on setup page
  document.getElementById('start-date').value = '';
  document.getElementById('end-date').value = '';
  document.getElementById('interval').value = 1; // 1 is value of "Everyday"
  document.getElementById('exercise-count').value = 1;

  startMainPage();
}

function startMainPage() {
  const mainPageEl = document.getElementById('main-page');
  const setupPageEl = document.getElementById('setup-page');

  mainPageEl.style.removeProperty('display');
  setupPageEl.style.setProperty('display', 'none');

  renderExerciseCards();
  setCurrenDateOnCard();
  removeKeyboardNumberInput();
  setMainPageListeners();
}

function renderExerciseCards() {
  
  const exercisesGrid = document.getElementById('exercises-grid');

  const loopDate = dateObject.startDate;

  let html = '';
  let cardHTML = '';
  let contentHTML = '';

  let cardIndex = 0;

  while(currentSmallerThanEnd()) {
    const cardObject = {
      date: {
        day: loopDate.day,
        month: loopDate.month,
        year: loopDate.year
      },
      exercises: []
    }

    for(let i = 0; i < exercisesArray.length; i++) {
      const exercise = exercisesArray[i];

      const progressionValue = exerciseCardsArray[cardIndex] ? exerciseCardsArray[cardIndex].exercises[i].progression : 0;

      contentHTML += 
      `
      <div class="excercise" data-ex-index="${i}">
        <img class="ex-completion-img" src="images/not-completed.svg">
        <div class="name">${exercise.name}</div>
        <input type="number" value="${progressionValue}" inputmode="numeric" min="0" max="999" class="amount js-goal-progression-input">
        <div class="goal">Goal: <span>${exercise.goal}</span></div>
      </div>
      `;

      cardObject.exercises.push({progression: 0, goal: exercise.goal});
    }

    cardHTML = 
    `
    <div class="card" data-card-index="${cardIndex}">
    <div class="card-disabled-overlay"></div>
      <header class="card-header">
        <img class="card-completion-img" src="images/not-completed.svg">
        <div class="date">
          <div class="day">${loopDate.day}</div>
          <div class="month">${monthNumToText(loopDate.month)}</div>
        </div>
      </header>
      <div class="content">
        ${contentHTML}
      </div>
    </div>
    `;
    html += cardHTML;

    contentHTML = '';

    if(!exerciseCardsArray[cardIndex]) {
      exerciseCardsArray.push(cardObject);
    }

    cardIndex++;

    incrementloopDate();
  }

  localStorage.setItem('exerciseCardsArray', JSON.stringify(exerciseCardsArray));

  exercisesGrid.innerHTML = html;

  //Solves issue that page is not at top after cards are rendered
  scrollTo(0, 0);

  //Returns true if current date is sooner than end date
  function currentSmallerThanEnd() {
    const endDate = dateObject.endDate;
    if(loopDate.year === endDate.year && loopDate.month === endDate.month && loopDate.day === endDate.day) {
      return true;
    }
    else if(loopDate.year < endDate.year) {
      return true;
    }
    else if(loopDate.month < endDate.month) {
      return true;
    }
    else if(loopDate.day < endDate.day) {
      return true;
    }
    return false;
  }

  //Returns a string of month number i form of month name
  function monthNumToText(monthNum) {
    const monthNames = [
      'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
      'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'
    ];
    return monthNames[monthNum - 1];
  }

  function incrementloopDate() {

    const daysInMonth = [
      31, februaryChecker(), 31, 30, 31, 30,
      31, 31, 30, 31, 30, 31
    ];

    increment = dateObject.interval;

    if(loopDate.day + increment > daysInMonth[loopDate.month - 1]) {

      loopDate.day -= daysInMonth[loopDate.month - 1];
      loopDate.day += increment;
      loopDate.month++;

      if(loopDate.month > 12) {
        loopDate.month -= 12;
        loopDate.year++;
      }
    }
    else {
      loopDate.day += increment;
    }

    //Checks amount of days in this year's february
    function februaryChecker() {
      if(loopDate.year % 4 === 0) {
        return 29;
      }
      return 28;
    }
  }
}

function setCurrenDateOnCard() {

  exerciseCardsArray.forEach((card, index) => {

    const cardDate = card.date;

    if(JSON.stringify(cardDate) === JSON.stringify(currentDate)) {
      document.querySelector(`[data-card-index="${index}"]`).setAttribute('data-current-date', '');
      return;
    }
  });
}

function setMainPageListeners() {
  const goalProgressionInputs = document.querySelectorAll('.js-goal-progression-input');

  //Progression Input
  goalProgressionInputs.forEach(input => {
    input.addEventListener('change', () => {
      checkCompletion([input]);
    });
  });
}

function checkCompletion(inputs) {

  inputs.forEach((input) => {
    const exerciseEl = input.parentElement;
    const cardEl = exerciseEl.parentElement.parentElement;
    const exerciseImageEl = exerciseEl.querySelector('.ex-completion-img');
    const cardImageEl = cardEl.querySelector('.card-header').querySelector('.card-completion-img');

    const exerciseIndex = Number(exerciseEl.getAttribute('data-ex-index'));
    const cardIndex = Number(cardEl.getAttribute('data-card-index'));

    const goalValue = exerciseCardsArray[cardIndex].exercises[exerciseIndex].goal;
    const inputValue = Number(input.value);

    exerciseCardsArray[cardIndex].exercises[exerciseIndex].progression = inputValue;

    localStorage.setItem('exerciseCardsArray', JSON.stringify(exerciseCardsArray));

    //Changes exercise completion img
    if(inputValue >= goalValue){
      exerciseImageEl.setAttribute('src', 'images/completed.svg');
    }
    else if(inputValue < goalValue) {
      exerciseImageEl.setAttribute('src', 'images/not-completed.svg');
    }

    //Changes card completion img
    let allAreCompleted = true;

    exerciseCardsArray[cardIndex].exercises.forEach(exercise => {
      if(exercise.progression < exercise.goal) {
        allAreCompleted = false;
      }
    });

    if(allAreCompleted) {
      cardImageEl.setAttribute('src', 'images/completed.svg');
    }
    else if(!allAreCompleted) {
      cardImageEl.setAttribute('src', 'images/not-completed.svg');
    }
  });
}