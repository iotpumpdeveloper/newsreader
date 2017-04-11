killall node
killall npm

# first make sure we have nginx reload
echo starting nginx
sudo nginx -c $(pwd nginx.conf)/nginx.conf -s stop
sudo nginx -c $(pwd nginx.confg)/nginx.conf

echo starting api server
# now start the server and piple it to server.log
node server/server.js dev > server.log 2>&1 &

echo starting web client hot loading
# now start the web client 
cd webclient
npm run dev > ../../webclient.log 2>&1 &
cd ..
cd ..
