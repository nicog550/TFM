DEPLOYMENT STEPS
================

1. Install **node**: `sudo apt-get install node`
2. Install **npm**: `sudo apt-get install npm`
3. Install dependencies:
    1. `cd tfm/`
    2. `npm install`
3. Install **bower**:
    1. `cd public/`
    2. `npm install -g bower`
    3. `bower install`
    4. `cd ..`
4. Run: `/usr/bin/node bin/www`. Make sure that 80 is the used port at
 bin/www (the default one is 3000).