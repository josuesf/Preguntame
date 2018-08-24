import React, { Component } from 'react';
import { StyleSheet, View, AsyncStorage, Text, StatusBar, ActivityIndicator } from 'react-native';
import { StackNavigator } from "react-navigation";
import Chat from "./src/screens/Chat";
import Register from './src/screens/Register'
import Home from './src/screens/Home'
import Amigos from './src/screens/Amigos'
// import { asyncFetch } from './src/utils/fetchData'
//import realm from './src/bdrealm/realm'

import FCMModule from './src/NativeModules/FCMModule'
import LoginUsuario from './src/screens/LoginUsuario';
import RealmModule from './src/NativeModules/RealmModule'
class Main extends Component {

  constructor(props) {
    super(props);
    

    this.state = {

    };
  }
  static navigationOptions = {

    headerTintColor: 'white',
    headerStyle: {
      backgroundColor: '#7e5682'
    },
  };
  componentWillMount() {
    console.log("TOKEN :"+FCMModule.TOKEN)
    AsyncStorage.getItem('USUARIO', (err, res) => {
      if (res != null || res != undefined) {
        RealmModule.setUser({
          username: JSON.parse(res).usuario,
          email: JSON.parse(res).email,
          token_fcm: FCMModule.TOKEN
        }, (respuesta) => console.log(respuesta), (err) => console.log(err))
        global.username = JSON.parse(res).usuario
        
        this.props.navigation.replace('home',{mi_usuario:global.username})
      } else {
        this.intervalToken = setInterval(() => {
          FCMModule.getToken((token) => {
            if (token != undefined && token != null) {
              clearInterval(this.intervalToken)
              this.props.navigation.replace('register', { token })
            }
          })
        }, 1000)
      }
    })

  }

  componentDidMount() {

  }
  render() {
    return (
      <View style={styles.container}>
        <StatusBar
          backgroundColor="#604263"
          barStyle="light-content"
        />
        <ActivityIndicator color="white" size="large" />
        <Text style={{ color: '#FFF', fontWeight: 'bold', marginTop: 10 }}>Recuperando Token</Text>
      </View>
    );
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
    },
    login_user: {
      screen: LoginUsuario
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
    backgroundColor: '#7e5682',
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