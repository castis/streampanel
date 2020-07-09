deploy:
	find . -name .DS_Store -not -path './node_modules/*' -delete
	rsync -av public petra:/opt/stream/
	rsync -av server --exclude='.cache-*' --exclude='.env' --exclude='__pycache__' petra:/opt/stream/
