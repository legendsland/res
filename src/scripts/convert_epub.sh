#!/bin/bash

# This script uses the 'xxx' tool to convert EPUB files to HTML.
# Usage: ./convert_epub.sh "*.epub" or simply ./convert_epub.sh

# Check if arguments were provided, otherwise default to all .epub files
if [ "$#" -eq 0 ]; then
    files=( *.epub )
else
    files=( "$@" )
fi

# Iterate through the files and convert them
for file in "${files[@]}"; do
    if [[ -f "$file" ]]; then
        echo "Converting: $file"
        yarn cli -c "$file"
    else
        echo "Skipping: $file (not found or not a file)"
    fi
done

echo "Conversion complete."
