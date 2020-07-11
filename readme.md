# Streaming side panel

#### the js

	nvm use
	npm run dev

#### the python

	cd server
	poetry run flask run


`.env` should contain
```
SPOTIPY_CLIENT_ID=
SPOTIPY_CLIENT_SECRET=
SPOTIPY_REDIRECT_URI=http://localhost:8080/callback
```

```
poetry install
poetry shell
python spotify.py
```


https://stream.tinybluerobot.com
