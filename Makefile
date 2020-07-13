deploy:
	find . -name .DS_Store -not -path './node_modules/*' -delete
	npm run build
	rsync -av static petra:/opt/stream/
	rsync -av app.py poetry.lock pyproject.toml templates petra:/opt/stream
	ssh petra 'systemctl restart stream'

