read -p "you sure? (y/*) " shouldContinue
if [ "$shouldContinue" != "y" ]; then
	exit
fi

rm -r dist
rm -r distribution
tsc
cp -r dist/package/ distribution/
cp LICENSE distribution/LICENSE
cp README.md distribution/README.md
cp package.json distribution/package.json