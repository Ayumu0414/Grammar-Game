"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function JoinRoomPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [selectedPart, setSelectedPart] = useState("");
  const [roomId, setRoomId] = useState(1); 

  const parts = ["who", "where", "with_whom", "what_did"];

  const handleJoin = () => {
    if (!name || !selectedPart) {
      alert("名前とパートを選んでください！");
      return;
    }

    // localStorage に保存
    localStorage.setItem("player_name", name);
    localStorage.setItem("player_part", selectedPart);
    localStorage.setItem("room_id", roomId.toString());

    // 担当パートの入力画面へ遷移
    router.push(`/input/${selectedPart}`);
  };

  return (
    <div style={{ padding: "40px", textAlign: "center" }}>
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
      <h1>ニックネームを入力</h1>

      <div style={{ marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="あなたの名前"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ padding: "10px", fontSize: "16px", width: "300px" }}
        />
      </div>

      <div style={{ marginBottom: "20px" }}>
        <p>文のパートを選んでください</p>
        {parts.map((part) => (
          <button
            key={part}
            onClick={() => setSelectedPart(part)}
            style={{
              margin: "5px",
              padding: "10px 20px",
              fontSize: "16px",
              backgroundColor: selectedPart === part ? "#2ecc71" : "#bdc3c7",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontFamily: '"Kiwi Maru", serif',
            }}
          >
            {part}
          </button>
        ))}
      </div>

      <button
        onClick={handleJoin}
        style={{
          padding: "12px 30px",
          fontSize: "18px",
          backgroundColor: "#000",
          color: "#fff",
          border: "none",
          borderRadius: "10px",
          cursor: "pointer",
          fontFamily: '"Kiwi Maru", serif',
        }}
      >
        ✅ 参加する
      </button>
    </div>
  );
}

