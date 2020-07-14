deploy:
	find . -name .DS_Store -not -path './node_modules/*' -delete
	npm run build
	rsync -av app.py poetry.lock pyproject.toml templates static petra:/opt/stream
	ssh petra 'systemctl restart stream'

