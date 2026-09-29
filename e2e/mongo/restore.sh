#!/bin/bash
# Runs once on MongoDB's first boot (via /docker-entrypoint-initdb.d) and loads the
# E2E seed into the "mibiportal" database. See e2e/README.md.
#
# IMPORTANT: the mongo entrypoint *sources* this file, so it must NOT use `set -e`
# or `exit` — that would abort the entrypoint before the real mongod starts.
#
# The seed is a mongosh script produced by e2e/seed/make-seed.js:
#
#   node e2e/seed/make-seed.js        # writes e2e/seed/seed-data.js.gz
#
# It is a script rather than a mongodump archive because this image ships mongosh but
# not mongorestore (mongodb-database-tools is a separate package), so nothing extra
# has to be installed on either side. The seed names its own target database.
#
# With no seed present the database simply stays empty — enough for the Welcome-page
# smoke test, not for anything that reads data.

# /seed is the read-only mount of e2e/seed (see e2e/docker-compose.yml). SEED_DIR is
# overridable so this hook can be exercised outside the container.
SEED_DIR="${SEED_DIR:-/seed}"
SEED_GZ="$SEED_DIR/seed-data.js.gz"
SEED_PLAIN="$SEED_DIR/seed-data.js"

if [ -f "$SEED_GZ" ]; then
  echo "restore.sh: loading $SEED_GZ ..."
  if gunzip -c "$SEED_GZ" > /tmp/seed-data.js; then
    mongosh --quiet --file /tmp/seed-data.js ||
      echo "restore.sh: mongosh reported an error while loading the seed"
    rm -f /tmp/seed-data.js
  else
    echo "restore.sh: could not unpack $SEED_GZ — is it a gzip file?"
  fi
elif [ -f "$SEED_PLAIN" ]; then
  echo "restore.sh: loading $SEED_PLAIN ..."
  mongosh --quiet --file "$SEED_PLAIN" ||
    echo "restore.sh: mongosh reported an error while loading the seed"
else
  echo "restore.sh: no seed at $SEED_GZ — starting with an empty database."
  echo "restore.sh: only the Welcome-page smoke test can pass like this."
fi
