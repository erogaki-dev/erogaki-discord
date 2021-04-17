FROM node

WORKDIR /app

# Copy the package.json and package-lock.json for a list of dependencies.
COPY ./package.json ./package.json
COPY ./package-lock.json ./package-lock.json

# Install the dependencies.
RUN npm install

# Copy the source code.
COPY ./src ./src

# Start erogaki-discord.
ENTRYPOINT [ "node", "src/app.js" ]
