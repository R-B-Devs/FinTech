# set working directories
# Note: The WORKDIR command sets the working directory for any RUN, CMD, ENTRYPOINT
FROM node:24-alpine
WORKDIR /app
COPY package.json package-lock.json ./
# RUN npm install -g npm@latest
RUN npm install
COPY . .
EXPOSE 3001
CMD ["node", "App.js"]

# ensure app files are owned by configured user
# then copy source files into containerized application directory
COPY --chown=app:app . /app