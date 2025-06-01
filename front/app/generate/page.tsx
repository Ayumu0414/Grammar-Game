"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

type CommentItem = {
  name: string;
  image: string;
  text: string;
};

export default function GeneratePage() {
  const [sentence, setSentence] = useState("");
  const [showSentence, setShowSentence] = useState(false);
  const [loading, setLoading] = useState(false);
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [typedText, setTypedText] = useState("");
  const [charIndex, setCharIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const router = useRouter();

  // タイピングエフェクト
  useEffect(() => {
    if (comments.length === 0 || currentIndex >= comments.length) return;

    const fullText = comments[currentIndex].text;
    setTypedText("");
    setCharIndex(0);
    setIsTyping(true);

    const interval = setInterval(() => {
      setCharIndex((prev) => {
        const next = prev + 1;
        if (next > fullText.length) {
          clearInterval(interval);
          setIsTyping(false);
        }
        return next;
      });
    }, 40);

    return () => clearInterval(interval);
  }, [comments, currentIndex]);

  useEffect(() => {
    if (comments.length === 0 || currentIndex >= comments.length) return;
    const fullText = comments[currentIndex].text;
    setTypedText(fullText.slice(0, charIndex));
  }, [charIndex]);

  // 文とコメント生成
  const handleGenerate = async () => {
    setLoading(true);
    setShowSentence(false);
    setComments([]);
    setTypedText("");
    setCurrentIndex(0);

    try {
      const response = await fetch("http://127.0.0.1:5000/generate-sentence");
      const data = await response.json();

      if (data.success) {
        const { who, where, with_whom, what_did } = data.sentence;
        const fullSentence = `${who} ${where} ${with_whom} ${what_did}`;
        setSentence(fullSentence);

        setTimeout(() => {
          setShowSentence(true);
          if (audioRef.current) {
            audioRef.current.currentTime = 0;
            audioRef.current.play().catch(() => {});
          }
        }, 300);

        const commentRes = await fetch("http://127.0.0.1:5000/generate-comments", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ sentence: fullSentence }),
        });

        const commentData = await commentRes.json();
        setComments(commentData.comments || []);
      }
    } catch (err) {
      console.error("通信エラー:", err);
    }

    setLoading(false);
  };

  const handleNext = () => {
    if (currentIndex < comments.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  return (
    <div
      style={{
        textAlign: "center",
        padding: "40px 20px",
        backgroundImage: "url('/image/文生成背景.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundColor: "rgba(255, 255, 255, 0.5)",
        backgroundBlendMode: "lighten",
        minHeight: "100vh",
      }}
    >
      <audio ref={audioRef} src="/sound/ボヨン.mp3" preload="auto" />

      <h1 style={{ color: "#000", fontWeight: "bold", fontSize: "32px" }}>どんな文が出来上がるかな？</h1>

      <button
        onClick={handleGenerate}
        disabled={loading}
        className="button-float"
        style={{
          padding: "10px 20px",
          fontSize: "18px",
          cursor: "pointer",
          backgroundColor: "#000",
          color: "white",
          border: "none",
          borderRadius: "8px",
          marginTop: "20px",
        }}
      >
        {loading ? "ちょっとまってね..." : "文をつくる"}
      </button>

      {showSentence && (
        <p
          style={{
            marginTop: "30px",
            fontSize: "28px",
            fontWeight: "bold",
            transition: "all 0.6s ease-out",
          }}
        >
          {sentence}
        </p>
      )}

      {showSentence && comments[currentIndex] && (
        <div className="character-comment-wrapper">
          <img
            src={comments[currentIndex].image}
            alt={comments[currentIndex].name}
            className="character-img"
          />
          <div className="comment-box">
            <span>{typedText}</span>
          </div>
        </div>
      )}

      {!isTyping && currentIndex < comments.length - 1 && (
        <button
          onClick={handleNext}
          className="button-float"
          style={{
            marginTop: "20px",
            padding: "8px 16px",
            fontSize: "16px",
            backgroundColor: "#3498db",
            color: "white",
            border: "none",
            borderRadius: "6px",
          }}
        >
          次へ
        </button>
      )}

      {!isTyping && currentIndex === comments.length - 1 && (
        <button
          onClick={() => router.push("/")}
          className="button-float"
          style={{
            marginTop: "20px",
            padding: "8px 16px",
            fontSize: "16px",
            backgroundColor: "#3498db",
            color: "white",
            border: "none",
            borderRadius: "6px",
          }}
        >
          タイトルに戻る
        </button>
      )}
    </div>
  );
}
