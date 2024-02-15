#!/bin/bash

cd home/pi
source env/bin/activate
cd home/pi/BrachioGraph
authbind --deep python3 main.py

