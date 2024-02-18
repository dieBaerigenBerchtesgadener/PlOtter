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

# Software Einrichtung

## Raspberry Pi Imager herunterladen und Raspberry Pi OS Lite (32-bit) installieren

1. Lade die neueste Version vom Raspberry Pi Imager von [hier](https://www.raspberrypi.com/software/) auf deinen Computer herunter.
2. Wähle die Version Raspberry Pi OS Lite (32-bit).
3. Konfiguriere die Einstellungen:
   - Setze den Hostnamen auf "plotter".
   - Aktiviere SSH.
   - Setze einen Benutzernamen und ein Passwort.
   - Gib den Namen und das Passwort deines WLANs unter "Wifi einrichten" ein.
4. Speichere die Konfiguration und schreibe sie auf eine SD-Karte.

## Verbindung zum Raspberry Pi über SSH herstellen

1. Stecke die SD-Karte in den Raspberry Pi und schließe ihn an den Strom an.
2. Öffne das Terminal auf deinem Computer und führe folgenden Befehl aus, um eine SSH-Verbindung herzustellen:
   
   ```bash
   ssh benutzername@plotter
3. Gib das zuvor vergebene Passwort ein

## Herunterladen der Dateien von GitHub und Installation der Pakete

1. Installiere git & pip:
   
   ```bash
    sudo apt install git
    sudo apt install python3-pip
2. Klone das GitHub-Repository:
   
   ```bash
   git clone https://github.com/lidufhgosiuhfgkyfdjhpspdigh/PlOtter
3. Navigiere zum Projektverzeichnis:
   
   ```bash
   cd PlOtter
4. Erstelle eine virtuelle Umgebung:
   
   ```bash
   python3 -m venv env
5. Aktiviere die virtuelle Umgebung:
   
   ```bash
   source env/bin/activate
6. Installiere benötigte Pakete:
   
   ```bash
   sudo apt install authbind
   sudo touch /etc/authbind/byport/80
   sudo chmod 777 /etc/authbind/byport/80
   sudo apt-get install libopenblas-dev
   pip install -r requirements.txt

7. Um die Webseite automatisch zu starten öffnen wir die Datei rc.local:
   
   ```bash
   cd
   sudo nano /etc/rc.local
8. Vor "exit 0" fügen wir folgendes ein:
    
   ```bash
   /home/pi/PlOtter/start_flask.sh
   ```
   Das speichern wir anschließend mit Ctrl + X und C
9. Schlussendlich starten wir den RPI neu
   ```bash
   sudo reboot
10. Um nun die Webseite zu öffnen gehe auf http://plotter
