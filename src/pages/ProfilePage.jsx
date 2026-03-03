import { Link } from 'react-router-dom';

export default function ProfilePage() {
  return (
    <div className="site-shell simple-page">
      <header className="site-header compact">
        <h1>ふぃんちゃん店長の自己紹介</h1>
      </header>
      <main className="page-main">
        <dl className="profile-list">
          <dt>名前</dt>
          <dd>ふぃんちゃん</dd>
          <dt>好きなパン</dt>
          <dd>焼きたてのクロワッサン</dd>
          <dt>趣味</dt>
          <dd>新しいパンのレシピ作りと絵本集め</dd>
          <dt>一言</dt>
          <dd>毎日みんなを笑顔にするパンを焼いています。ぜひ遊びに来てね！</dd>
        </dl>
        <p>
          <Link to="/">トップページへ戻る</Link>
        </p>
      </main>
    </div>
  );
}
