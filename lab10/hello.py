import platform
import sys

name = 'Alicja'
nr = 57929
version = platform.python_version()
loc = sys.executable

string = f'Hello {name} ({nr}). This environment is using Python version {version} at location {loc}'

print(string)