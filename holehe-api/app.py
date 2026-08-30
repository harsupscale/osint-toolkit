from flask import Flask, request, jsonify
from flask_cors import CORS
import asyncio
import httpx
import importlib
import os

app = Flask(__name__)
CORS(app)

def get_all_modules():
    modules = []
    categories = [
        'social_media','developer','shopping','entertainment',
        'email_protonmail','email_mail_ru','medias','music',
        'productivity','forum','cms','company','crm','crowfunding',
        'jobs','learning','medical','payment','real_estate',
        'software','sport','transport','products','osint'
    ]
    for cat in categories:
        try:
            cat_mod = importlib.import_module(f'holehe.modules.{cat}')
            cat_path = os.path.dirname(cat_mod.__file__)
            for f in os.listdir(cat_path):
                if f.endswith('.py') and f != '__init__.py':
                    mod_name = f[:-3]
                    try:
                        mod = importlib.import_module(f'holehe.modules.{cat}.{mod_name}')
                        func = getattr(mod, mod_name)
                        modules.append(func)
                    except:
                        pass
        except:
            pass
    return modules

ALL_MODULES = get_all_modules()

async def run_one(mod_func, email, client, out):
    try:
        await mod_func(email, client, out)
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
            client = httpx.AsyncClient(timeout=12)
            tasks = [run_one(m, email, client, out) for m in ALL_MODULES]
            await asyncio.gather(*tasks)

            # retry failed modules with longer timeout
            found_names = {r.get("name") for r in out if isinstance(r, dict)}
            missing = [m for m in ALL_MODULES if not any(
                isinstance(r, dict) and r.get("name") == getattr(m, '__name__', '').split('.')[-1]
                for r in out
            )]
            if missing:
                client2 = httpx.AsyncClient(timeout=15)
                retry_tasks = [run_one(m, email, client2, out) for m in missing]
                await asyncio.gather(*retry_tasks)
                await client2.aclose()

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
    return jsonify({"status": "ok", "modules": len(ALL_MODULES)})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
