#!/bin/bash

cd home/pi/PlOtter
source env/bin/activate
authbind --deep python3 main.py

