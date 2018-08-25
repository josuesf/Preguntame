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
    TextInput,
    DeviceEventEmitter,
    FlatList,
    KeyboardAvoidingView,
    AppState,
    ActivityIndicator,
} from 'react-native';
import IconMaterial from 'react-native-vector-icons/MaterialCommunityIcons';
// import realm from '../bdrealm/realm'
import { asyncFetch, fetchNode } from '../utils/fetchData'
import RealmModule from '../NativeModules/RealmModule'
import Message from '../components/Message'


export default class Chat extends Component {
    static navigationOptions = {
        title: "@usuario",
        headerTintColor: 'white',
        headerStyle: {
            backgroundColor: '#7e5682'
        },
        header: null
    };
    constructor(props) {
        super(props)
        console.ignoredYellowBox = [
            'Setting a timer'
        ];
        this.state = {
            id_usuario: global.username,
            mensajes: [],
            chat_con: props.navigation.state.params.usuario,
            estado_usuario: '',
            mensaje: "",
            appState: AppState.currentState,
            pagina: 15,
            nroMensajes: 15,
            cargando_mensaje: true,
            modo_seleccion: false
        }
        global.currentScreen = 'Chat#' + props.navigation.state.params.usuario
        global.socket.off('escribiendo')
        this.messagedReceivedListener = DeviceEventEmitter.addListener('messagedReceived', this.newMessageReceived)
    }
    componentWillMount() {
        this.EnviarMensajesGuardados()
        this.EnviarMensajesVistos({ id_chat: this.props.navigation.state.params.usuario })
        this.ActualizarMensajes()
        this.recuperarUltimaHora()
    }
    componentDidMount() {
        global.socket.on('escribiendo', (data) => {
            console.log(data.id_e, this.state.chat_con)
            if (data.id_e == this.state.chat_con) {
                this.setState({ estado_usuario: 'escribiendo...' })
                setTimeout(() => {
                    this.recuperarUltimaHora()
                }, 3000)
            }
        })

        this.intervalUltimavez = setInterval(this.recuperarUltimaHora, 3000)
        AppState.addEventListener('change', this._handleAppStateChange);
    }
    newMessageReceived = (newMessage) => {
        console.log("nuevos mensajes")
        if (this.state.chat_con == newMessage.id_chat) {
            this.setState({ mensajes: [newMessage, ...this.state.mensajes] });
            if (global.currentScreen == 'Chat#' + this.props.navigation.state.params.usuario)
                this.EnviarMensajesVistos({ id_chat: this.props.navigation.state.params.usuario })
            this.EnviarMensajesGuardados()
        }
    }
    recuperarUltimaHora = () => {
        fetchNode('/ws/get_estado_usuario', 'POST', { id_usuario: this.props.navigation.state.params.usuario }, (res, err) => {
            // console.log('ultimavez', res)
            if (!err) {
                if (res.estado != 'en linea') {
                    let fecha = new Date(res.estado)
                    let hoy = new Date()

                    var mes = fecha.getMonth() + 1
                    var dia = fecha.getDate()
                    var hora = fecha.getHours()
                    var minutos = fecha.getMinutes()
                    let fechaFormat = 'hoy a las ' + (hora > 9 ? hora : '0' + hora) + ':' + (minutos > 9 ? minutos : '0' + minutos)
                    if (dia != hoy.getDate()) {
                        fechaFormat = (dia > 9 ? dia : '0' + dia) + '-' + (mes > 9 ? mes : '0' + mes) + '-' + fecha.getFullYear() + ' a las ' + (hora > 9 ? hora : '0' + hora) + ':' + (minutos > 9 ? minutos : '0' + minutos)
                    }

                    this.setState({ estado_usuario: 'Ultima vez ' + fechaFormat })
                }
                else {
                    this.setState({ estado_usuario: res.estado })
                }
            }
        })
    }
    _handleAppStateChange = (nextAppState) => {
        if (this.state.appState.match(/inactive|background/) && nextAppState === 'active') {
            console.log("Chat..." + 'App has come to the foreground!')
            this.EnviarMensajesGuardados()
            this.EnviarMensajesVistos({ id_chat: this.props.navigation.state.params.usuario })
            this.ActualizarMensajes()
        }
        console.log("Chat..." + nextAppState)
        this.setState({ appState: nextAppState });
    }
    componentWillUnmount() {
        global.currentScreen = 'Home'
        clearInterval(this.intervalUltimavez)
        AppState.removeEventListener('change', this._handleAppStateChange);
    }
    ActualizarMensajes = () => {
        const { chat_con } = this.state
        // console.log(chat_con)
        RealmModule.getMessagesbyUser({ id_chat: chat_con }, (mensajes) => {
            //.slice(0, 10),
            // console.log(mensajes): mensajes.slice(0, 15)

            this.setState({ mensajes, cargando_mensaje: false })
        }, (err) => { console.log(err) })
    }
    escribirMensaje = (text) => {
        if (text.length > this.state.mensaje.length)
            global.socket.emit('escribiendo', { id_r: this.state.chat_con, id_e: this.state.id_usuario })
        this.setState({ mensaje: text })

    }
    EnviarMensaje = () => {
        if (this.state.mensaje.length > 0) {
            let time = Date.now()
            //Crear o Actulizar Chat
            let id_mensaje = this.state.chat_con + this.state.id_usuario + Date.now()
            //Agregar Mensaje
            let new_message = {
                id_chat: this.state.chat_con,
                id_r: this.state.chat_con,
                id_e: this.state.id_usuario,
                id_g: '-1',
                id_mensaje,
                mensaje: this.state.mensaje.trim(),
                tipo_mensaje: 'texto',
                timestamp: time,
                estado_mensaje: 'pendiente',
            }
            console.log(new_message)
            RealmModule.saveMessage(new_message, (message) => { this.ActualizarMensajes() }, (err) => alert(err))
            this.setState({ mensaje: "", no_hay_mensajes: false, pagina: 15 })
            //this.EnviarMensajesGuardados()
            //this.EnviarMensajesGuardados()
            //global.socket.emit('new_message', new_message)
        } else {
            this.setState({ respuestaMensaje: true })
        }
    }
    EnviarMensajesGuardados() {
        //RealmModule.sendPendientes({id_e:this.state.id_usuario})
        RealmModule.sendPendientes({ id_e: this.state.id_usuario }, (data) => console.log(data))
    }
    EnviarMensajesVistos() {
        RealmModule.sendVistos({ id_chat: this.state.chat_con })
    }

    _keyExtractor = (item, index) => item.id_mensaje;
    // onScrollHandler = () => {
    //     const { chat_con, pagina, nroMensajes, no_hay_mensajes } = this.state

    //     if (!no_hay_mensajes) {
    //         this.setState({ cargando_mensaje: true })
    //         // console.log(chat_con)

    //         RealmModule.getMessagesbyUser({ id_chat: chat_con }, (mensajes) => {
    //             //.slice(0, 10),
    //             console.log(pagina,pagina+nroMensajes,mensajes.length,mensajes.slice(pagina, pagina+nroMensajes))
    //             mensajes = mensajes.slice(pagina, pagina+nroMensajes)
    //             if (mensajes.length > 0) {
    //                 console.log('guardando..')
    //                 this.setState({
    //                     mensajes: this.state.mensajes.concat(mensajes),
    //                     pagina: pagina + nroMensajes,
    //                     cargando_mensaje: false
    //                 })
    //             } else {
    //                 console.log('entro aqo')
    //                 this.setState({ no_hay_mensajes: true, cargando_mensaje: false })
    //             }
    //         }, (err) => { console.log(err) })
    //     }
    // }
    Seleccion = (data) => {
       
        this.setState({ 
            modo_seleccion: true,
            messageReply:{
                usuario:data.usuario,
                mensaje:data.mensaje
            }
        })
    }
    render() {
        const { navigate, goBack } = this.props.navigation;
        const { mensajes, id_usuario } = this.state
        return (
            <View style={styles.container}>
                <StatusBar
                    backgroundColor="#604263"
                    barStyle="light-content"
                />
                <View style={{
                    backgroundColor: '#7e5682',
                    paddingHorizontal: 16, paddingTop: 10, paddingBottom: 10, height: 60
                }}>
                    <View style={{ flexDirection: 'row' }}>
                        <TouchableOpacity onPress={() => goBack()} style={{ alignItems: 'center', marginRight: 20 }}>
                            <IconMaterial name="arrow-left" size={25} color="#FFF" />
                        </TouchableOpacity>
                        {this.state.modo_seleccion && <View style={{flex:1}}/>}
                        {this.state.modo_seleccion ? <View>
                            <TouchableOpacity onPress={() => this.setState({respuestaMensaje:true})} style={{ alignItems: 'center', marginRight: 10 }}>
                                <IconMaterial name="reply" size={25} color="#FFF" />
                            </TouchableOpacity>
                        </View> :
                            <View>
                                <Text style={{ color: '#FFF', fontSize: 16, fontWeight: 'bold' }}>Preguntas con {this.state.chat_con}</Text>
                                {this.state.estado_usuario != "" && <Text style={{ color: '#FFF', fontSize: 12 }}>{this.state.estado_usuario}</Text>}
                            </View>
                        }
                    </View>

                </View>
                {this.state.cargando_mensaje && <ActivityIndicator size="large" color="#604263" style={{ paddingVertical: 5 }} />}
                <FlatList
                    data={mensajes}
                    keyExtractor={this._keyExtractor}
                    renderItem={({ item }) => (<Message message={item} 
                                mi_usuario={id_usuario} 
                                Seleccion={this.Seleccion} 
                                modo_seleccion={this.state.modo_seleccion}
                                QuitarSeleccion={()=>this.setState({modo_seleccion:false})} />)}
                    inverted
                    // onEndReached={this.onScrollHandler}
                    onEndThreshold={0}
                />

                {/* <KeyboardAvoidingView behavior="height"> */}

                <View style={styles.footer}>
                    <View style={{ flex: 1, backgroundColor: '#FFF', borderRadius: 20, marginVertical: 5, marginHorizontal: 5 }}>
                        {this.state.respuestaMensaje &&
                            <View style={{
                                borderLeftWidth: 4, borderLeftColor: '#7e5682',
                                margin: 5, backgroundColor: '#EEEEEE', borderRadius: 15, flexDirection: 'row'
                            }}>
                                <View style={{ padding: 10, flex: 1 }}>
                                    <Text style={{ color: '#6B6B6B', fontWeight: 'bold', fontSize: 16, paddingRight: 5 }}>{this.state.messageReply.usuario}</Text>
                                    <Text style={{ color: '#6B6B6B', fontSize: 14, paddingRight: 5 }}>{this.state.messageReply.mensaje}</Text>
                                </View>
                                <TouchableOpacity style={{ alignSelf: 'flex-start', padding: 5 }}
                                    onPress={() => this.setState({ respuestaMensaje: false })}>
                                    <IconMaterial name="close" color="#6B6B6B" />
                                </TouchableOpacity>
                            </View>
                        }

                        <TextInput
                            multiline={true}
                            value={this.state.mensaje}
                            style={styles.input}
                            underlineColorAndroid="transparent"
                            placeholder="Escribe tu mensaje"
                            onChangeText={(text) => this.escribirMensaje(text)}
                        />
                    </View>

                    <TouchableOpacity style={{ alignSelf: 'flex-end', backgroundColor: '#604263', borderRadius: 28, margin: 2 }} onPress={() => this.EnviarMensaje()}>
                        <IconMaterial name="send" size={30} color="#FFF" style={{ padding: 10, alignSelf: 'center', marginLeft: 1 }} />

                    </TouchableOpacity>
                </View>
                {/* </KeyboardAvoidingView> */}
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#EEEEEE',
    },
    contenido: {
        marginHorizontal: 16
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

    },
    footer: {
        flexDirection: 'row',
        backgroundColor: '#EEEEEE',
        alignItems: 'center'
    },
    input: {
        paddingHorizontal: 20,
        fontSize: 18,

    },
    send: {
        alignSelf: 'center',
        color: '#744BFF',
        fontSize: 16,
        fontWeight: 'bold',
        padding: 20
    }
});