DEPLOYMENT STEPS
================

1. For convenience, rename the project's root directory:
`mv TFM/ tfm`
2. Install **node**: `sudo apt-get install node`
3. Install **npm** and the project's dependencies:
    1. `sudo apt-get install npm`
    2. `cd tfm/`
    3. `npm install`
4. Install **bower** and the public dependencies:
    1. `cd public/`
    2. `npm install -g bower`
    3. `bower install`
    4. `cd ..`
5. Run: `/usr/bin/node bin/www`. Make sure that 80 is the used port at
 bin/www (the default one is 3000).