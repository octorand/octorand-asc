import os
import json

from dotenv import *
from pyteal import *

load_dotenv()


def uint(key):
    with open("src/app/variables.json") as file:
        data = json.load(file)
        return Int(int(os.environ.get(data["environment"] + "_" + key)))


def addr(key):
    with open("src/app/variables.json") as file:
        data = json.load(file)
        return Addr(os.environ.get(data["environment"] + "_" + key))
