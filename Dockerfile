# run as non-root user
FROM node:20
run useradd -ms /bin/sh -u 1001 app
USER app

# set working directories
WORKDIR /server /client
COPY package*.json ./
RUN npm install

# copy source files into containerized application  directory
COPY --chown=app:app . /app