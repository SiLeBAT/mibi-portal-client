#!/bin/bash

varLU=$(git log -p -1 | sed -n s/Date://gp | xargs)
sed -i 's/\"lastChange\": \".*\"/\"lastChange\": \"$varLU\"/' package.json