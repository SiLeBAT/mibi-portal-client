#!/bin/bash
# Runs once on MongoDB's first boot (via /docker-entrypoint-initdb.d) to load the
# provided "mibiportal" dump. See e2e/README.md requirements #1-#3.
#
# IMPORTANT: the mongo entrypoint *sources* this file, so it must NOT use `set -e`
# or `exit` — that would abort the entrypoint before the real mongod starts.
#
# Expects an archive at /seed/dump.archive.gz created with:
#   mongodump --archive=dump.archive.gz --gzip --db mibiportal
#
# NOTE: the base mongo image does not ship `mongorestore`. When a real dump is added,
# either use an image that includes mongodb-database-tools or restore from a sidecar
# container. For the empty (smoke) case nothing below runs.

DUMP="/seed/dump.archive.gz"

if [ -f "$DUMP" ]; then
  echo "restore.sh: restoring $DUMP ..."
  if command -v mongorestore >/dev/null 2>&1; then
    mongorestore --archive="$DUMP" --gzip --drop || echo "restore.sh: mongorestore reported an error"
    echo "restore.sh: restore complete."
  else
    echo "restore.sh: mongorestore not found in this image — skipping (see e2e/README.md)."
  fi
else
  echo "restore.sh: no dump at $DUMP — starting with an empty database (fine for the smoke test)."
fi
