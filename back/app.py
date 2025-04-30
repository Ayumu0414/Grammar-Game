from flask import Flask, request, jsonify # type: ignore
from flask_cors import CORS # type: ignore
import sqlite3

def get_db_connection():
    conn = sqlite3.connect("grammar_game.db")
    conn.row_factory = sqlite3.Row 
    return conn


app = Flask(__name__)
CORS(app)


# メモリ上で部屋データを保存する辞書
rooms = {}

# トップページエンドポイント
@app.route("/", methods=["GET"])
def index():
    return "Welcome to the Grammar Game API!"

# 部屋を作成するエンドポイント# 使用済みの担当パートを取得するAPI
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


# 部屋に参加するやつ エンドポイント
@app.route("/join-room", methods=["POST"])
def join_room():
    data = request.get_json(force=True, silent=True) 
    print("受け取ったデータ:", data)

    room_id = data.get("room_id")
    player_name = data.get("player_name")
    part = data.get("part")

    print("room_id:", room_id)
    print("player_name:", player_name)
    print("part:", part)

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


sentences = []


@app.route("/submit-sentence", methods=["POST"])
def submit_sentence():
    data = request.json
    who = data.get("who")
    where = data.get("where")
    with_whom = data.get("withWhom")
    what_did = data.get("whatDid")
    
    if not (who and where and with_whom and what_did ):
        return jsonify({"success":False, "error": "すべての項目を入力してください。"})
    
    print(f"文が送信されました:{who}{where}{with_whom}{what_did}")
    
    return jsonify({"success":True})

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
        print("データベースエラー", e)
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
        return jsonify({"error": str(e)}), 500










#最後に書くやつ
if __name__ == "__main__":
    app.run(debug=True)



