#/bin/bash

# build light.js file

# Remove previous file

rm -f ./src/light-min.js

# Minify using yui compressor

java -jar ./lib/yuicompressor-2.4.2.jar ./src/light-debug.js -v -o ./src/light-min.js --charset utf8

# Concatenate HEAD and light-min.js

cat ./src/HEAD ./src/light-min.js > ./build/light.js


echo 'Build Complete!'
