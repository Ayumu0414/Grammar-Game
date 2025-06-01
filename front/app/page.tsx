"use client";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import "../styles/globals.css";

export default function HomePage() {
  const router = useRouter();
  const [isMuted, setIsMuted] = useState(true);
  const clickSoundRef = useRef<HTMLAudioElement | null>(null);

  // 初回クリック時にBGMを再生（ブラウザ制限対策）
  const enableBGM = () => {
    const bgm = document.getElementById("bgm") as HTMLAudioElement | null;
    if (bgm && isMuted === false) {
      bgm.play().catch(() => {});
    }
  };

  // 効果音再生
  const playClickSound = () => {
    if (clickSoundRef.current) {
      clickSoundRef.current.currentTime = 0;
      clickSoundRef.current.play().catch(() => {});
    }
  };

  const handleStart = () => {
    playClickSound();
    enableBGM();
    router.push("/join-room");
  };

  const handleRules = () => {
    playClickSound();
    enableBGM();
    router.push("/rules");
  };

  const toggleMute = () => {
    const bgm = document.getElementById("bgm") as HTMLAudioElement | null;
    if (bgm) {
      if (isMuted) {
        bgm.play().catch(() => {});
      } else {
        bgm.pause();
        bgm.currentTime = 0;
      }
    }
    setIsMuted(!isMuted);
  };

  return (
    <div
      style={{
        height: "100vh",
        width: "100%",
        position: "relative",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "sans-serif",
        overflow: "hidden",
      }}
    >
      {/* 背景画像 */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundImage: "url('/image/文法ゲームトップ背景.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          opacity: 0.7,
          zIndex: -1,
        }}
      />

      {/* 効果音 */}
      <audio ref={clickSoundRef} src="/sound/決定ボタンを押す31.mp3" preload="auto" />

      {/* タイトル画像 */}
      <img
        src="/image/文法ゲームタイトル.png"
        alt="文法ゲームタイトル画像"
        style={{ width: "80%", maxWidth: "600px" }}
      />

      {/* スタートボタン */}
      <img
        src="/image/ゲームスタート.png"
        alt="ゲームスタートボタン"
        onClick={handleStart}
        className="hover-scale"
        style={{
          width: "260px",
          maxWidth: "80%",
          cursor: "pointer",
          marginTop: "-60px",
          marginBottom: "20px",
        }}
      />

      {/* ルールボタン */}
      <img
        src="/image/ルール.png"
        alt="ルールボタン"
        onClick={handleRules}
        className="hover-scale"
        style={{
          width: "300px",
          maxWidth: "80%",
          cursor: "pointer",
          marginTop: "-70px",
        }}
      />

      {/* 女の子キャラクター */}
      <img
        src="/image/文法ゲームの女の子.png"
        alt="キャラクター"
        className="float-character"
        style={{
          position: "absolute",
          bottom: "0px",
          right: "10px",
          height: "83%",
          animation: "float 2s ease-in-out infinite",
          pointerEvents: "none",
          zIndex: 1,
        }}
      />

      {/* 男の子キャラクター */}
      <img
        src="/image/文法ゲームの男の子.png"
        alt="キャラクター"
        className="float-character"
        style={{
          position: "absolute",
          bottom: "0px",
          left: "10px",
          height: "80%",
          animation: "float 2s ease-in-out infinite",
          pointerEvents: "none",
          zIndex: 1,
        }}
      />

      {/* 音声オン/オフボタン */}
      <img
        src={isMuted ? "/image/音声オフ.png" : "/image/音声オン.png"}
        alt={isMuted ? "音声オフ" : "音声オン"}
        onClick={toggleMute}
        style={{
          position: "absolute",
          top: "20px",
          right: "20px",
          width: "60px",
          height: "60px",
          cursor: "pointer",
          zIndex: 10,
        }}
      />
    </div>
  );
}

