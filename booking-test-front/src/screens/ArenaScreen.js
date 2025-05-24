import React from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons, FontAwesome } from '@expo/vector-icons';

export default function ArenaDetailsScreen({ route, navigation }) {
  const { arena } = route.params; // Получаем данные о выбранной арене

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#fff' }}>
      {/* Верхняя картинка */}
      <Image source={{ uri: arena.image }} style={{ width: '100%', height: 200 }} />

      {/* Кнопка Назад */}
      <TouchableOpacity
        style={{ position: 'absolute', top: 20, left: 15 }}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={24} color="black" />
      </TouchableOpacity>

      {/* Основная информация */}
      <View style={{ padding: 15 }}>
        <Text style={{ fontSize: 20, fontWeight: 'bold' }}>{arena.name}</Text>
        <Text style={{ color: 'gray' }}>{arena.type}</Text>

        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 5 }}>
          <Ionicons name="location-outline" size={16} color="black" />
          <Text style={{ marginLeft: 5 }}>{arena.address}</Text>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 5 }}>
          <FontAwesome name="money" size={16} color="black" />
          <Text style={{ marginLeft: 5 }}>from {arena.price} тнг/час</Text>
        </View>
      </View>

      {/* Вкладки (о поле, отзывы, фото) */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-around', borderBottomWidth: 1, borderColor: '#ddd' }}>
        <Text style={{ fontWeight: 'bold', paddingBottom: 10, borderBottomWidth: 2, borderColor: 'black' }}>About</Text>
        <Text style={{ color: 'gray' }}>Reviews</Text>
        <Text style={{ color: 'gray' }}>Photos</Text>
      </View>

      {/* Удобства */}
      <View style={{ padding: 15 }}>
        <Text style={{ fontWeight: 'bold' }}>Conveniences</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 5 }}>
          {arena.features.map((feature, index) => (
            <View key={index} style={{ flexDirection: 'row', alignItems: 'center', width: '50%', marginVertical: 5 }}>
              <Ionicons name={feature.icon} size={16} color="black" />
              <Text style={{ marginLeft: 5 }}>{feature.name}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* О поле */}
      <View style={{ padding: 15, backgroundColor: '#f9f9f9' }}>
        <Text style={{ fontWeight: 'bold' }}>About field</Text>
        <Text>Size: {arena.size}</Text>
        <Text>Surface: {arena.surface}</Text>
        <Text>Fields: {arena.fields}</Text>
        <Text>Balls: {arena.balls}</Text>
      </View>

      {/* Способы оплаты */}
      <View style={{ padding: 15 }}>
        <Text style={{ fontWeight: 'bold' }}>Payment method</Text>
        <Text>{arena.payment}</Text>
      </View>

      {/* Кнопка бронирования */}
      <TouchableOpacity
        style={{
          backgroundColor: '#FDE047',
          padding: 15,
          margin: 15,
          borderRadius: 10,
          alignItems: 'center',
        }}
      >
        <Text style={{ fontWeight: 'bold' }}>Make a reservation</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
