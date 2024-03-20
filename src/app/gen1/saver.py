import func

from pyteal import *


class GlobalUint:
    def __init__(self, index, start, length):
        self.index = Itob(index)
        self.start = Int(start)
        self.length = Int(length)

    def get(self):
        return func.get_global_uint(
            self.index,
            self.start,
            self.length,
        )

    def set(self, value):
        return func.set_global_uint(
            value,
            self.index,
            self.start,
            self.length,
        )

    def increment(self, value):
        return func.set_global_uint(
            Add(self.get(), value),
            self.index,
            self.start,
            self.length,
        )


class GlobalBytes:
    def __init__(self, index, start, length):
        self.index = Itob(index)
        self.start = Int(start)
        self.length = Int(length)

    def get(self):
        return func.get_global_bytes(
            self.index,
            self.start,
            self.length,
        )

    def set(self, value):
        return func.set_global_bytes(
            value,
            self.index,
            self.start,
            self.length,
        )


class LocalUint:
    def __init__(self, index, start, length):
        self.index = Itob(index)
        self.start = Int(start)
        self.length = Int(length)

    def get(self, account):
        return func.get_local_uint(
            account,
            self.index,
            self.start,
            self.length,
        )

    def set(self, account, value):
        return func.set_local_uint(
            account,
            value,
            self.index,
            self.start,
            self.length,
        )

    def increment(self, account, value):
        return func.set_local_uint(
            account,
            Add(self.get(account), value),
            self.index,
            self.start,
            self.length,
        )


class LocalBytes:
    def __init__(self, index, start, length):
        self.index = Itob(index)
        self.start = Int(start)
        self.length = Int(length)

    def get(self, account):
        return func.get_local_bytes(
            account,
            self.index,
            self.start,
            self.length,
        )

    def set(self, account, value):
        return func.set_local_bytes(
            account,
            value,
            self.index,
            self.start,
            self.length,
        )


class BoxUint:
    def __init__(self, start, length):
        self.start = Int(start)
        self.length = Int(length)

    def get(self, index):
        return func.get_box_uint(
            Itob(index),
            self.start,
            self.length,
        )

    def set(self, index, value):
        return func.set_box_uint(
            value,
            Itob(index),
            self.start,
            self.length,
        )

    def increment(self, index, value):
        return func.set_box_uint(
            Add(self.get(index), value),
            Itob(index),
            self.start,
            self.length,
        )


class BoxBytes:
    def __init__(self, start, length):
        self.start = Int(start)
        self.length = Int(length)

    def get(self, index):
        return func.get_box_bytes(
            Itob(index),
            self.start,
            self.length,
        )

    def set(self, index, value):
        return func.set_box_bytes(
            value,
            Itob(index),
            self.start,
            self.length,
        )
