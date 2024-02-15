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
Wähle anschließend die Version ... trage in den Einstellungen dein Wifi-Namen und dein Wifi-Passwort ein und flashe sie auf die SD-Karte.
