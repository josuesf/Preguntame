import React, { Component } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    DeviceEventEmitter,
    Image,
} from 'react-native';

import IconMaterial from 'react-native-vector-icons/MaterialCommunityIcons';
import RealmModule from '../NativeModules/RealmModule'
export default class ChatMessage extends Component {
    constructor(props) {
        super(props)
        this.state = {
            id_mensaje: props.message.id_mensaje,
            id_e: props.message.id_e,
            id_r: props.message.id_r,
            id_g: props.message.id_g,
            id_chat: props.message.id_chat,
            mensaje: props.message.mensaje,
            timestamp: props.message.timestamp,
            estado_mensaje: props.message.estado_mensaje,
            tipo_mensaje: props.message.tipo_mensaje,
            nroNoVistos: ""
        }
        if (props.estado_mensaje != 'visto') {
            this.statusListener = DeviceEventEmitter.addListener("changeStatus_" + this.state.id_mensaje, this.changeStatus)
        }
    }
    componentWillMount() {
        RealmModule.getNroNoVistos({ id_chat: this.props.message.id_chat }, (nroNoVistos) => this.setState({ nroNoVistos }))
    }
    changeStatus = (estado_mensaje) => {
        this.setState({ estado_mensaje })
        if (estado_mensaje == "visto") {
            this.statusListener.remove()
        }
    }
    componentWillUnmount() {
        this.statusListener.remove()
    }
    render() {
        const Hora = (date) => {
            date = new Date(parseInt(date))
            var hora = date.getHours() > 9 ? date.getHours() : "0" + date.getHours()
            var minutos = date.getMinutes() > 9 ? date.getMinutes() : "0" + date.getMinutes()
            return hora + ":" + minutos
        }
        const name_icon = (estado) => {
            if (estado == "pendiente")
                return "clock-outline"
            else if (estado == "enviado")
                return "check"
            else
                return "check-all"
        }
        return (
            <TouchableOpacity key={this.state.id_chat}
                onPress={() => this.props.navigation.navigate('chat', { usuario: this.state.id_chat, usuario_propietario: this.props.mi_usuario })}
                activeOpacity={0.6} style={{ paddingVertical: 10 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Image source={require('../img/avatar.png')} style={{ height: 50, width: 50, borderRadius: 25, marginRight: 20 }} />
                    <View style={{ flex: 1 }}>
                        <Text style={{ color: '#6B6B6B',fontSize:16, fontWeight: 'bold' }}>{this.state.id_chat}</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            {this.state.id_r != this.props.mi_usuario &&
                                <IconMaterial size={15}
                                    color={(this.state.estado_mensaje == "visto" ||
                                        this.state.estado_mensaje == "visto_fin") ? "#70CDEB" : "#6B6B6B"}
                                    name={name_icon(this.state.estado_mensaje)} />}
                            <Text style={{
                                color: (this.state.id_r == this.props.mi_usuario &&
                                    (this.state.estado_mensaje != 'visto' && this.state.estado_mensaje != 'visto_fin'))
                                    ? '#744BFF' : '#6B6B6B', marginHorizontal: 5
                            }}>
                                {(this.state.mensaje.length > 30) ? this.state.mensaje.substring(0, 30) + '...' : this.state.mensaje}
                            </Text>
                        </View>
                    </View>
                    <View style={{ marginTop: 5, alignItems: 'center', alignSelf: 'flex-start' }}>
                        <Text style={{ color: '#6B6B6B', fontSize: 11, marginBottom: 2 }}>{Hora(this.state.timestamp)}</Text>
                        {(this.state.id_r == this.props.mi_usuario && (this.state.estado_mensaje != 'visto' && this.state.estado_mensaje != 'visto_fin')) &&
                        <View style={{ height: 20, width: 20, borderRadius: 10, justifyContent: 'center', backgroundColor: '#744BFF', alignItems: 'center' }}>
                            <Text style={{ color: '#FFF', padding: 2 }}>{this.state.nroNoVistos}</Text>
                        </View>}
                    </View>
                    

                </View>
                <View style={{ height: 1, backgroundColor: '#E8E8E8', marginLeft: 50, marginTop: 5 }} />
            </TouchableOpacity>
        );

    }
}
const styles = StyleSheet.create({
    container: {
    },

});