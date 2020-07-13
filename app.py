import logging
import os
from pprint import pprint

import spotipy
from dotenv import load_dotenv
from flask import Flask, jsonify, render_template, request, session
from flask_session import Session
from spotipy.oauth2 import SpotifyOAuth

load_dotenv()

app = Flask(__name__)

app.config['SECRET_KEY'] = os.urandom(64)
app.config['SESSION_TYPE'] = 'filesystem'

Session(app)


@app.route('/')
@app.route('/app')
def sidebar():
    return render_template('index.html')


@app.route('/api/spotify')
def api_spotify():
    auth_manager = SpotifyOAuth(
        scope='user-read-playback-state',
        cache_path='./.cache-oauth'
    )

    if code := request.args.get("code"):
        session['token_info'] = auth_manager.get_access_token(code)

    if info := session.get('token_info'):
        return jsonify(info)

    return jsonify({
        'auth': auth_manager.get_authorize_url()
    })


@app.route('/api/spotify/clear')
def api_spotify_clear():
    session.clear()
    return api_spotify()
