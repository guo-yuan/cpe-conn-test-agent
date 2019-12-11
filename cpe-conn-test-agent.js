/*
 * Raspberry Pi as an AWS IoT thing to execute connectivity tests as a CPE device.
 *
 * Credit to AWS SDK example code.
 */

//node.js deps

//npm deps

//app deps
const deviceModule = require('aws-iot-device-sdk').device;
const cmdLineProcess = require('./lib/cmdline');
require('log-timestamp');

//begin module

function processTest(args) {
   //
   // The device module exports an MQTT instance, which will attempt
   // to connect to the AWS IoT endpoint configured in the arguments.
   // Once connected, it will emit events which our application can
   // handle.
   //

   const device = deviceModule({
      keyPath: args.privateKey,
      certPath: args.clientCert,
      caPath: args.caCert,
      clientId: args.clientId,
      region: args.region,
      baseReconnectTimeMs: args.baseReconnectTimeMs,
      keepalive: args.keepAlive,
      protocol: args.Protocol,
      port: args.Port,
      host: args.Host,
      debug: args.Debug
   });

   var topicRequest = 'tch/au/cts/test/cpe/connect/request';
   var topicOutcome = 'tch/au/cts/test/cpe/connect/outcome';

   console.log('process test starts.');

   device.subscribe(topicRequest);

   //
   // Do a simple publish/subscribe demo based on the test-mode passed
   // in the command line arguments.  If test-mode is 1, subscribe to
   // 'topic_1' and publish to 'topic_2'; otherwise vice versa.  Publish
   // a message every four seconds.
   //
   device
      .on('connect', function() {
         console.log('connect');
      });
   device
      .on('close', function() {
         console.log('close');
      });
   device
      .on('reconnect', function() {
         console.log('reconnect');
      });
   device
      .on('offline', function() {
         console.log('offline');
      });
   device
      .on('error', function(error) {
         console.log('error', error);
      });
   device
      .on('message', function(topic, payload) {
         console.log('Received message from:', topic, payload.toString());

         var msg = JSON.parse(payload.toString());
         var outcome = {
            'request': 'unsupported',
            'target': 'unspecified',
            'result': 'not executed'
         };

         if (msg.request === 'ping') {
            var ping = require('net-ping');
            var options = {
               networkProtocol: ping.NetworkProtocol.IPv4,
               packetSize: 16,
               retries: 2,
               sessionId: (process.pid % 65535),
               timeout: 2000,
               ttl: 128
            };
            var session = ping.createSession(options);

            console.log('Starting ping test');
            outcome.request = 'ping';
            outcome.target = msg.target;

            session.pingHost(msg.target, function(error, target) {
               if (error) {
                  console.log('ping ' + target + ' failed: ' + error.toString());
                  console.log('outcome published.\n');
                  outcome.result = 'failed';
                  device.publish(topicOutcome, JSON.stringify(outcome));
               } else {
                  console.log('ping ' + target + ' succeed.');
                  console.log('outcome published.\n');
                  outcome.result = 'succeed';
                  device.publish(topicOutcome, JSON.stringify(outcome));
               }
            });
         } else {
            console.log('Unsupported request');
            device.publish(topicOutcome, JSON.stringify(outcome));
         }
      });
}

module.exports = cmdLineProcess;

if (require.main === module) {
   cmdLineProcess('subscribe CPE test requests, execute and publish outcome using AWS IoT service.',
      process.argv.slice(2), processTest);
}
