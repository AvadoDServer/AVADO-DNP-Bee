# FROM node:15.14-alpine AS build

# WORKDIR /usr/src/app

# ENV REACT_APP_BEE_HOST http://bee.my.ava.do:1633

# RUN apk add git && \
#     git clone https://github.com/ethersphere/bee-dashboard.git . && \
#     git checkout v0.13.0 && \
#     npm ci && \
#     NODE_OPTIONS=--max_old_space_size=4096 npm run build

FROM node:15.14-alpine

ARG TARGETARCH
ARG UPSTREAM_VERSION

ENV DOWNLOAD_URL https://github.com/ethersphere/bee/releases/download

WORKDIR /home/bee

RUN apk add --update pwgen bash wget && \
  wget $DOWNLOAD_URL/$UPSTREAM_VERSION/bee-linux-${TARGETARCH:-amd64} -O /usr/local/bin/bee && \
  chmod +x /usr/local/bin/bee 

RUN npm i -g serve

RUN apk add --no-cache -X http://dl-cdn.alpinelinux.org/alpine/edge/testing \
  gosu 

RUN addgroup -g 2000 bee \
  && adduser -u 2000 -G bee -s /bin/sh -D bee && \
  mkdir -p /home/bee/.bee && \
  chown -R bee:bee /home/bee

WORKDIR /wizard
COPY files/dashboard_build .
COPY bootdashboard.html .
COPY bootdashboard.css .
COPY boot.html .

VOLUME /home/bee

COPY run.sh /usr/local/bin/
COPY config.yml /home/bee/

ENTRYPOINT [ "run.sh" ]