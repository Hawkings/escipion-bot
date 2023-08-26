FROM node:18

# Create the data directory
RUN mkdir -p /usr/src/escipion-bot/data

WORKDIR /usr/src/escipion-bot

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

# https://docs.npmjs.com/cli/v9/commands/npm-ci
# like npm install but for prod
RUN npm ci --omit=dev

# Bundle app source
COPY . .

# Replace with the desired port
EXPOSE 2080

CMD [ "npm", "start" ]
