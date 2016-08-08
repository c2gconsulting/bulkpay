# Pull the official mongo image and run it. It will fail if container mongodb already exists
docker run --name mongodb -d  -p 37017:27017 mongo
