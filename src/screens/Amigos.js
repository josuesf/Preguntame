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
    FlatList,
    ActivityIndicator
} from 'react-native';
import IconMaterial from 'react-native-vector-icons/MaterialCommunityIcons';
import { fetchData } from '../utils/fetchData'
export default class Amigos extends Component {
    static navigationOptions = {
        title: "Amigos",
        headerTintColor: 'white',
        headerStyle: {
            backgroundColor: '#46494C'
        }
    };
    constructor() {
        super()
        console.ignoredYellowBox = [
            'Setting a timer'
        ];
        this.state = {
            usuarios: [],
            usuario_propietario: global.username,
            buscando:true
        }
    }
    componentWillMount() {
        this.recuperarAmigos()

    }
    recuperarAmigos = () => {
        fetchData('/ws/get_all_users', 'POST', {}, (res, err) => {
            if (err)
                alert(err)
            this.setState({ usuarios: res.filter(u => u.usuario != this.state.usuario_propietario),buscando:false })
            console.log(res)
        })
    }
    _keyExtractor = (item, index) => item.usuario;
    render() {
        const { navigate, replace, goBack } = this.props.navigation;
        return (
            <View style={styles.container}>
                <StatusBar
                    backgroundColor="#3A3C3F"
                    barStyle="light-content"
                />
                <View style={styles.contenido}>

                    {/* <TouchableOpacity activeOpacity={0.7} style={{ padding: 10, borderRadius: 5, backgroundColor: '#C7E2DF', flexDirection: 'row', alignItems: 'center' }}>
                        <TextInput placeholder="Buscar Amigos" style={{ padding: 0, flex: 1, fontWeight: 'bold' }} placeholderTextColor="#89AEAA"
                            underlineColorAndroid="transparent" />
                        <IconMaterial name="magnify" size={35} color="#89AEAA" />
                    </TouchableOpacity> */}
                    {this.state.buscando && <ActivityIndicator size="large" color="#604263"/>}
                    <FlatList
                        data={this.state.usuarios}
                        keyExtractor={this._keyExtractor}
                        renderItem={({ item }) => (
                            <TouchableOpacity onPress={() => replace('chat', { usuario: item.usuario, usuario_propietario: this.state.usuario_propietario })}  
                                key={item.usuario} activeOpacity={0.6} style={{ paddingVertical: 10 }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <Image source={require('../img/avatar.png')} style={{ height: 50, width: 50, borderRadius: 25, marginRight: 20 }} />
                                    <Text style={{ flex: 1, color: '#A4A4A4',fontWeight:"bold" }}>{item.usuario.toUpperCase()}</Text>
                                </View>
                                <View style={{ height: 1, backgroundColor: '#E8E8E8', marginLeft: 50, marginTop: 5 }} />
                            </TouchableOpacity>
                        )}
                    />

                </View>

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
        marginTop: 10
    }
});