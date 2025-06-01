"use client";
import { useRouter } from "next/navigation";

export default function RulesPage() {
  const router = useRouter();

  const handleBack = () => {
    router.push("/");
  };

  return (
    <div style={{ position: "relative", minHeight: "100vh", overflow: "hidden" }}>
      {/* メイン内容 */}
      <div
        style={{
          padding: "40px",
          maxWidth: "700px",
          margin: "auto",
          position: "relative",
          zIndex: 1,
        }}
      >
        <h1 style={{ fontSize: "2rem", marginBottom: "20px" }}>✐ 文法ゲームのルール</h1>
        <ol style={{ lineHeight: "1.8", fontSize: "1.1rem", paddingLeft: "20px" }}>
          <li>2〜4人で一緒に遊びます。(開発中)</li>
          <li>
            ゲーム開始後、各プレイヤーは担当パートを1つ選びます。
            <ul style={{ marginTop: "10px", paddingLeft: "20px" }}>
              <li>誰が（例：ドラえもんが）</li>
              <li>どこで（例：学校で）</li>
              <li>誰と（例：犬と）</li>
              <li>何をした（例：歌った）</li>
            </ul>
          </li>
          <li>選んだパートに対して、10個の文の成分を自由に入力します。<br />
              例：ドラえもんが、しずかちゃんが…など、担当が主語ならば主語を10個考える。</li>
          
          <li>全員の文がそろったら、ランダムに1文ずつ組み合わせて表示されます。</li>
          <li>できあがったへんてこな文を楽しみましょう！</li>
        </ol>

        {/* 戻るボタン */}
        <div style={{ textAlign: "center", marginTop: "40px" }}>
          <button
            onClick={handleBack}
            style={{
              padding: "10px 25px",
              fontSize: "16px",
              backgroundColor: "#000",
              color: "#fff",
              border: "none",
              borderRadius: "10px",
              cursor: "pointer",
              marginTop: "-20px",
              fontFamily: '"Kiwi Maru", serif',
            }}
          >
            ← トップページに戻る
          </button>
        </div>
      </div>

      {/* 背景画像 */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundImage: "url('/image/ルール背景.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          opacity: 0.7,
          zIndex: 0,
        }}
      />
    </div>
  );
}

  