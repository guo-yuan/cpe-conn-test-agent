#! /bin/bash

sudo node cpe-conn-test-agent -k ./certs/private.pem.key -c ./certs/device.pem.crt -i ubuntu-vpc -a ./certs/Amazon-root-CA-1.pem -H a1be8p39z8xzwv-ats.iot.ap-southeast-2.amazonaws.com -p 8883 -T RaspberryPi --test-mode 1 -D
