from flask import Flask, render_template, request, jsonify
from custom import bg
import os
import subprocess
import webbrowser
import requests
from io import BytesIO
import base64
import signal
import sys

app = Flask(__name__)

# Starte den pigpio-Daemon, wenn er nicht bereits läuft
if not os.path.exists("/var/run/pigpio.pid"):
    subprocess.run(["sudo", "pigpiod"], check=True)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/printImage', methods=['POST'])
def printImage():
    try:
        data = request.json
        lines = data['lines']
        lines = lines[0]

        # Hier kannst du die Linieninformationen mit bg.plot_lines darstellen
        # Du musst die Logik an dein Brachiograph-Modul anpassen
        result = "Bild ist fertig"
        print(result)
        bg.plot_lines(lines)
        bg.quiet(servos=[14, 15, 18]) #Stimmen die Servo-Nummern?

        return result
    except Exception as e:
        return str(e)

""" 
Create Images with OpenAI
@app.route('/generate_ai', methods=['GET'])
def generate_image():
    try:
        # Importiere die Module nur, wenn die Funktion aufgerufen wird
        from openai import OpenAI

        # Replace YOUR_API_KEY with your OpenAI API key
        openai_client = OpenAI(api_key="sk-yourapikey")

        prompt_text = request.args.get('prompt', 'default_prompt')

        # Call the OpenAI API for image generation
        response = openai_client.images.generate(
            model="dall-e-3",
            prompt=prompt_text,
            size="1024x1024",
            quality="standard",
            n=1,
        )

        # Get the URL of the generated image
        image_url = response.data[0].url

        # Lade das Bild herunter und speichere es lokal
        image_response = requests.get(image_url)
        image_data = base64.b64encode(image_response.content).decode('utf-8')

        # Return the image URL and the base64-encoded image data
        return jsonify({"image_data": image_data})

    except Exception as e:
        return jsonify({"error": str(e)}), 500
"""
@app.route('/generate_ai', methods=['GET'])
def generate_image():
    try:
        prompt = request.args.get('prompt')
        if prompt is None:
            return jsonify({"error": "Kein Prompt"}), 400

        url = "https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image"

        body = {
        "steps": 40,
        "width": 1024,
        "height": 1024,
        "seed": 0,
        "cfg_scale": 5,
        "samples": 1,
        "text_prompts": [
            {
            "text": prompt,
            "weight": 1
            },
            {
            "text": " ",
            "weight": -1
            }
        ],
        }

        headers = {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "Authorization": "Bearer sk-yourapikey",
        }

        response = requests.post(
            url,
            headers=headers,
            json=body,
        )

        if response.status_code != 200:
            raise Exception("Non-200 response: " + str(response.text))

        data = response.json()

        image_data_list = []
        for i, image in enumerate(data["artifacts"]):
            image_data = image["base64"]
            image_data_list.append(image_data)

        return jsonify({"image_data_list": image_data_list})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/shutdownServer', methods=['POST'])
def shutdownServer():
    print('Shutting down server...')
    os.kill(os.getpid(), signal.SIGINT)
    return 'Server shutting down...'

# IP-Adresse des Clients, der die Anfrage senden kann
ALLOWED_IP = "127.0.0.1"

@app.route('/rebootServer', methods=['POST'])
def restartServer():
    if request.remote_addr == ALLOWED_IP:
        print('Restarting server...')
        os.execl(sys.executable, sys.executable, *sys.argv)
        return 'Server restarting...'
    else:
        return 'Access denied'

@app.route('/reboot', methods=['POST'])
def reboot():
    if request.remote_addr == ALLOWED_IP:
        print('Restarting ...')
        subprocess.run(['sudo', 'reboot'])
        return 'Rebooting PlOtter...'
    else:
        return 'Access denied'

@app.route('/shutdown', methods=['POST'])
def shutdown():
    if request.remote_addr == ALLOWED_IP:
        print('Shutting down PlOtter...')
        subprocess.run(['sudo', 'shutdown', '-h', 'now'])
        return 'PlOtter shutting down...'
    else:
        return 'Access denied'

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=80)


