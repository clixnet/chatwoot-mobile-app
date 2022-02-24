import PushNotificationIOS from '@react-native-community/push-notification-ios'
import Voip from 'react-native-voip-push-notification'
import RNCallKeep from 'react-native-callkeep'

const onVoipToken = (t) => console.log(t)

const initApp = () => {}
const onNotification = n => console.log(n)

Voip.addEventListener('register', onVoipToken)
Voip.addEventListener('notification', (n) => onNotification(n, initApp))
Voip.addEventListener(
  'didLoadWithEvents',
  (e) => {
    if (!e?.length) {
      return
    }
    e.forEach(({ name, data }) => {
      if (name === Voip.RNVoipPushRemoteNotificationsRegisteredEvent) {
        if (typeof data === 'string') {
          onVoipToken(data)
        }
      } else if (name === Voip.RNVoipPushRemoteNotificationReceivedEvent) {
        onNotification(data, initApp)
      }
    })
  },
)
Voip.registerVoipToken()

PushNotificationIOS.requestPermissions().then(() => {
  console.log('PushNotificationIOS.requestPermissions successfully')
}).catch(err => {
  console.error(err)
})

RNCallKeep.setup({
  ios: {
    appName: 'Conversate',
    // https://github.com/react-native-webrtc/react-native-callkeep/issues/193
    // https://github.com/react-native-webrtc/react-native-callkeep/issues/181
    supportsVideo: false,
  },
}).then(() => {
  console.log('RNCallKeep setup successfully')
}).catch(err => {
  console.error(err)
})
