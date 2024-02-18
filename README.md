# PlOtter
A pen plotter based on brachiograph

sudo apt-get install libopenblas-base (Für Numpy)
pip install numpy

sudo nano start_flask.sh
mit Inhalt:
start_flask.sh                               
#!/bin/bash

cd home/pi/BrachioGraph
source env/bin/activate
authbind --deep python3 main.py

in etc/rc.local aufrufen /home/pi/BrachioGraph/start_flask.sh


#################
Software Einrichtung

Lade die neuste Version vom Raspberry Pi Imager[https://www.raspberrypi.com/software/] auf deinen Computer.
Wähle anschließend die Version Raspberry Pi OS Lite (32-bit)
In den Einstellungen setzt du den Hostname auf "plotter", aktivierst ssh und setzt ein Benutzernamen und ein Passwort und gibst schlussendlich den Namen und das Passwort deines Wifis unter "Wifi einrichten" ein. 
Anschließend drückst du auf speichern und lässt das Ganze auf eine SD-Karte schreiben.

Jetzt muss du die SD-Karte in den RPI einstecken und ihn an den Strom anschließen.
Um nun auf den RPI zuzugreifen benutzen wir das Protokoll SSH, dafür geben wir im Terminal auf unserem Computer folgenden Befehl ein:
ssh benutzername@plotter
anschließend müssen wir das zuvor vergebene Passwort eingeben.

Sind wir so weit verbunden, können wir die nötigen Dateien von GitHub herunterladen, dafür müssen wir zuerst git installieren:
sudo apt install git

Und können dan die Dateien herunterladen:
git clone https://github.com/lidufhgosiuhfgkyfdjhpspdigh/PlOtter

Jetzt müssen wir einige Pakete installieren, dafür benötigen wir zuerst pip:
sudo apt install pip

Die Pakete wollen wir später in einer virtuellen Umgebung installieren:
cd PlOtter
python3 -m venv env
source env/bin/activate

Jetzt können wir die Pakete installieren:
sudo apt install authbind
sudo touch /etc/authbind/byport/80
sudo chmod 777 /etc/authbind/byport/80
sudo apt-get install libopenblas-dev
pip install -r requirements.txt

Um die Webseite automatisch zu starten öffnen wir die Datei rc.local:
cd
sudo nano /etc/rc.local

und fügen vor "exit 0" ein:
/home/pi/PlOtter/start_flask.sh


