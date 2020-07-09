import os
from urllib.parse import urlencode

import spotipy
from flask import Flask

# .env should be
# SPOTIPY_CLIENT_ID=
# SPOTIPY_CLIENT_SECRET=
# SPOTIPY_REDIRECT_URI=http://localhost:8080/callback

app = Flask(__name__)


@app.route("/api/spotify")
def spotify():
    # make adjustable later?
    username = "dsibitzky"
    scope = "user-read-private"

    try:
        token = spotipy.util.prompt_for_user_token(username, scope)
        return f"{token.encode()}"
    except spotipy.exceptions.SpotifyException:
        pass

    return "nope"

# print("https://accounts.spotify.com/authorize?%s" % urlencode({
#     "client_id": os.environ["SPOTIPY_CLIENT_ID"],
#     "response_type": "code",
#     "redirect_uri": os.environ["SPOTIPY_REDIRECT_URI"],
#     "scope": "user-read-private",
# }))
