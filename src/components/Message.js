import React, { Component } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    DeviceEventEmitter,
} from 'react-native';

import IconMaterial from 'react-native-vector-icons/MaterialCommunityIcons';

export default class Message extends Component {
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
            seleccionado: false
        }
        if (props.estado_mensaje != 'visto') {
            this.statusListener = DeviceEventEmitter.addListener("changeStatus_" + this.state.id_mensaje, this.changeStatus)
        }
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
    Seleccionar = (message) => {
        if (this.props.modo_seleccion != true) {
            this.setState({ seleccionado: true })
            this.props.Seleccion({
                usuario: this.state.id_e,
                mensaje: this.state.mensaje
            })
        }
    }
    QuitarSeleccion = () => {
        this.props.QuitarSeleccion()
        this.setState({ seleccionado: false })
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
            <View style={{ flex: 1, marginBottom: 10 }}>
                {this.state.id_e == this.props.mi_usuario ?
                    <TouchableOpacity activeOpacity={0.8} //onPress={this.QuitarSeleccion} onLongPress={() => this.Seleccionar()}
                        key={this.state.id_mensaje} style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: "transparent" }}>
                        <View style={{ flex: 1 }} >

                        </View>

                        <View style={{
                            padding: 10,
                            backgroundColor: '#C5C3C6',
                            borderRadius: 10, marginLeft: 80, marginRight: 5, flexDirection: this.state.mensaje.length < 30 ? 'row' : 'column'
                        }}>
                            <Text style={{ color: '#6B6B6B', fontSize: 15, paddingRight: 5 }}>{this.state.mensaje}</Text>
                            <View style={{ flexDirection: 'row', marginLeft: 5, alignItems: 'center', alignSelf: 'flex-end' }}>
                                <Text style={{ color: '#6B6B6B', fontSize: 11, marginRight: 2, }}>{Hora(this.state.timestamp)}</Text>
                                {/* <IconMaterial size={15}
                                    color={(this.state.estado_mensaje == "visto" ||
                                        this.state.estado_mensaje == "visto_fin")
                                        ? "#70CDEB" : "#6B6B6B"}
                                    name={name_icon(this.state.estado_mensaje)} /> */}
                            </View>
                        </View>

                    </TouchableOpacity> :
                    <TouchableOpacity activeOpacity={0.8} key={this.state.id_mensaje} style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <View style={{
                            padding: 10, backgroundColor: '#FFF', borderRadius: 10,
                            marginRight: 80, marginLeft: 5, flexDirection: this.state.mensaje.length < 30 ? 'row' : 'column'
                        }}>
                            <Text style={{ color: '#6B6B6B', fontSize: 15 }}>{this.state.mensaje}</Text>
                            <View style={{ flexDirection: 'row', marginLeft: 5, alignItems: 'center', alignSelf: 'flex-end' }}>
                                <Text style={{ color: '#6B6B6B', fontSize: 11, marginRight: 2 }}>{Hora(this.state.timestamp)}</Text>
                            </View>
                        </View>
                        <View style={{ flex: 1 }} />
                    </TouchableOpacity>}

            </View>
        );

    }
}

const styles = StyleSheet.create({
    container: {
    },

});