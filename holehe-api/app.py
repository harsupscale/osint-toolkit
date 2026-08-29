from flask import Flask, request, jsonify
from flask_cors import CORS
import holehe
import asyncio

app = Flask(__name__)
CORS(app)

@app.route('/check', methods=['GET'])
def check_email():
    email = request.args.get('email', '').strip()
    if not email or '@' not in email:
        return jsonify({"error": "Valid email required"}), 400

    try:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        results = loop.run_until_complete(holehe.check_email(email))
        loop.close()

        found = []
        not_found = []
        for r in results:
            if r.get("exists"):
                found.append({
                    "platform": r.get("name", "Unknown"),
                    "domain": r.get("domain", ""),
                    "category": r.get("category", "other")
                })
            else:
                not_found.append(r.get("name", "Unknown"))

        return jsonify({
            "email": email,
            "found": found,
            "found_count": len(found),
            "not_found_count": len(not_found)
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "ok"})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
