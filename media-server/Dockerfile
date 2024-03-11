FROM node:20-alpine as base
WORKDIR /home/node/app

COPY package*.json ./

# install build tools and python for node-gyp, etc.
RUN apk add g++ make python3 linux-headers
RUN apk add --update py3-pip

# optional: install Zsh for shell inside the container
RUN sh -c "$(wget -O- https://github.com/deluan/zsh-in-docker/releases/download/v1.1.2/zsh-in-docker.sh)"

# install npm dependencies
RUN npm install

# copy the rest of the application code
COPY . .

FROM base as production
ENV NODE_PATH=./build
RUN npm run build