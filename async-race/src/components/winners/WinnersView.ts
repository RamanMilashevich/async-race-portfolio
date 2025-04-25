import { getWinners } from '../../api/winnersApi';
import { getCar } from '../../api/api';
import { carSvgTemplate } from '../../utils/carSvgTemplate';

let currentWinnersPage = 1;
const winnersPerPage = 10;
let sortBy: 'wins' | 'time' = 'wins';
let sortOrder: 'ASC' | 'DESC' = 'DESC';

let _loadPage: (() => Promise<void>) | null = null;
let _setWinnersPage: ((page: number) => void) | null = null;
let _getWinnersPage: (() => number) | null = null;

export function getWinnersUpdater() {
  return _loadPage;
}

export function getWinnersPage() {
  return _getWinnersPage?.() ?? 1;
}

export function setWinnersPage(page: number) {
  _setWinnersPage?.(page);
}

export async function renderWinners(): Promise<HTMLElement> {
  const container = document.createElement('div');
  container.className = 'winners-view';

  const title = document.createElement('h2');
  container.appendChild(title);

  const pagination = document.createElement('div');
  pagination.className = 'pagination';

  const pageIndicator = document.createElement('span');
  pageIndicator.className = 'page-indicator';

  const prevBtn = document.createElement('button');
  prevBtn.textContent = 'Prev';

  const nextBtn = document.createElement('button');
  nextBtn.textContent = 'Next';

  pagination.append(prevBtn, pageIndicator, nextBtn);

  const table = document.createElement('table');
  table.className = 'winners-table';

  const thead = document.createElement('thead');
  thead.innerHTML = `
    <tr>
      <th>#</th>
      <th>Car</th>
      <th>Name</th>
      <th class="sortable" data-sort="wins">Wins</th>
      <th class="sortable" data-sort="time">Best time (s)</th>
    </tr>
  `;
  table.appendChild(thead);

  const tbody = document.createElement('tbody');
  table.appendChild(tbody);

  container.appendChild(pagination);
  container.appendChild(table);

  async function loadPage() {
    console.log('[DEBUG] Winners page loading...');
    tbody.innerHTML = '';
    const { winners, total } = await getWinners(currentWinnersPage, winnersPerPage, sortBy, sortOrder);

    title.textContent = `Winners (${total} total)`;
    pageIndicator.textContent = `Page ${currentWinnersPage} / ${Math.ceil(total / winnersPerPage)}`;
    prevBtn.disabled = currentWinnersPage === 1;
    nextBtn.disabled = currentWinnersPage >= Math.ceil(total / winnersPerPage);

    let position = (currentWinnersPage - 1) * winnersPerPage + 1;

    for (const winner of winners) {
      const car = await getCar(winner.id);
      if (!car || !car.name || !car.color) continue;
    
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${position}</td>
        <td style="width: 60px">${carSvgTemplate.replace('CURRENT_COLOR', car.color)}</td>
        <td>${car.name}</td>
        <td>${winner.wins}</td>
        <td>${winner.time.toFixed(2)}</td>
      `;
      tbody.appendChild(row);
      position++;
    }
  }

  thead.addEventListener('click', async (e) => {
    const target = e.target as HTMLElement;
    if (target.classList.contains('sortable')) {
      const field = target.dataset.sort as 'wins' | 'time';

      if (sortBy === field) {
        sortOrder = sortOrder === 'ASC' ? 'DESC' : 'ASC';
      } else {
        sortBy = field;
        sortOrder = 'ASC';
      }

      await loadPage();
    }
  });

  prevBtn.addEventListener('click', async () => {
    if (currentWinnersPage > 1) {
      currentWinnersPage--;
      await loadPage();
    }
  });

  nextBtn.addEventListener('click', async () => {
    currentWinnersPage++;
    await loadPage();
  });

  await loadPage();
  _loadPage = loadPage;
  _getWinnersPage = () => currentWinnersPage;
  _setWinnersPage = (page: number) => {
    currentWinnersPage = page;
};

  await loadPage();
  return container;
}
