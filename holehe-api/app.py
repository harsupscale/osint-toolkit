from flask import Flask, request, jsonify
from flask_cors import CORS
import asyncio
import importlib

app = Flask(__name__)
CORS(app)

def get_holehe_modules():
    modules = []
    module_list = [
        ("holehe.modules.social_media.instagram", "instagram"),
        ("holehe.modules.social_media.snapchat", "snapchat"),
        ("holehe.modules.social_media.twitter", "twitter"),
        ("holehe.modules.social_media.tiktok", "tiktok"),
        ("holehe.modules.social_media.pinterest", "pinterest"),
        ("holehe.modules.social_media.reddit", "reddit"),
        ("holehe.modules.social_media.tumblr", "tumblr"),
        ("holehe.modules.social_media.spotify", "spotify"),
        ("holehe.modules.social_media.discord", "discord"),
        ("holehe.modules.developer.github", "github"),
        ("holehe.modules.developer.gitlab", "gitlab"),
        ("holehe.modules.developer.docker", "docker"),
        ("holehe.modules.developer.keybase", "keybase"),
        ("holehe.modules.developer.replit", "replit"),
        ("holehe.modules.shopping.amazon", "amazon"),
        ("holehe.modules.shopping.ebay", "ebay"),
        ("holehe.modules.entertainment.twitch", "twitch"),
        ("holehe.modules.entertainment.spotify", "spotify"),
        ("holehe.modules.entertainment.soundcloud", "soundcloud"),
        ("holehe.modules.email_protonmail.protonmail", "protonmail"),
    ]
    for mod_path, name in module_list:
        try:
            mod = importlib.import_module(mod_path)
            func = getattr(mod, name)
            modules.append(func)
        except:
            pass
    return modules

@app.route('/check', methods=['GET'])
def check_email():
    email = request.args.get('email', '').strip()
    if not email or '@' not in email:
        return jsonify({"error": "Valid email required"}), 400

    try:
        async def run_checks():
            import httpx
            out = []
            client = httpx.AsyncClient(timeout=10)
            modules = get_holehe_modules()

            tasks = []
            for mod_func in modules:
                tasks.append(check_one(mod_func, email, client, out))
            await asyncio.gather(*tasks, return_exceptions=True)
            await client.aclose()
            return out

        async def check_one(mod_func, email, client, out):
            try:
                await mod_func(email, client, out)
            except:
                pass

        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        results = loop.run_until_complete(run_checks())
        loop.close()

        found = []
        not_found = []
        for r in results:
            if isinstance(r, dict) and r.get("exists"):
                found.append({
                    "platform": r.get("name", "Unknown"),
                    "domain": r.get("domain", ""),
                    "category": r.get("category", "other")
                })
            elif isinstance(r, dict):
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
