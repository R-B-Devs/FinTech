# run as non-root user
# FROM node:20
# RUN useradd -ms /bin/sh -u 1001 app
# USER app

# set working directories
# Note: The WORKDIR command sets the working directory for any RUN, CMD, ENTRYPOINT
FROM node:24-alpine
# RUN npm install -g npm@latest
RUN npm install
COPY . .
EXPOSE 3001
CMD ["node", "App.js"]

# ensure app files are owned by configured user
# then copy source files into containerized application directory
COPY --chown=app:app . /app