echo getting new data...
python triplescraper.py
mv -f *.xml xml

echo logging timestamps...
git log -1 --format=%cd -- xml/lapanza.xml > timestamps
git log -1 --format=%cd -- xml/lastablas.xml >> timestamps
git log -1 --format=%cd -- xml/arroyogrande.xml >> timestamps

echo committing...
git add -A
git commit -m "Update adjective fire danger rating"
git push
