from flask import Flask, request, jsonify
from flask_cors import CORS
import asyncio
import httpx

app = Flask(__name__)
CORS(app)

async def run_module(module_func, email, client, out):
    try:
        await module_func(email, client, out)
    except:
        pass

@app.route('/check', methods=['GET'])
def check_email():
    email = request.args.get('email', '').strip()
    if not email or '@' not in email:
        return jsonify({"error": "Valid email required"}), 400

    try:
        async def run_checks():
            out = []
            client = httpx.AsyncClient(timeout=8)

            modules = []
            module_names = [
                ("holehe.modules.social_media.instagram", "instagram"),
                ("holehe.modules.social_media.snapchat", "snapchat"),
                ("holehe.modules.social_media.twitter", "twitter"),
                ("holehe.modules.social_media.tiktok", "tiktok"),
                ("holehe.modules.social_media.pinterest", "pinterest"),
                ("holehe.modules.social_media.reddit", "reddit"),
                ("holehe.modules.social_media.tumblr", "tumblr"),
                ("holehe.modules.social_media.flickr", "flickr"),
                ("holehe.modules.social_media.vsco", "vsco"),
                ("holehe.modules.social_media.spotify", "spotify"),
                ("holehe.modules.social_media.soundcloud", "soundcloud"),
                ("holehe.modules.social_media.tidal", "tidal"),
                ("holehe.modules.developer.github", "github"),
                ("holehe.modules.developer.gitlab", "gitlab"),
                ("holehe.modules.developer.docker", "docker"),
                ("holehe.modules.developer.keybase", "keybase"),
                ("holehe.modules.developer.replit", "replit"),
                ("holehe.modules.developer.heroku", "heroku"),
                ("holehe.modules.developer.bitbucket", "bitbucket"),
                ("holehe.modules.developer.gravatar", "gravatar"),
                ("holehe.modules.shopping.amazon", "amazon"),
                ("holehe.modules.shopping.ebay", "ebay"),
                ("holehe.modules.shopping.etsy", "etsy"),
                ("holehe.modules.entertainment.twitch", "twitch"),
                ("holehe.modules.entertainment.discord", "discord"),
                ("holehe.modules.entertainment.duolingo", "duolingo"),
                ("holehe.modules.entertainment.lastfm", "lastfm"),
                ("holehe.modules.entertainment.fiverr", "fiverr"),
                ("holehe.modules.email_protonmail.protonmail", "protonmail"),
                ("holehe.modules.email_mail_ru.mail_ru", "mail_ru"),
                ("holehe.modules.others.nike", "nike"),
                ("holehe.modules.others.vercel", "vercel"),
                ("holehe.modules.others.canva", "canva"),
                ("holehe.modules.others.wattpad", "wattpad"),
                ("holehe.modules.others.strava", "strava"),
                ("holehe.modules.others.komoot", "komoot"),
                ("holehe.modules.others.codecademy", "codecademy"),
                ("holehe.modules.others.medium", "medium"),
                ("holehe.modules.others.patreon", "patreon"),
                ("holehe.modules.others.notion", "notion"),
            ]

            import importlib
            for mod_path, func_name in module_names:
                try:
                    mod = importlib.import_module(mod_path)
                    func = getattr(mod, func_name)
                    modules.append(func)
                except:
                    pass

            tasks = [run_module(m, email, client, out) for m in modules]
            await asyncio.gather(*tasks)
            await client.aclose()
            return out

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
