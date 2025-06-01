"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";

export default function InputPartPage() {
  const { part } = useParams();
  const router = useRouter();
  const [phrases, setPhrases] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [playerName, setPlayerName] = useState<string | null>(null);
  const [roomId, setRoomId] = useState<number | null>(null);
  const submitSoundRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const name = localStorage.getItem("player_name");
    const rid = localStorage.getItem("room_id");
    if (!name || !rid) {
      alert("部屋に参加してから入力してください！");
      router.push("/join-room");
      return;
    }
    setPlayerName(name);
    setRoomId(Number(rid));
  }, [router]);

  const handleAdd = () => {
    const trimmed = inputValue.trim();
    if (trimmed && phrases.length < 10) {
      setPhrases([...phrases, trimmed]);
      setInputValue("");
    }
  };

  const handleRemove = (index: number) => {
    const newPhrases = [...phrases];
    newPhrases.splice(index, 1);
    setPhrases(newPhrases);
  };

  const handleSubmit = async () => {
    if (!roomId || !part) return;

    if (submitSoundRef.current) {
      submitSoundRef.current.currentTime = 0;
      submitSoundRef.current.play().catch(() => {});
    }

    const response = await fetch("http://127.0.0.1:5000/submit-phrases", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        part,
        phrases,
        room_id: roomId,
        player_name: playerName,
      }),
    });

    const data = await response.json();
    if (data.success) {
      alert("送信完了！");
      router.push("/generate");
    } else {
      alert("送信に失敗しました");
    }
  };

  return (
    <div style={{ maxWidth: "700px", margin: "0 auto", padding: "30px", textAlign: "center" }}>
      <audio ref={submitSoundRef} src="/sound/決定ボタンを押す39.mp3" preload="auto" />

      {/* 背景画像 */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundImage: "url('/image/文入力背景.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          opacity: 0.7,
          zIndex: -1,
        }}
      />
      <h1 style={{ fontSize: "2rem", marginBottom: "20px" }}>
        「{part}」の言葉を入力（最大10個）
      </h1>

      {/* 入力フィールドと追加ボタン */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="言葉を入力"
          style={{
            flex: 1,
            padding: "10px",
            fontSize: "16px",
            border: "1px solid #ccc",
            borderRadius: "6px",
          }}
        />
        <button
          onClick={handleAdd}
          disabled={!inputValue.trim() || phrases.length >= 10}
          style={{
            padding: "10px 20px",
            fontSize: "16px",
            backgroundColor: "#2ecc71",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          ＋追加
        </button>
      </div>

      {/* フレーズリスト（2列表示） */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "10px",
          marginBottom: "30px",
        }}
      >
        {phrases.map((phrase, index) => (
          <div
            key={index}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              background: "#f9f9f9",
              padding: "8px 12px",
              borderRadius: "6px",
            }}
          >
            <span>{index + 1}. {phrase}</span>
            <button
              onClick={() => handleRemove(index)}
              style={{
                background: "transparent",
                border: "none",
                color: "#e74c3c",
                fontWeight: "bold",
                cursor: "pointer",
                fontSize: "18px",
                marginLeft: "10px",
              }}
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      {/* 送信ボタン */}
      <button
        onClick={handleSubmit}
        disabled={phrases.length === 0}
        style={{
          padding: "12px 30px",
          fontSize: "18px",
          backgroundColor: "#000",
          color: "#fff",
          border: "none",
          borderRadius: "10px",
          cursor: "pointer",
        }}
      >
        送信する
      </button>
    </div>
  );
}
