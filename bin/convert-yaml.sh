#!/bin/bash
SRC="src"
DIST="dist"
YAML="$SRC/yaml"
JSON="$DIST/json"
if [[ -d "$YAML" ]]; then
  if [ "$(ls $YAML/*.yml)" ]; then
    # yaml directory contains some .yml files
    if [[ ! -d "$JSON" ]]; then
      # json directory doesn’t exist yet
      if [[ ! -d "$DIST" ]]; then
        # dist directory doesn’t exist yet
        echo "Creating directory $DIST..."
        mkdir $DIST
      fi
      echo "Creating directory $JSON..."
      mkdir $JSON
    fi
    echo "Starting conversion..."
    for file in $( ls $YAML/*.yml ); do
      # handle each .yml source file
      name=$(basename $file .yml)
      echo "    $YAML/$name.yml > $JSON/$name.json"
      yaml2json $file > $JSON/$name.json
    done
    echo "Finished."
    exit 0
  else
     echo "Directory “$YAML” doesn’t contain any .yml files to convert..."
     exit 1
  fi
else
  echo "Directory “$YAML” not found..."
  exit 1
fi
