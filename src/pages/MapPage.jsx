import { Link } from 'react-router-dom';
import { useState } from 'react';

const defaultMap = 'https://maps.google.com/maps?q=%E6%9D%B1%E4%BA%AC%E9%A7%85&output=embed';

export default function MapPage() {
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [mapSrc, setMapSrc] = useState(defaultMap);

  const handleSubmit = (event) => {
    event.preventDefault();
    const origin = encodeURIComponent(start.trim());
    const destination = encodeURIComponent(end.trim());
    if (!origin || !destination) {
      return;
    }
    setMapSrc(`https://maps.google.com/maps?saddr=${origin}&daddr=${destination}&output=embed`);
  };

  return (
    <div className="site-shell simple-page">
      <header className="site-header">
        <h1>ルート検索</h1>
        <nav className="site-nav">
          <Link to="/">トップに戻る</Link>
        </nav>
      </header>
      <main className="page-main">
        <form className="route-form" onSubmit={handleSubmit}>
          <input type="text" placeholder="出発地" value={start} onChange={(event) => setStart(event.target.value)} required />
          <input type="text" placeholder="目的地" value={end} onChange={(event) => setEnd(event.target.value)} required />
          <button type="submit">検索</button>
        </form>
        <iframe
          className="route-map"
          title="地図"
          src={mapSrc}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </main>
    </div>
  );
}
