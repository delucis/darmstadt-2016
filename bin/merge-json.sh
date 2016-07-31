#!/bin/bash
SRC="json"
MAIN="merged-data.json"
if [[ -d "$SRC" ]]; then
  if [ "$(ls $SRC/*.json)" ]; then
    # json directory contains some .json files
    echo "Creating $MAIN..."
    echo '{"concerts":[],"lectures":[],"people":{}}' > $MAIN
    echo "Starting merge..."
    for file in $( ls $SRC/*.json ); do
      if [[ "$file" != "$SRC/$MAIN" ]]; then
        # handle each .json source file, except json/merged-data.json
        echo "    merging $file..."
        cp $MAIN $SRC/$MAIN
        json_merger $file > $MAIN
      fi
    done
    echo "Finished."
    exit 0
  else
    echo "Directory “$SRC” doesn’t contain any .json files to merge..."
    exit 1
  fi
else
  echo "Directory “$SRC” not found..."
  exit 1
fi
