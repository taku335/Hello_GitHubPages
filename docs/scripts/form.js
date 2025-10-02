import { validateForm } from './validation.js';

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('convert-form');
  const result = document.getElementById('result');

  if (!form || !result) {
    return;
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const values = Object.fromEntries(formData.entries());
    const validation = validateForm(values);

    clearErrors(form);

    if (!validation.valid) {
      displayErrors(form, validation.results);
      result.textContent = '';
      result.dataset.state = 'error';
      return;
    }

    const payload = {
      name: validation.results.name.value,
      num: validation.results.num.value,
      date: validation.results.date.value,
    };

    result.textContent = JSON.stringify(payload, null, 2);
    result.dataset.state = 'success';
  });
});

function clearErrors(form) {
  form.querySelectorAll('.error').forEach((element) => {
    element.textContent = '';
  });
}

function displayErrors(form, results) {
  Object.entries(results).forEach(([key, outcome]) => {
    if (outcome.valid) {
      return;
    }
    const errorElement = form.querySelector(`.error[data-error-for="${key}"]`);
    if (errorElement) {
      errorElement.textContent = outcome.error;
    }
  });
}
