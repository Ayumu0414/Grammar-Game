from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
import os
from dotenv import load_dotenv
from openai import OpenAI 

load_dotenv()

# DB接続
def get_db_connection():
    conn = sqlite3.connect("grammar_game.db")
    conn.row_factory = sqlite3.Row
    return conn

# FlaskとOpenAIの初期化
app = Flask(__name__)
CORS(app)
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# 部屋の一時保存
rooms = {}

# -----------------------------------
# APIエンドポイントたち
# -----------------------------------

@app.route("/", methods=["GET"])
def index():
    return "Welcome to the Grammar Game API!"

@app.route("/used-parts", methods=["GET"])
def used_parts():
    room_id = request.args.get("room_id")
    if not room_id:
        return jsonify({"error": "room_idが必要です"}), 400

    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT part FROM players WHERE room_id = ?", (room_id,))
        parts = [row["part"] for row in cursor.fetchall()]
        conn.close()
        return jsonify({"used_parts": parts})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/create-room", methods=["POST"])
def create_room():
    room_id = len(rooms) + 1
    rooms[room_id] = {"players": []}
    return jsonify({"room_id": room_id, "message": "部屋が作成されました！"})

@app.route("/join-room", methods=["POST"])
def join_room():
    data = request.get_json(force=True, silent=True)
    room_id = data.get("room_id")
    player_name = data.get("player_name")
    part = data.get("part")

    if not all([room_id, player_name, part]):
        return jsonify({"error": "全ての情報を入力してください。"}), 400

    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO players (name, part, room_id)
            VALUES (?, ?, ?)
        """, (player_name, part, room_id))
        conn.commit()
        conn.close()
        return jsonify({"message": "部屋に参加しました！"})
    except Exception as e:
        print("DBエラー:", e)
        return jsonify({"error": "サーバーエラーが発生しました。"}), 500

@app.route("/submit-sentence", methods=["POST"])
def submit_sentence():
    data = request.json
    who = data.get("who")
    where = data.get("where")
    with_whom = data.get("withWhom")
    what_did = data.get("whatDid")

    if not (who and where and with_whom and what_did):
        return jsonify({"success": False, "error": "すべての項目を入力してください。"})

    print(f"文が送信されました: {who}{where}{with_whom}{what_did}")
    return jsonify({"success": True})

@app.route("/submit-phrases", methods=["POST"])
def submit_phrases():
    data = request.json
    room_id = data.get("room_id")
    part = data.get("part")
    phrases = data.get("phrases")

    if not all([room_id, part, phrases]):
        return jsonify({"success": False, "error": "データが足りません"}), 400

    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS phrases (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                room_id INTEGER NOT NULL,
                part TEXT NOT NULL,
                text TEXT NOT NULL
            )
        """)

        for phrase in phrases:
            if phrase.strip():
                cursor.execute("""
                    INSERT INTO phrases (room_id, part, text)
                    VALUES (?, ?, ?)
                """, (room_id, part, phrase.strip()))

        conn.commit()
        conn.close()
        print("登録完了: ", phrases)
        return jsonify({"success": True})
    except Exception as e:
        print("データベースエラー:", e)
        return jsonify({"success": False, "error": str(e)}), 500

@app.route("/generate-sentence", methods=["GET"])
def generate_sentence():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        result = {}

        for part in ["who", "where", "with_whom", "what_did"]:
            cursor.execute("""
                SELECT text FROM phrases
                WHERE part = ?
                ORDER BY RANDOM() LIMIT 1
            """, (part,))
            row = cursor.fetchone()
            result[part] = row["text"] if row else "(未入力)"

        conn.close()
        return jsonify({"success": True, "sentence": result})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route("/players", methods=["GET"])
def get_players():
    room_id = request.args.get("room_id")
    if not room_id:
        return jsonify({"error": "room_idが必要です"}), 400

    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT name, part FROM players WHERE room_id = ?", (room_id,))
        players = [{"name": row["name"], "part": row["part"]} for row in cursor.fetchall()]
        conn.close()
        return jsonify({"players": players})
    except Exception as e:
        print("DBエラー:", e)
        return jsonify({"error": str(e)}), 500

@app.route("/generate-comments", methods=["POST"])
def generate_comments():
    data = request.get_json()
    sentence = data.get("sentence")

    if not sentence:
        return jsonify({"error": "sentenceが必要です"}), 400

    prompt = f"""
以下の文章に対して、4人のキャラクターが一言コメントします。
出力形式は以下に厳密に従ってください（JSON形式）
以下の形式を厳密に守ってください。JSON配列の文字列として出力してください。Pythonのjson.loadsでパースできる形式にしてください。

[
    {{ "name": "男の子", "image": "/image/元気な男の子.png", "text": "コメント内容" }},
    {{ "name": "天然", "image": "/image/天然な女の子.png", "text": "コメント内容" }},
    {{ "name": "中二病", "image": "/image/中二病.png", "text": "コメント内容" }},
    {{ "name": "女子高校生", "image": "/image/女子高校生.png", "text": "コメント内容" }}
]

文：{sentence}
"""
    
    try:
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[{ "role": "user", "content": prompt }],
            temperature=1.2,
        )
        result_text = response.choices[0].message.content
        print("GPTの出力:", result_text)
        
        import json, re
        json_str = re.search(r"\[.*\]", result_text, re.DOTALL)
        parsed = json.loads(json_str.group()) if json_str else []

        return jsonify({ "comments": parsed })

    except Exception as e:
        print("GPT出力異常:", e)
    return jsonify({
        "comments": [
            {
                "name": "男の子",
                "image": "/image/元気な男の子.png",
                "text": "コメントの生成に失敗しちゃった！"
            }
        ]
    }), 200


# 最後に起動
if __name__ == "__main__":
    app.run(debug=True)
