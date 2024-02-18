# PlOtter
A pen plotter based on brachiograph

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
   ```
   Wenn gefragt wird, ob du weitermachen willst ```Do you want to continue?``` bestätige immer mit ```y```
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
8. Vor ```exit 0``` fügen wir folgendes ein:
    
   ```bash
   sudo bash /home/pi/PlOtter/start_flask.sh
   ```
   Das speichern wir anschließend mit Ctrl + X; y und der Eingabetaste
9. Schlussendlich starten wir den Raspberry Pi neu
   ```bash
   sudo reboot
10. Um nun die Webseite zu öffnen gehe auf http://plotter
