import PushNotification from 'react-native-push-notification';
import { AsyncStorage } from 'react-native'
import realm from './src/bdrealm/realm'
import { asyncFetch, fetchData } from './src/utils/fetchData'
import SocketIOClient from 'socket.io-client';
export default class NotifService {

  constructor(onRegister, onNotification) {
    this.configure(onRegister, onNotification);

    this.lastId = 0;
  }

  configure(onRegister, onNotification, gcm = "") {
    PushNotification.configure({
      // (optional) Called when Token is generated (iOS and Android)
      onRegister: onRegister, //this._onRegister.bind(this),

      // (required) Called when a remote or local notification is opened or received
      onNotification:  (notif) => {
        
        console.log('NOTIFICATION:', notif);
        this.cancelAll()
        // if (!this.socket)
        //   this.socket = SocketIOClient('http://192.168.1.6:8080');//http://192.168.1.6:8080 //https://que5node.herokuapp.com/
        // // process the notification
        // this.socket.on('connect', () => {
        //   console.log('Wahey -> connected! Notifi');
        //   AsyncStorage.getItem('USUARIO', (err, res) => {
        //     if (err) {

        //     } else if (res != null || res != undefined) {
        //       this.socket.emit('online', JSON.parse(res).usuario)
        //       this.EnviarMensajesGuardados()
        //       this.recuperarMensajes(JSON.parse(res).usuario)
        //     }
        //   })
        // });
        // required on iOS only (see fetchCompletionHandler docs: https://facebook.github.io/react-native/docs/pushnotificationios.html)
        //notification.finish(PushNotificationIOS.FetchResult.NoData);
      }, //this._onNotification,

      // ANDROID ONLY: GCM Sender ID (optional - not required for local notifications, but is need to receive remote push notifications)
      senderID: gcm,

      // IOS ONLY (optional): default: all - Permissions to register.
      permissions: {
        alert: true,
        badge: true,
        sound: true
      },

      // Should the initial notification be popped automatically
      // default: true
      popInitialNotification: true,

      /**
        * (optional) default: true
        * - Specified if permissions (ios) and token (android and ios) will requested or not,
        * - if not, you must call PushNotificationsHandler.requestPermissions() later
        */
      requestPermissions: true,
    });
  }
  EnviarMensajesGuardados(usuario) {
    const mensajes_guardados = realm.objects('ChatList').filtered('estado_mensaje="pendiente"').sorted('timestamp')
    for (var i = 0; i < mensajes_guardados.length; i++) {
      var id_mensaje = mensajes_guardados[i].id_mensaje
      this.socket.emit('new_message', mensajes_guardados[i])
    }
    const mensajes_recibidos = realm.objects('ChatList').filtered('estado_mensaje!="visto_fin" and id_r="' + usuario + '"').sorted('timestamp')

    for (var j = 0; j < mensajes_recibidos.length; j++) {
      var p = mensajes_recibidos[j]
      let msg = {}
      msg.id_mensaje = p.id_mensaje
      msg.estado_mensaje = p.estado_mensaje
      this.socket.emit('status_message', msg)
    }
  }
  recuperarMensajes(usuario) {
    asyncFetch('/ws/get_all_message', 'POST', { id_usuario: usuario }, (res) => {

      if (res.respuesta == 'ok') {
        let pendientes = res.data.pendientes;

        let entregados_vistos = res.data.entregados_vistos;


        for (let p of pendientes) {
          let estado_mensaje = 'entregado'
          realm.write(() => {
            realm.create('ChatList', {
              id_chat: p.id_e,
              id_r: p.id_r,
              id_e: p.id_e,
              id_g: '' + p.id_g,
              id_mensaje: p.id_mensaje,
              mensaje: p.mensaje,
              tipo_mensaje: p.tipo_mensaje,
              timestamp: p.timestamp,
              estado_mensaje: estado_mensaje,
            }, true);
            realm.create('Chats', {
              id_chat: p.id_e,
              id_r: p.id_r,
              id_e: p.id_e,
              id_g: '' + p.id_g,
              id_mensaje: p.id_mensaje,
              ultimo_mensaje: p.mensaje,
              timestamp: p.timestamp,
              avatar: p.avatar || '',
              estado_mensaje: estado_mensaje,
              tipo_mensaje: p.tipo_mensaje,
            }, true);
          })
          let msg = {}
          msg.id_mensaje = p.id_mensaje
          msg.estado_mensaje = estado_mensaje
          this.socket.emit('status_message', msg)
        }
        for (let e of entregados_vistos) {
          realm.write(() => {
            realm.create('ChatList', {
              id_mensaje: e.id_mensaje,
              estado_mensaje: e.estado_mensaje,
            }, true);
            let mensaje = realm.objects('Chats').filtered('id_mensaje="' + e.id_mensaje + '"')
            //console.log(mensaje[0].id_chat)
            if (mensaje.length > 0) {
              realm.create('Chats', { id_chat: mensaje[0].id_chat, estado_mensaje: e.estado_mensaje }, true);
            }
          })
        }

      }
    })
  }
  localNotif(title, message, tag, subText, bigText, number) {
    PushNotification.localNotification({
      /* Android Only Properties */
      id: '' + this.lastId, // (optional) Valid unique 32 bit integer specified as string. default: Autogenerated Unique ID
      ticker: "My Notification Ticker", // (optional)
      autoCancel: true, // (optional) default: true
      largeIcon: "ic_launcher", // (optional) default: "ic_launcher"
      smallIcon: "ic_notification", // (optional) default: "ic_notification" with fallback for "ic_launcher"
      bigText,//: "My big text that will be shown when notification is expanded", // (optional) default: "message" prop
      subText, // (optional) default: none
      color: "red", // (optional) default: system default
      vibrate: true, // (optional) default: true
      vibration: 2000, // vibration length in milliseconds, ignored if vibrate=false, default: 1000
      tag: tag, // (optional) add tag to message
      group: "group", // (optional) add group to message
      ongoing: false, // (optional) set whether this is an "ongoing" notification

      /* iOS only properties */
      alertAction: 'view', // (optional) default: view
      category: null, // (optional) default: null
      userInfo: null, // (optional) default: null (object containing additional notification data)

      /* iOS and Android properties */
      title: title, // (optional)
      message: message, // (required)
      playSound: false, // (optional) default: true
      soundName: 'default', // (optional) Sound to play when the notification is shown. Value of 'default' plays the default sound. It can be set to a custom sound such as 'android.resource://com.xyz/raw/my_sound'. It will look for the 'my_sound' audio file in 'res/raw' directory and play it. default: 'default' (default sound is played)
      number, // (optional) Valid 32 bit integer specified as string. default: none (Cannot be zero)
      //actions: '["Yes", "No"]',  // (Android only) See the doc for notification actions to know more
    });

    this.lastId++;
  }

  scheduleNotif() {
    PushNotification.localNotificationSchedule({
      date: new Date(Date.now() + (30 * 1000)), // in 30 secs

      /* Android Only Properties */
      id: '' + this.lastId, // (optional) Valid unique 32 bit integer specified as string. default: Autogenerated Unique ID
      ticker: "My Notification Ticker", // (optional)
      autoCancel: true, // (optional) default: true
      largeIcon: "ic_launcher", // (optional) default: "ic_launcher"
      smallIcon: "ic_notification", // (optional) default: "ic_notification" with fallback for "ic_launcher"
      bigText: "My big text that will be shown when notification is expanded", // (optional) default: "message" prop
      subText: "This is a subText", // (optional) default: none
      color: "blue", // (optional) default: system default
      vibrate: true, // (optional) default: true
      vibration: 300, // vibration length in milliseconds, ignored if vibrate=false, default: 1000
      tag: 'some_tag', // (optional) add tag to message
      group: "group", // (optional) add group to message
      ongoing: false, // (optional) set whether this is an "ongoing" notification

      /* iOS only properties */
      alertAction: 'view', // (optional) default: view
      category: null, // (optional) default: null
      userInfo: null, // (optional) default: null (object containing additional notification data)

      /* iOS and Android properties */
      title: "Scheduled Notification", // (optional)
      message: "My Notification Message", // (required)
      playSound: true, // (optional) default: true
      soundName: 'default', // (optional) Sound to play when the notification is shown. Value of 'default' plays the default sound. It can be set to a custom sound such as 'android.resource://com.xyz/raw/my_sound'. It will look for the 'my_sound' audio file in 'res/raw' directory and play it. default: 'default' (default sound is played)
    });

    this.lastId++;
  }

  checkPermission(cbk) {
    return PushNotification.checkPermissions(cbk);
  }

  cancelNotif() {
    PushNotification.cancelLocalNotifications({ id: '' + this.lastId });
  }

  cancelAll() {
    PushNotification.cancelAllLocalNotifications();
  }
}