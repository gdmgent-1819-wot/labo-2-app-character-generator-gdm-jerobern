import firebase_admin
from firebase_admin import credentials
from firebase_admin import db
from sense_hat import SenseHat
from time import time, sleep
import os
import sys
import random
from math import floor, ceil

# Update with firebase info
serviceAccountKey = '../wot-1819-jerobern-firebase-adminsdk-4353z-76d5509e36.json'
databaseURL = 'https://wot-1819-jerobern.firebaseio.com/'

try:
    # Fetch the service account key JSON file contents
    firebase_cred = credentials.Certificate(serviceAccountKey)

    # Initalize the app with a service account; granting admin privileges
    firebase_admin.initialize_app(firebase_cred, {
    'databaseURL': databaseURL
    })

    # As an admin, the app has access to read and write all data
    firebase_ref_characters = db.reference('characters')
    firebase_ref_current_character = db.reference('current_character')
except:
    print('Unable to initialize Firebase: {}'.format(sys.exc_info()[0]))
    sys.exit(1)

try:
    # SenseHat
    sense_hat = SenseHat()
    sense_hat.set_imu_config(False, False, False)
except:
    print('Unable to initialize the Sense Hat library: {}'.format(sys.exc_info()[0]))
    sys.exit(1)

# callback when change is detected in database
def cb(self):
    current_matrix = firebase_ref_current_character.get()
    current_matrix_tuple = []
    # convert array of strings to array of tuple
    if current_matrix and len(current_matrix) == 64:
        for color in current_matrix:
            current_matrix_tuple.append(tuple(map(int, color[1:-1].split(','))))
        sense_hat.set_pixels(current_matrix_tuple)
    else: sense_hat.clear()
    
def main():
  firebase_ref_current_character.listen(cb)
  while True:
    sleep(100)
        
if __name__ == "__main__":
    try:
        main()
    except (KeyboardInterrupt, SystemExit):
        print('Interrupt received! Stopping the application...')
    finally:
        print('Cleaning up the mess...')
        sense_hat.clear()
        sys.exit(0)