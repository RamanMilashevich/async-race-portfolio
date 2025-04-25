import { createCar, updateCar } from '../../api/api';

export function createCarForm(onChange: () => void): HTMLElement {
  interface EditableForm extends HTMLDivElement {
    setEditingCar: (id: number, name: string, color: string) => void;
  }
  
  const form = document.createElement('div') as EditableForm;
  form.className = 'car-form';

  const createInput = document.createElement('input');
  createInput.type = 'text';
  createInput.placeholder = 'Car name';

  const createColor = document.createElement('input');
  createColor.type = 'color';

  const createBtn = document.createElement('button');
  createBtn.textContent = 'Create';

  createBtn.addEventListener('click', async () => {
    if (!createInput.value) return;
    await createCar({ name: createInput.value, color: createColor.value });
    createInput.value = '';
    await onChange();
  });

  const updateInput = document.createElement('input');
  updateInput.type = 'text';
  updateInput.disabled = true;

  const updateColor = document.createElement('input');
  updateColor.type = 'color';
  updateColor.disabled = true;

  const updateBtn = document.createElement('button');
  updateBtn.textContent = 'Update';
  updateBtn.disabled = true;

  let editingCarId: number | null = null;

  form.setEditingCar = (id: number, name: string, color: string) => {
    editingCarId = id;
    updateInput.value = name;
    updateColor.value = color;
    updateInput.disabled = false;
    updateColor.disabled = false;
    updateBtn.disabled = false;
  };

  updateBtn.addEventListener('click', async () => {
    if (!editingCarId) return;

    await updateCar(editingCarId, {
      name: updateInput.value,
      color: updateColor.value,
    });

    editingCarId = null;
    updateInput.value = '';
    updateColor.value = '#000000';
    updateInput.disabled = true;
    updateColor.disabled = true;
    updateBtn.disabled = true;

    await onChange();
  });

  form.append(
    createInput,
    createColor,
    createBtn,
    updateInput,
    updateColor,
    updateBtn
  );

  return form;
}
