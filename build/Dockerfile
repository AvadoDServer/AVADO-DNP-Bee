
FROM node:12.14.1 as build-deps-wizard

RUN apt-get update && apt-get install -y openssl

# build wizard
WORKDIR /usr/src/app/wizard
COPY wizard .
RUN yarn
RUN yarn build

FROM alpine:3.12 

# download bee client
WORKDIR /
RUN wget https://github.com/ethersphere/bee/releases/download/v0.5.0/bee-linux-386

# nginx
RUN apk add -U --no-cache supervisor nginx
COPY files/nginx.conf /etc/nginx/

# supervisord
COPY files/supervisord.conf /etc/supervisord/

# bee
RUN addgroup -g 1000 bee \
  && adduser -u 1000 -G bee -s /bin/sh -D bee && \
  mkdir -p /home/bee/.bee && \
  chown -R bee:bee /home/bee


RUN mv /bee-linux-386 /usr/local/bin/bee
RUN chmod +x  /usr/local/bin/bee
COPY files/config.yml /app/config.yml
COPY files/start.sh /app/start.sh
RUN chmod +x /app/start.sh

#wizard
COPY --from=build-deps-wizard /usr/src/app/wizard/build /usr/local/wizard


ENTRYPOINT supervisord -n -c /etc/supervisord/supervisord.conf


