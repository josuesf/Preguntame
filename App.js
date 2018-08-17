import React, { Component } from 'react';
import { TextInput, StyleSheet, Text, View, TouchableOpacity, Alert, AsyncStorage } from 'react-native';
import appConfig from './app.json';
import { StackNavigator } from "react-navigation";
import Chat from "./src/screens/Chat";
import Register from './src/screens/Register'
import Home from './src/screens/Home'
import Amigos from './src/screens/Amigos'
import { asyncFetch } from './src/utils/fetchData'
import realm from './src/bdrealm/realm'
import SocketIOClient from 'socket.io-client';
import FCMModule  from './src/NativeModules/FCMModule' 
class Main extends Component {

  constructor(props) {
    super(props);
    if (!global.socket)
      global.socket = SocketIOClient('http://192.168.1.6:8080');//http://192.168.1.6:8080 //https://que5node.herokuapp.com/
    this.state = {
      senderId: appConfig.senderID
    };
    global.socket.on('connect', () => {
      console.log('Wahey -> connected!');
      AsyncStorage.getItem('USUARIO', (err, res) => {
        if (err) {

        } else if (res != null || res != undefined) {
          global.username = JSON.parse(res).usuario
          global.socket.emit('online', global.username)
          // this.EnviarMensajesGuardados()
        }
      })
    });
    global.socket.on('disconnect', (reason) => {
      global.socket = SocketIOClient('http://192.168.1.6:8080');
    });
    global.currentScreen = 'Main'
    
    global.socket.off('new_message')
    global.socket.off('status_message')
    global.socket.on('new_message', (p) => {
      let estado_mensaje = global.currentScreen == ("Chat#" + p.id_e) ? 'visto' : 'entregado'

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
          estado_mensaje,
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
      global.socket.emit('status_message', msg)
      // if (global.currentScreen != "Chat#" + p.id_e) {
      //   this.notif.cancelAll()
      //   let mensajes = realm.objects('ChatList').filtered('estado_mensaje=="entregado" or estado_mensaje=="recibido"')
      //   let title = "Slit"
      //   let mensaje = "Tienes " + mensajes.length + " mensajes"
      //   if (mensajes.length == 1) {
      //     title = p.id_e
      //     mensaje = mensajes[0].mensaje
      //   }
      //   //this.notif.localNotif(title, mensaje, p.id_e, "", "", mensajes.length)
      // }
    });
    global.socket.on('status_message', (p) => {
      // console.log(p)
      realm.write(() => {
        realm.create('ChatList', {
          id_mensaje: p.id_mensaje,
          estado_mensaje: p.estado_mensaje,
        }, true);
        let mensaje = realm.objects('Chats').filtered('id_mensaje="' + p.id_mensaje + '"')
        //console.log(mensaje[0].id_chat)
        if (mensaje.length > 0) {
          realm.create('Chats', { id_chat: mensaje[0].id_chat, estado_mensaje: p.estado_mensaje }, true);
        }
      })
    });

  }
  EnviarMensajesGuardados() {
    const mensajes_guardados = realm.objects('ChatList').filtered('estado_mensaje="pendiente"').sorted('timestamp')
    for (var i = 0; i < mensajes_guardados.length; i++) {
      var id_mensaje = mensajes_guardados[i].id_mensaje
      global.socket.emit('new_message', mensajes_guardados[i])
    }
    const mensajes_recibidos = realm.objects('ChatList').filtered('estado_mensaje!="visto_fin" and id_r="' + global.username + '"').sorted('timestamp')
    //console.log('estado_mensaje="entregado" and id_r="'+global.username+'"',mensajes_recibidos.length)
    for (var j = 0; j < mensajes_recibidos.length; j++) {
      var p = mensajes_recibidos[j]
      let msg = {}
      msg.id_mensaje = p.id_mensaje
      msg.estado_mensaje = p.estado_mensaje
      global.socket.emit('status_message', msg)
    }
  }
  componentWillMount() {
    console.log(FCMModule.TOKEN)
    AsyncStorage.getItem('USUARIO', (err, res) => {
      if (err) {
        this.props.navigation.navigate('register', { token:FCMModule.TOKEN })
      } else if (res != null || res != undefined) {
        global.username = JSON.parse(res).usuario
        global.socket.emit('online', global.username)
        asyncFetch('/ws/get_all_message', 'POST', { id_usuario: JSON.parse(res).usuario }, (res) => {

          if (res.respuesta == 'ok') {
            let pendientes = res.data.pendientes;

            let entregados_vistos = res.data.entregados_vistos;


            for (let p of pendientes) {
              let estado_mensaje = global.currentScreen == ("Chat#" + p.id_e) ? 'visto' : 'entregado'
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
              global.socket.emit('status_message', msg)
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
        this.props.navigation.replace('home')
      } else {
        this.props.navigation.navigate('register', { token:FCMModule.TOKEN })
        // this.notif.configure(this.onRegister.bind(this), this.onNotif.bind(this), this.state.senderId)
      }

    })
  }

  componentDidMount() {

  }
  render() {
    return (
      <View style={styles.container}>
        {/* <Text style={styles.title}>Example app react-native-push-notification</Text>
        <View style={styles.spacer}></View>
        <TextInput style={styles.textField} value={this.state.registerToken} placeholder="Register token" />
        <View style={styles.spacer}></View>

        <TouchableOpacity style={styles.button} onPress={() => { this.notif.localNotif() }}><Text>Local Notification (now)</Text></TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => { this.notif.scheduleNotif() }}><Text>Schedule Notification in 30s</Text></TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => { this.notif.cancelNotif() }}><Text>Cancel last notification (if any)</Text></TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => { this.notif.cancelAll() }}><Text>Cancel all notifications</Text></TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => { this.notif.checkPermission(this.handlePerm.bind(this)) }}><Text>Check Permission</Text></TouchableOpacity>

        <View style={styles.spacer}></View>
        <TextInput style={styles.textField} value={this.state.senderId} onChangeText={(e) => {this.setState({ senderId: e })}} placeholder="GCM ID" />
        <TouchableOpacity style={styles.button} onPress={() => { this.notif.configure(this.onRegister.bind(this), this.onNotif.bind(this), this.state.senderId) }}><Text>Configure Sender ID</Text></TouchableOpacity>
        {this.state.gcmRegistered && <Text>GCM Configured !</Text>}

        <View style={styles.spacer}></View> */}
      </View>
    );
  }

  onRegister(token) {
    //Alert.alert("Registered !", JSON.stringify(token));
    console.log(token);
    this.setState({ registerToken: token.token, gcmRegistered: true });
    this.props.navigation.navigate('register', { token: token.token })
  }

  onNotif(notif) {
    console.log(notif);
    Alert.alert(notif.title, notif.message);
  }

  handlePerm(perms) {
    Alert.alert("Permissions", JSON.stringify(perms));
  }
}

export default StackNavigator(
  {
    // login:{
    //   screen: Login,
    // },
    register: {
      screen: Register
    },
    home: {
      screen: Home,
    },
    // preguntas_con:{
    //   screen:PreguntasCon
    // },
    // pregunta:{
    //   screen:Pregunta
    // },
    amigos: {
      screen: Amigos
    },
    // notifications:{
    //   screen:AppNotifications
    // },
    chat: {
      screen: Chat
    },
    main: {
      screen: Main
    }
    //Aqui ingresas tus screens
  },
  {
    initialRouteName: 'main',
    //headerMode: 'none',
    /*
   * Use modal on iOS because the card mode comes from the right,
   * which conflicts with the drawer example gesture
   */
  });
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  button: {
    borderWidth: 1,
    borderColor: "#000000",
    margin: 5,
    padding: 5,
    width: "70%",
    backgroundColor: "#DDDDDD",
    borderRadius: 5,
  },
  textField: {
    borderWidth: 1,
    borderColor: "#AAAAAA",
    margin: 5,
    padding: 5,
    width: "70%"
  },
  spacer: {
    height: 10,
  },
  title: {
    fontWeight: "bold",
    fontSize: 20,
    textAlign: "center",
  }
});