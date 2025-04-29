import sqlite3

conn = sqlite3.connect("grammar_game.db")
cursor = conn.cursor()

# フレーズテーブル（誰が・どこで・誰と・何をした）
cursor.execute("""
CREATE TABLE IF NOT EXISTS phrases (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    room_id INTEGER NOT NULL,
    part TEXT NOT NULL,
    text TEXT NOT NULL
)
""")

# プレイヤーテーブル（参加者情報）
cursor.execute("""
CREATE TABLE IF NOT EXISTS players (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    part TEXT NOT NULL,
    room_id INTEGER NOT NULL
)
""")

conn.commit()
conn.close()
print("✅ データベースの初期化が完了しました。")
