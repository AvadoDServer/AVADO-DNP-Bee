#!/bin/sh

echo "Starting bee"
mkdir -p /home/bee/.bee/keys

if [ ! -f "/home/bee/.bee/keys/password" ]
then
    echo "creating password"
    echo `< /dev/urandom tr -dc _A-Z-a-z-0-9 | head -c16` > /home/bee/.bee/keys/password
fi

echo "Extra opts \"$EXTRA_OPTS\""
bee --config /app/config.yml start $EXTRA_OPTS

sleep 30
