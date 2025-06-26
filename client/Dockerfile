# run as non-root user
# FROM node:20
# RUN useradd -ms /bin/sh -u 1001 app
# USER app

# set working directories
# and install dependencies
FROM node:24-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
COPY . .
RUN npm run build

# serve the app build with static server
FROM node:24-alpine AS production
WORKDIR /app
RUN npm install -g serve
COPY --from=build /app/build ./build
EXPOSE 3000
CMD ["npm", "start"]

# ensure app files are owned by configured user
# then copy source files into containerized application directory
COPY --chown=app:app . /app