
run:
	docker-compose up --build -d

stop:
	docker-compose down

logs:
	docker-compose logs -f
re:
	docker-compose down --volumes --remove-orphans
	docker system prune -af
	docker-compose build --no-cache
	make run
