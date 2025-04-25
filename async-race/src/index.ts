import './styles/style.css';
import { renderGarage } from './components/garage/GarageView';
import { renderWinners, getWinnersPage, setWinnersPage } from './components/winners/WinnersView';
import { getGaragePage } from './components/garage/GarageView';

let currentView: 'garage' | 'winners' = 'garage';
let garagePage = 1;
let winnersPage = getWinnersPage();

export function setCurrentView(view: 'garage' | 'winners') {
  currentView = view;
}
export async function renderView() {
  viewContainer.innerHTML = '';

  if (currentView === 'garage') {
    const garage = await renderGarage(garagePage, (newPage: number) => {
      garagePage = newPage;
    });
    viewContainer.appendChild(garage);
  } else if (currentView === 'winners') {
    setWinnersPage(winnersPage);
    const winners = await renderWinners();
    viewContainer.appendChild(winners);
  }
}

// === DOM SETUP ===
const root = document.getElementById('app');
if (!root) throw new Error('Root element not found');

const nav = document.createElement('div');
const garageBtn = document.createElement('button');
garageBtn.textContent = 'Garage';

const winnersBtn = document.createElement('button');
winnersBtn.textContent = 'Winners';

nav.appendChild(garageBtn);
nav.appendChild(winnersBtn);
root.appendChild(nav);

const viewContainer = document.createElement('div');
viewContainer.id = 'view-container';
root.appendChild(viewContainer);

// === NAVIGATION HANDLERS ===
garageBtn.addEventListener('click', async () => {
  if (currentView === 'winners') {
    winnersPage = getWinnersPage();
  }
  currentView = 'garage';
  await renderView();
});

winnersBtn.addEventListener('click', async () => {
  if (currentView === 'garage') {
    garagePage = getGaragePage();
  }
  currentView = 'winners';
  await renderView();
});

renderView();
