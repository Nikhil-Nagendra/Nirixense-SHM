import urllib.request
import urllib.error
try:
    response = urllib.request.urlopen('http://localhost:8000/api/nodes/')
    print(response.read().decode())
except urllib.error.HTTPError as e:
    print(e.read().decode())
