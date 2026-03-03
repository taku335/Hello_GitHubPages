import { Link } from 'react-router-dom';
import { useMemo, useState } from 'react';

function ProductCalculator({ title }) {
  const [price, setPrice] = useState('');
  const [weight, setWeight] = useState('');

  const unitPrice = useMemo(() => {
    const parsedPrice = Number.parseFloat(price);
    const parsedWeight = Number.parseFloat(weight);
    if (!Number.isFinite(parsedPrice) || !Number.isFinite(parsedWeight) || parsedWeight === 0) {
      return '';
    }
    return `${(parsedPrice / parsedWeight).toFixed(2)} 円/g`;
  }, [price, weight]);

  return (
    <section className="calc-product">
      <h2>{title}</h2>
      <label>
        金額（円）:
        <input type="number" value={price} onChange={(event) => setPrice(event.target.value)} />
      </label>
      <label>
        重さ（g）:
        <input type="number" value={weight} onChange={(event) => setWeight(event.target.value)} />
      </label>
      <div className="calc-result">{unitPrice}</div>
    </section>
  );
}

export default function CalcPage() {
  return (
    <div className="site-shell simple-page">
      <header className="site-header">
        <h1>単価計算</h1>
        <nav className="site-nav">
          <Link to="/">トップに戻る</Link>
        </nav>
      </header>
      <main className="page-main">
        <div className="calc-grid">
          <ProductCalculator title="商品1" />
          <ProductCalculator title="商品2" />
        </div>
      </main>
    </div>
  );
}
