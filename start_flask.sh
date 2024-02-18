#!/bin/bash

cd home/pi/BrachioGraph
source env/bin/activate
authbind --deep python3 main.py

