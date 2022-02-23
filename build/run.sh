#!/bin/bash

set -o errexit
set -o pipefail
set -o nounset

PASSWORD=${PASSWORD:-}
DATADIR=${DATADIR:-/home/bee/.bee}
EXTRA_OPTS=${EXTRA_OPTS:-}

VERSION=`bee version`
echo "Running bee:"
echo $VERSION

# db capacity in chunks, multiply by 4096 to get approximate capacity in bytes
BEE_DB_CAPACITY=${BEE_DB_CAPACITY:-5000000}

# send a welcome message string during handshakes
BEE_WELCOME_MESSAGE=${BEE_WELCOME_MESSAGE:-"AVADO"}

echo $PASSWORD > /home/bee/.password

chown -R bee:bee /home/bee/.bee

echo "Starting webserver"
serve -l 80 &

echo "Starting Bee"
exec gosu bee:bee bee start --config /home/bee/config.yml $EXTRA_OPTS $@ 2>&1


echo "Bee exited.. sleeping for 90s"
sleep 90
