# Streaming side panel

https://stream.tinybluerobot.com

Run dev setup with `itermocil --here`

#### the js

	nvm use
	npm run dev

#### the python

	poetry run flask run

`.env` should contain
```
SPOTIPY_CLIENT_ID=
SPOTIPY_CLIENT_SECRET=
SPOTIPY_REDIRECT_URI=http://localhost:5000/api/spotify
```

