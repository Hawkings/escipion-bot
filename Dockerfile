FROM node:18

WORKDIR /usr/src/escipion

# Replace with the desired port
EXPOSE 3080

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

# https://docs.npmjs.com/cli/v9/commands/npm-ci
# like npm install but for prod
RUN npm ci --omit=dev

# Bundle app source
COPY . .

# Create the data directory
RUN mkdir -p /usr/src/escipion/data

RUN npm run build
ENV TZ=Europe/Zurich
CMD [ "node", "bin/src/main.js" ]
