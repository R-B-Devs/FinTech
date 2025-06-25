# run as non-root user
# FROM node:20
# RUN useradd -ms /bin/sh -u 1001 app
# USER app

# set working directories
WORKDIR /client
COPY package*.json ./
# RUN npm install -g npm@latest
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "start"]

# ensure app files are owned by configured user
# then copy source files into containerized application directory
COPY --chown=app:app . /app