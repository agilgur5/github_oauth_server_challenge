FROM node:8.1

# cache dependencies
COPY ./package.json /home/app/package.json
WORKDIR /home/app/
RUN npm install

# cache files
COPY ./static /home/app/static
COPY ./server.js /home/app/server.js
CMD node server.js
