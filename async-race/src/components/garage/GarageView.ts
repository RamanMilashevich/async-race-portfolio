import { createCarForm } from './CarForm';
import { getCars, Car, createCar } from '../../api/api';
import { CarCard } from './CarCard';
import { startEngine, drive, stopEngine } from '../../api/engineApi';
import { showWinnerModal } from '../../utils/ui';
import { generateRandomName, generateRandomColor } from '../../utils/generateRandomCars';
import { getWinner, createWinner, updateWinner } from '../../api/winnersApi';
import { getWinnersUpdater, setWinnersPage } from '../winners/WinnersView';
import { setCurrentView, renderView } from '../../index';
import { isWinnerBlockedByResize, setWinnerBlockedByResize } from '../../state/winnerBlock';
import { getEditingCarState } from '../../state/formState';

const carsPerPage = 7;
const carCards: CarCard[] = [];
let raceInterrupted = false;
let resizing = false;
let resizeTimer: number | null = null;
const DEBOUNCE = 120;

let winnerAnnounced = false;
let currentRaceSessionId = 0;
let modalAllowed = true;

function freezeRunningCars() {
  raceInterrupted = true;
  for (const card of carCards) {
    if (card.isRunning()) {
      stopEngine(card.getId()).catch(() => {});
      card.abortRun();
    }
  }
}

window.addEventListener('resize', () => {
  resizing = true;
  raceInterrupted = true;
  setWinnerBlockedByResize(true);
  winnerAnnounced = true;
  modalAllowed = false;

  freezeRunningCars();

  const modal = document.querySelector('.modal');
  if (modal) modal.remove();

  if (resizeTimer) clearTimeout(resizeTimer);
  resizeTimer = window.setTimeout(() => {
    resizing = false;
    resizeTimer = null;

    setTimeout(() => {
      setWinnerBlockedByResize(false);
      winnerAnnounced = false;
    }, 1000);
  }, DEBOUNCE);
});

export async function renderGarage(initialPage = 1, onPageChange?: (page: number) => void): Promise<HTMLElement> {
  let currentPage = initialPage;
  _getGaragePage = () => currentPage;
  let totalCars = 0;

  const container = document.createElement('div');
  container.className = 'garage-view';

  const title = document.createElement('h2');
  title.textContent = 'Garage';

  const carList = document.createElement('div');
  carList.className = 'car-list';

  const paginationControls = document.createElement('div');
  paginationControls.className = 'pagination';

  const pageIndicator = document.createElement('span');
  pageIndicator.className = 'page-indicator';
  pageIndicator.textContent = `Page ${currentPage}`;

  const prevBtn = document.createElement('button');
  prevBtn.textContent = 'Prev';
  prevBtn.disabled = currentPage === 1;

  const nextBtn = document.createElement('button');
  nextBtn.textContent = 'Next';

  paginationControls.appendChild(prevBtn);
  paginationControls.appendChild(pageIndicator);
  paginationControls.appendChild(nextBtn);

  const renderCarList = async (scrollOffset = 0) => {
    const targetScrollY = window.scrollY + scrollOffset;

    carList.innerHTML = '';
    carCards.length = 0;

    const { cars, total } = await getCars(currentPage, carsPerPage);
    totalCars = total;

    title.textContent = `Garage (${totalCars} cars)`;
    pageIndicator.textContent = `Page ${currentPage} / ${Math.ceil(totalCars / carsPerPage)}`;

    cars.forEach(car => {
      if (car.id === undefined) return;
    
      const card = new CarCard(
        car.id,
        car.name,
        car.color,
        async (deletedElement) => {
          const offset = deletedElement.offsetHeight;
          await renderCarList(offset);
        },
        async (id, time, sessionId) => {
          if (
            isWinnerBlockedByResize() ||
            winnerAnnounced ||
            !modalAllowed ||
            sessionId !== currentRaceSessionId
          ) return;
    
          winnerAnnounced = true;
          const winnerCar = cars.find(car => car.id === id);
          if (!winnerCar || winnerCar.id === undefined) return;
    
          showWinnerModal(winnerCar.name, time);
    
          const existing = await getWinner(winnerCar.id);
          if (!existing) {
            await createWinner({ id: winnerCar.id, wins: 1, time });
          } else {
            await updateWinner({
              id: winnerCar.id,
              wins: existing.wins + 1,
              time: Math.min(existing.time, time),
            });
          }
    
          const updater = getWinnersUpdater();
          if (typeof updater === 'function') await updater();
        }
      );
    
      carCards.push(card);
      carList.appendChild(card.render());
    });
    

    prevBtn.disabled = currentPage === 1;
    nextBtn.disabled = currentPage >= Math.ceil(totalCars / carsPerPage);

    window.scrollTo({ top: targetScrollY });
  };

  const form = createCarForm(async () => {
    await renderCarList();
  });

  type CarFormWithEdit = HTMLElement & {
    setEditingCar: (id: number, name: string, color: string) => void;
  };

  const editing = getEditingCarState();
  if (editing) {
    const formWithEdit = form as CarFormWithEdit;
    formWithEdit.setEditingCar(editing.id, editing.name, editing.color);
  }

  prevBtn.addEventListener('click', async () => {
    if (currentPage > 1) {
      currentPage--;
      await renderCarList();
    }
  });

  nextBtn.addEventListener('click', async () => {
    if (currentPage < Math.ceil(totalCars / carsPerPage)) {
      currentPage++;
      await renderCarList();
    }
  });

  const raceButton = document.createElement('button');
  raceButton.textContent = 'Race All';
  raceButton.className = 'race-button';

  function updateRaceAllAvailability() {
  const someStarted = carCards.some(card => card.wasStarted());
  raceButton.disabled = someStarted;
}

  const resetButton = document.createElement('button');
  resetButton.textContent = 'Reset All';
  resetButton.className = 'reset-button';

  const generateBtn = document.createElement('button');
  generateBtn.textContent = 'Generate 100 Cars';
  generateBtn.className = 'generate-button';

  raceButton.addEventListener('click', async () => {
    raceButton.disabled = true;
    raceInterrupted = false;
    winnerAnnounced = false;
  
    // 1. Сброс всех машин
    await Promise.all(
      carCards.map(async (card) => {
        try {
          await stopEngine(card.getId());
          card.resetPosition();
        } catch (err) {
          console.error(`Error when resetting machine ${card.getId()}:`, err);
        }
      })
    );
  
    // 2. Старт новой гонки
    currentRaceSessionId++;
    const sessionId = currentRaceSessionId;
  
    const raceCards = carCards.filter(card => !card.isRunning() && !card.isFrozen());
  
    await Promise.all(
      raceCards.map(async (card) => {
        await card.startCar(sessionId);
      })
    );
  
    // 3. После завершения гонки снова разрешаем использование кнопки
    updateRaceAllAvailability();
  });

  resetButton.addEventListener('click', async () => {
    resetButton.disabled = true;
  
    await Promise.all(
      carCards.map(async (card) => {
        try {
          await stopEngine(card.getId());
          card.resetPosition();
        } catch (err) {
          console.error(`Error when resetting machine ${card.getId()}:`, err);
        }
      })
    );
  
    modalAllowed = true;
    updateRaceAllAvailability();
    resetButton.disabled = false;
  });

  generateBtn.addEventListener('click', async () => {
    generateBtn.disabled = true;

    const promises = [];
    for (let i = 0; i < 100; i++) {
      const name = generateRandomName();
      const color = generateRandomColor();
      promises.push(createCar({ name, color }));
    }

    await Promise.all(promises);
    await renderCarList();
    generateBtn.disabled = false;
  });

  await renderCarList();

  container.appendChild(title);
  container.appendChild(form);
  container.appendChild(carList);
  container.appendChild(paginationControls);
  container.appendChild(raceButton);
  container.appendChild(resetButton);
  container.appendChild(generateBtn);

  return container;
}

let _getGaragePage: (() => number) | null = null;
export function getGaragePage() {
  return _getGaragePage?.() ?? 1;
}

export function updateRaceAllAvailability() {
  const raceButton = document.querySelector('.race-button') as HTMLButtonElement;
  if (!raceButton) return;
  const someStarted = carCards.some(card => card.wasStarted());
  raceButton.disabled = someStarted;
}


