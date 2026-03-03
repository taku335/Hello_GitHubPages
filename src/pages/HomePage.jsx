import { Link } from 'react-router-dom';

const baseUrl = import.meta.env.BASE_URL;

const products = [
  {
    title: 'くまちゃんパン',
    image: `${baseUrl}images/bear_bread.svg`,
    alt: 'くまちゃんパン',
    description: 'ころんとしたお顔がかわいい、フィンちゃん特製の人気パン！',
  },
  {
    title: 'タツノオトシゴパン',
    image: `${baseUrl}images/seahorse.png`,
    alt: 'タツノオトシゴパン',
    description: 'タツノオトシゴミッキーのお気に入り、新発売のパンです！',
  },
  {
    title: 'キリンさんパン',
    image: `${baseUrl}images/giraffe.png`,
    alt: 'キリンさんパン',
    description: 'のっぽなキリンさんがモチーフの、サクサク生地が自慢のパン！',
  },
  {
    title: 'しまうまパン',
    image: `${baseUrl}images/zebra.png`,
    alt: 'しまうまパン',
    description: 'しましま模様がおしゃれな、見た目も味も楽しいパン！',
  },
];

export default function HomePage() {
  return (
    <div className="site-shell">
      <header className="site-header">
        <h1>フィンちゃんのパン屋さん</h1>
        <p>ふわふわでやさしい味のパンをどうぞ</p>
        <nav className="site-nav">
          <Link to="/profile">ふぃんちゃん店長の自己紹介</Link>
          <Link to="/calc">単価計算</Link>
          <Link to="/map">ルート検索</Link>
          <Link to="/form">入力フォーム</Link>
          <Link to="/sound">サウンド</Link>
        </nav>
      </header>

      <section className="hero">
        <img src={`${baseUrl}images/finn_bakery.svg`} alt="フィンちゃんとくまちゃんパン" width="300" height="300" />
      </section>

      <section className="friend-section">
        <h2>お友達紹介</h2>
        <p>フィンちゃんのお友達、タツノオトシゴのタツノオトシゴミッキーが遊びに来てくれたよ！</p>
      </section>

      <section className="menu-section">
        <h2>いちおしメニュー</h2>
        <div className="products-grid">
          {products.map((product) => (
            <article className="product-card" key={product.title}>
              <h3>{product.title}</h3>
              <img src={product.image} alt={product.alt} width="200" height="200" />
              <p>{product.description}</p>
            </article>
          ))}
        </div>
      </section>

      <footer className="site-footer">© 2024 フィンちゃんのパン屋さん</footer>
    </div>
  );
}
