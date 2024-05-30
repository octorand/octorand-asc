import os
import json

from dotenv import *
from pyteal import *

load_dotenv()


def env():
    return os.environ.get("ENVIRONMENT")


def uint(key):
    return Int(int(os.environ.get(env().upper() + "_" + key)))


def addr(key):
    return Addr(os.environ.get(env().upper() + "_" + key))
