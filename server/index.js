require('dotenv/config')

const { RelayConsumer } = require('@signalwire/node')
const { Notification, Provider } = require('apn')

// apns target device token from my iPhone, hard code for testing now
const targetDeviceToken = '22473b92bda350375146fa61484942b3f9cdde5a8185d232d5fd5a4d1460e1b7'

// APNS config
const apnsKey = process.env.APNS_KEY
const apnsKeyId = process.env.APNS_KEY_ID
const apnsTeamId = process.env.APNS_TEAM_ID
const apnsProd = false

// Signalwire Relay config
const signalwireProjectId = process.env.SIGNALWIRE_PROJECT_ID
const signalwireProjectToken = process.env.SIGNALWIRE_PROJECT_TOKEN
const signalwireContexts = ['nam']

// check if all config supplied
const allConfig = {
  apnsKey,
  apnsKeyId,
  apnsTeamId,
  signalwireProjectId,
  signalwireProjectToken,
}
Object.keys(allConfig).forEach(k => {
  if (!allConfig[k]) {
    console.error(`Missing config ${k}, please supply all config via .env`)
    process.exit(1)
  }
})

const apns = new Provider({
  token: {
    key: apnsKey,
    keyId: apnsKeyId,
    teamId: apnsTeamId,
  },
  production: apnsProd,
})

const alreadyHandled = {}

const consumer = new RelayConsumer({
  project: signalwireProjectId,
  token: signalwireProjectToken,
  contexts: signalwireContexts,
  ready: () => {
    console.log('Signalwire Relay client is ready')
  },
  onIncomingCall: (call) => {
    if (alreadyHandled[call.id]) {
      console.log(`Already handled call id=${call.id} state=${call.state}`)
      return
    }
    console.log('got incoming call:')
    console.log(call)
    sendNotifcation()
    // TODO forward call to react native app
  }
})

consumer.run()

const sendNotifcation = () => {
  const n = new Notification()
  // call push notification should be expired after 1m
  n.expiry = Math.floor(Date.now() / 1000) + 60
  n.topic = 'com.conversateapp.app.voip'
  n.pushType = 'voip'
  n.alert = 'Receive incoming call from Signalwire'

  apns.send(n, targetDeviceToken).then(() => {
    console.log('send voip push notification successfully')
  }).catch(err => {
    console.error(err)
  })
}
