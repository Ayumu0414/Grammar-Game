import "../styles/globals.css";

export const metadata = {
  title: "文法ゲーム",
  description: "みんなで文を作って楽しもう！",
};

export default function RootLayout({children,}: {children: React.ReactNode;}) {
  return (
    <html lang="ja">
      <head>
        {/* ✅ Google Fonts の読み込み */}
        <link
          href="https://fonts.googleapis.com/css2?family=Kiwi+Maru&display=swap"
          rel="stylesheet"
        />
      </head>
      <body style={{ margin: 0, overflow: "hidden" }}>
        {/* 🎵 アプリ全体で共有するBGM */}
        <audio id="bgm" src="/sound/pugtoosanpo.mp3" loop preload="auto" />
        {children}
      </body>
    </html>
  );
}


