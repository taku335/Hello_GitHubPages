import { Link } from 'react-router-dom';
import { useState } from 'react';
import { validateForm } from '../utils/validation';

const initialValues = {
  name: '',
  num: '',
  date: '',
};

const initialErrors = {
  name: '',
  num: '',
  date: '',
};

export default function FormPage() {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState(initialErrors);
  const [result, setResult] = useState('');

  const handleChange = (event) => {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const validation = validateForm(values);

    if (!validation.valid) {
      setErrors({
        name: validation.results.name.error ?? '',
        num: validation.results.num.error ?? '',
        date: validation.results.date.error ?? '',
      });
      setResult('');
      return;
    }

    setErrors(initialErrors);
    const payload = {
      name: validation.results.name.value,
      num: validation.results.num.value,
      date: validation.results.date.value,
    };
    setResult(JSON.stringify(payload, null, 2));
  };

  return (
    <div className="form-page-shell">
      <main className="form-container">
        <h1>入力フォーム</h1>
        <p>各項目に値を入力して「JSONに変換」ボタンを押してください。</p>
        <form noValidate onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="name">名前（日本語）</label>
            <input id="name" name="name" type="text" autoComplete="name" required value={values.name} onChange={handleChange} />
            <p className="error" aria-live="polite">{errors.name}</p>
          </div>

          <div className="field">
            <label htmlFor="num">番号（整数）</label>
            <input
              id="num"
              name="num"
              type="text"
              inputMode="numeric"
              pattern="[0-9]+"
              required
              value={values.num}
              onChange={handleChange}
            />
            <p className="error" aria-live="polite">{errors.num}</p>
          </div>

          <div className="field">
            <label htmlFor="date">日付（YYYY-MM-DD）</label>
            <input
              id="date"
              name="date"
              type="text"
              placeholder="2024-01-01"
              required
              value={values.date}
              onChange={handleChange}
            />
            <p className="error" aria-live="polite">{errors.date}</p>
          </div>

          <button type="submit">JSONに変換</button>
        </form>

        <section aria-live="polite" className="form-result">
          {result ? <pre>{result}</pre> : null}
        </section>

        <p className="form-back-link">
          <Link to="/">トップページへ戻る</Link>
        </p>
      </main>
    </div>
  );
}
