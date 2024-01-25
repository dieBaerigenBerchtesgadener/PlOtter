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

