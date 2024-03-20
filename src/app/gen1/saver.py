import func

from pyteal import *

bytes = "bytes"
uint = "uint"


class Global:
    def __init__(self, type, index, start, length):
        self.type = type
        self.index = Itob(index)
        self.start = Int(start)
        self.length = Int(length)

    def get(self):
        if self.type == bytes:
            return func.get_global_bytes(
                self.index,
                self.start,
                self.length,
            )
        elif self.type == uint:
            return func.get_global_uint(
                self.index,
                self.start,
                self.length,
            )

    def set(self, value):
        if self.type == bytes:
            return func.set_global_bytes(
                value,
                self.index,
                self.start,
                self.length,
            )
        elif self.type == uint:
            return func.set_global_uint(
                value,
                self.index,
                self.start,
                self.length,
            )

    def increment(self, value):
        if self.type == uint:
            return func.set_global_uint(
                Add(self.get(), value),
                self.index,
                self.start,
                self.length,
            )


class Local:
    def __init__(self, type, index, start, length):
        self.type = type
        self.index = Itob(index)
        self.start = Int(start)
        self.length = Int(length)

    def get(self, account):
        if self.type == bytes:
            return func.get_local_bytes(
                account,
                self.index,
                self.start,
                self.length,
            )
        elif self.type == uint:
            return func.get_local_uint(
                account,
                self.index,
                self.start,
                self.length,
            )

    def set(self, account, value):
        if self.type == bytes:
            return func.set_local_bytes(
                account,
                value,
                self.index,
                self.start,
                self.length,
            )
        elif self.type == uint:
            return func.set_local_uint(
                account,
                value,
                self.index,
                self.start,
                self.length,
            )

    def increment(self, account, value):
        if self.type == uint:
            return func.set_local_uint(
                account,
                Add(self.get(account), value),
                self.index,
                self.start,
                self.length,
            )


class Box:
    def __init__(self, type, start, length):
        self.type = type
        self.start = Int(start)
        self.length = Int(length)

    def get(self, index):
        if self.type == bytes:
            return func.get_box_bytes(
                Itob(index),
                self.start,
                self.length,
            )
        elif self.type == uint:
            return func.get_box_uint(
                Itob(index),
                self.start,
                self.length,
            )

    def set(self, index, value):
        if self.type == bytes:
            return func.set_box_bytes(
                value,
                Itob(index),
                self.start,
                self.length,
            )
        elif self.type == uint:
            return func.set_box_uint(
                value,
                Itob(index),
                self.start,
                self.length,
            )

    def increment(self, index, value):
        if self.type == uint:
            return func.set_box_uint(
                Add(self.get(index), value),
                Itob(index),
                self.start,
                self.length,
            )
