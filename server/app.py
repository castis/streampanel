import os

import spotipy
from flask import Flask, redirect, request, session
from flask_session import Session

app = Flask(__name__)
app.config['SECRET_KEY'] = os.urandom(64)
app.config['SESSION_TYPE'] = 'filesystem'

Session(app)

auth_manager = spotipy.oauth2.SpotifyOAuth(
	username='dsibitzky',
	scope='user-read-private',
	cache_path='./cache-oauth'
)
spotify = spotipy.Spotify(auth_manager=auth_manager)


@app.route('/api/spotify')
def index():
    if code := request.args.get("code"):
    	# return f'{code}'
        session['token_info'] = auth_manager.get_access_token(request.args["code"])
        from pprint import pprint
        pprint(session['token_info'])
        return 'yay'
        # return redirect('/')

    if not session.get('token_info'):
        auth_url = auth_manager.get_authorize_url()
        return f'<h2><a href="{auth_url}">Sign in</a></h2>'

    return f'<h2>Hi {spotify.me()["display_name"]}, ' \
           f'<small><a href="/sign_out">[sign out]<a/></small></h2>' \
           f'<a href="/playlists">my playlists</a>'


@app.route('/sign_out')
def sign_out():
    session.clear()
    return redirect('/')


@app.route('/playlists')
def playlists():
    if not session.get('token_info'):
        return redirect('/')
    else:
        return spotify.current_user_playlists()
