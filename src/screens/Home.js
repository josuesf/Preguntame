/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
    StyleSheet,
    View,
    Text,
    Image,
    TouchableOpacity,
    StatusBar,
    DeviceEventEmitter,
    FlatList,
    AppState,
} from 'react-native';
import IconMaterial from 'react-native-vector-icons/MaterialCommunityIcons';
// import realm from '../bdrealm/realm'
import FCMModule from '../NativeModules/FCMModule'
import { asyncFetch, fetchNode } from '../utils/fetchData'
import RealmModule from '../NativeModules/RealmModule'
import ChatMessage from '../components/ChatMessage'
import SocketIOClient from 'socket.io-client';
export default class Home extends Component {

    static navigationOptions = ({ navigation }) => {
        return {
            title: "@" + navigation.state.params.mi_usuario,
            headerTintColor: 'white',
            headerStyle: {
                backgroundColor: '#7e5682'
            },
        };
    };
    constructor() {
        super()
        console.ignoredYellowBox = [
            'Setting a timer'
        ];
        if (!global.socket || global.socket.disconnected){
            global.socket = SocketIOClient('https://que5node.herokuapp.com');//http://192.168.1.6:8080 //https://que5node.herokuapp.com/
            global.socket.emit('online', global.username)
        }
        global.currentScreen = 'Home'
        this.state = {
            pagina: 'home',
            chats: [],
            usuario_propietario: global.username,
            appState: AppState.currentState
        }
        this.messagedReceivedListener = DeviceEventEmitter.addListener('messagedReceived', (data) => {
            this.actualizarChats()
        })
        global.socket.on('disconnect',(reason)=>{
            global.socket = SocketIOClient('https://que5node.herokuapp.com');//http://192.168.1.6:8080 //https://que5node.herokuapp.com/
            global.socket.emit('online', global.username)
        })
    }
    componentWillMount() {
        FCMModule.cancelAllLocalNotifications()
        this.actualizarChats()
    }
    componentDidMount() {
        AppState.addEventListener('change', this._handleAppStateChange);
    }
    actualizarChats = () => {
        RealmModule.getChats({}, (chats) => {
            this.setState({ chats })
        }, (err) => [])
    }
    componentWillUnmount() {
        this.desconectarUsuario()
        // this.messagedReceivedListener.remove()
        AppState.removeEventListener('change', this._handleAppStateChange);
    }
    desconectarUsuario = () => {
        asyncFetch('/ws/set_last_connected', 'POST', { usuario: global.username, fecha: new Date() })
        global.socket.disconnect()
    }
    _handleAppStateChange = (nextAppState) => {
        if (this.state.appState.match(/inactive|background/) && nextAppState === 'active') {
            console.log('App has come to the foreground!')
            this.actualizarChats()
            
            if (!global.socket || global.socket.disconnected){
                global.socket = SocketIOClient('https://que5node.herokuapp.com');//http://192.168.1.6:8080 //https://que5node.herokuapp.com/
                global.socket.emit('online', global.username)
            }
        }
        if (nextAppState == 'background') {
            this.desconectarUsuario()
            global.socket.disconnect()
        }
        console.log(nextAppState)
        this.setState({ appState: nextAppState });
    }
    _keyExtractor = (item, index) => item.id_mensaje;
    render() {
        const { navigate } = this.props.navigation;
        const { usuario_propietario, chats } = this.state

        return (
            <View style={styles.container}>
                <StatusBar
                    backgroundColor="#604263"
                    barStyle="light-content"
                />
                {/* <View style={{
                    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16,
                    height: 50, backgroundColor: '#7E5682', marginBottom: 10, justifyContent: 'center'
                }}>
                    <Image source={require('../img/Slit.png')} resizeMode="stretch" style={{ height: 40, width: 50 }} />

                </View> */}
                {this.state.pagina == 'home' && <View style={styles.contenido}>

                    <TouchableOpacity onPress={() => navigate('amigos')} activeOpacity={0.7}
                        style={{ paddingVertical: 5, paddingHorizontal: 10, borderRadius: 5, backgroundColor: '#7E5682', flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={{ color: '#FFF', flex: 1, fontWeight: 'bold' }}>Nuevo Mensaje</Text>
                        <IconMaterial name="chevron-right" size={35} color="#FFF" />
                    </TouchableOpacity>
                    <FlatList
                        data={chats}
                        keyExtractor={this._keyExtractor}
                        renderItem={({ item }) => (<ChatMessage navigation={this.props.navigation} message={item} mi_usuario={usuario_propietario} />)}
                    />

                </View>}
                {this.state.pagina == 'friends' && <View style={styles.contenido}>
                    <View activeOpacity={0.7} style={{ padding: 10, borderRadius: 5, backgroundColor: '#C7E2DF', flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={{ color: '#008577', flex: 1, fontWeight: 'bold' }}>Pregunta algo, anonimamente</Text>
                        <IconMaterial name="help" size={35} color="#008577" />
                    </View>
                    <View style={{ marginVertical: 20 }}>
                        <View activeOpacity={0.6} style={{ paddingVertical: 10 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>

                                <Text style={{ flex: 1, color: '#A4A4A4' }}>¿Qué superpoder tendrías?</Text>
                                <TouchableOpacity style={{ borderRadius: 5, backgroundColor: '#02C39A', alignItems: 'center' }}>
                                    <Text style={{ color: '#F0F3BD', padding: 5, fontSize: 12, fontWeight: 'bold' }}>Responder</Text>
                                </TouchableOpacity>
                            </View>
                            <View style={{ height: 1, backgroundColor: '#E1DADF', marginTop: 5 }} />
                        </View>
                        <View activeOpacity={0.6} style={{ paddingVertical: 10 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>

                                <Text style={{ flex: 1, color: '#A4A4A4' }}>Si sólo pudieras tener un hobby, ¿cuál sería?</Text>
                                <TouchableOpacity style={{ borderRadius: 5, backgroundColor: '#02C39A', alignItems: 'center' }}>
                                    <Text style={{ color: '#F0F3BD', padding: 5, fontSize: 12, fontWeight: 'bold' }}>Responder</Text>
                                </TouchableOpacity>
                            </View>
                            <View style={{ height: 1, backgroundColor: '#E1DADF', marginTop: 5 }} />
                        </View>
                    </View>

                </View>}
                {/* <View style={styles.bottomNav}>
                    <View style={{ borderTopColor: '#7E5682', borderTopWidth: 1, borderTopColor: '#E8E8E8', paddingVertical: 5, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 10, marginBottom: 10 }}>
                        
                        <TouchableOpacity style={{ alignItems: 'center', flex: 1 }} onPress={() => this.setState({ pagina: 'home' })}>
                            <IconMaterial name="home" size={35} color={this.state.pagina == 'home' ? "#7E5682" : "#D9D9D9"} />
                            <Text style={{ color: this.state.pagina == 'home' ? "#7E5682" : "#AFAEAE", fontSize: 10 }}>Inicio</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={{ alignItems: 'center', flex: 1 }} onPress={() => this.setState({ pagina: 'friends' })}>
                            <IconMaterial name="checkbox-multiple-blank-circle-outline" size={35} color={this.state.pagina == 'friends' ? "#7E5682" : "#AFAEAE"} />
                            <Text style={{ color: this.state.pagina == 'friends' ? "#7E5682" : "#AFAEAE", fontSize: 10 }} >Preguntas</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={{ alignItems: 'center', flex: 1 }}>
                            <IconMaterial name="account" size={35} color="#AFAEAE" />
                            <Text style={{ color: this.state.pagina == 'profile' ? "#7E5682" : "#AFAEAE", fontSize: 10 }}>Perfil</Text>
                        </TouchableOpacity>
                    </View>
                </View> */}

            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',

    },
    contenido: {
        marginHorizontal: 16,
        marginVertical: 20
    },
    bottomNav: {
        flex: 1,
        position: 'absolute',
        bottom: 0,
        right: 0,
        left: 0,
        height: 60,
        alignItems: 'center',
        justifyContent: 'center',

    }
});