import React, { useCallback, useState, useEffect } from 'react';
import { View, Text, SafeAreaView, Image, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { theme } from '../theme';
import { MagnifyingGlassIcon, MapPinIcon, CalendarDaysIcon } from 'react-native-heroicons/outline';
import { debounce } from 'lodash';
import { weatherImages } from '../constants';
import * as Progress from 'react-native-progress';
import { fetchWeatherForecast, fetchLocations } from '../api/weather';
import { storeData, getData } from '../utils/asyncStorage';

export default function HomeScreen() {
  const [showSearch, toggleSearch] = useState(false);
  const [locations, setLocations] = useState([]);
  const [weather, setWeather] = useState({});
  const [loading, setLoading] = useState(true);

  const handleLocation = (loc) => {
    setLocations([]);
    toggleSearch(false);
    setLoading(true);
    fetchWeatherForecast({
      cityName: loc.name,
      days: '7',
    }).then(data => {
      setWeather(data);
      setLoading(false);
      storeData('city', loc.name);
    });
  };

  const handleSearch = value => {
    fetchLocations({ cityName: value }).then(data => {
      setLocations(data);
    });
  };

  const fetchMyWeatherData = async () => {
    let myCity = await getData('city');
    let cityName = 'São Paulo';
    if (myCity) cityName = myCity;

    fetchWeatherForecast({
      cityName: cityName,
      days: '7',
    }).then(data => {
      setWeather(data);
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchMyWeatherData();
  }, []);

  const handleTextDebounce = useCallback(debounce(handleSearch, 1200), []);

  const { current, location } = weather;

  return (
    <View style={{ flex: 1, position: 'relative' }}>
      <StatusBar style="light" />

      <Image
        blurRadius={70}
        source={require('../assets/images/bg.png')}
        style={{ position: 'absolute', height: '100%', width: '100%' }}
      />

      {loading ? (
        <View className="flex-1 flex-row justify-center items-center">
          <Progress.CircleSnail thickness={10} size={140} color="#0bb3b2" />
        </View>
      ) : (
        <SafeAreaView style={{ flex: 1 }}>
          {/* Search section */}
          <View style={{ height: '7%', marginHorizontal: 16, position: 'relative', zIndex: 50 }}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'flex-end',
                alignItems: 'center',
                borderRadius: 999,
                backgroundColor: showSearch ? theme.bgWhite(0.2) : 'transparent',
              }}
            >
              {showSearch ? (
                <TextInput
                  onChangeText={handleTextDebounce}
                  placeholder="Search city"
                  placeholderTextColor={'lightgray'}
                  style={{
                    paddingLeft: 16,
                    height: 40,
                    flex: 1,
                    fontSize: 16,
                    color: 'white',
                  }}
                />
              ) : null}

              <TouchableOpacity
                onPress={() => toggleSearch(!showSearch)}
                style={{
                  backgroundColor: theme.bgWhite(0.3),
                  borderRadius: 999,
                  padding: 12,
                  margin: 4,
                }}
              >
                <MagnifyingGlassIcon size={25} color="white" />
              </TouchableOpacity>
            </View>

            {locations.length > 0 && showSearch ? (
              <View style={{ position: 'absolute', width: '100%', top: 64, backgroundColor: '#d1d5db', borderRadius: 24 }}>
                {locations.map((loc, index) => {
                  let showBorder = index + 1 !== locations.length;
                  let borderStyle = showBorder ? { borderBottomWidth: 2, borderBottomColor: '#9ca3af' } : {};

                  return (
                    <TouchableOpacity
                      onPress={() => handleLocation(loc)}
                      key={index}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        padding: 12,
                        paddingHorizontal: 16,
                        marginBottom: 4,
                        ...borderStyle,
                      }}
                    >
                      <MapPinIcon size={20} color="gray" />
                      <Text className="text-black text-lg ml-2">{loc?.name}, {loc?.country}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ) : null}
          </View>

          {/* Forecast section */}
          <View className="mx-4 flex justify-around flex-1 mb-2">
            <Text className="text-white text-center text-2xl font-bold">
              {location?.name},
            </Text>
            <Text className="text-lg font-semibold text-gray-300">
              {location?.country}
            </Text>

            {/* Weather image */}
            <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
              <Image
                source={weatherImages[current?.condition?.text]}
                style={{ width: 208, height: 208 }}
              />
            </View>

            {/* Temperature */}
            <View style={{ gap: 8 }}>
              <Text style={{ textAlign: 'center', fontWeight: 'bold', color: 'white', fontSize: 48 }}>
                {current?.temp_c}&#176;
              </Text>
              <Text style={{ textAlign: 'center', color: 'white', fontSize: 18, letterSpacing: 1 }}>
                {current?.condition?.text}
              </Text>
            </View>

            {/* Other stats */}
            <View className="flex-row justify-between mx-4">
              <View className="flex-row space-x-2 items-center">
                <Image source={require('../assets/icons/wind.png')} className="h-6 w-6" />
                <Text className="text-white font-semibold text-base">
                  {current?.wind_kph} km/h
                </Text>
              </View>

              <View className="flex-row space-x-2 items-center">
                <Image source={require('../assets/icons/drop.png')} className="h-6 w-6" />
                <Text className="text-white font-semibold text-base">
                  {current?.humidity}%
                </Text>
              </View>

              <View className="flex-row space-x-2 items-center">
                <Image source={require('../assets/icons/sun.png')} className="h-6 w-6" />
                <Text className="text-white font-semibold text-base">
                  {weather?.forecast?.forecastday[0]?.astro?.sunrise}
                </Text>
              </View>
            </View>

            {/* Forecast for next days */}
            <View className="mb-2 space-y-3">
              <View className="flex-row items-center mx-5 space-x-2">
                <CalendarDaysIcon size="22" color="white" />
                <Text className="text-white text-base">Daily Forecast</Text>
              </View>

              <ScrollView
                horizontal
                contentContainerStyle={{ paddingHorizontal: 15 }}
                showsHorizontalScrollIndicator={false}
              >
                {
                  weather?.forecast?.forecastday?.map((item, index) => {
                    let date = new Date(item.date);
                    let options = { weekday: 'long' };
                    let dayName = date.toLocaleDateString('en-US', options).split(',')[0];
                    return (
                      <View
                        key={index}
                        className="flex justify-center items-center w-24 rounded-3xl py-3 space-y-1 mr-4"
                        style={{ backgroundColor: theme.bgWhite(0.15) }}
                      >
                        <Image source={weatherImages[item?.day?.condition?.text]} className="h-11 w-11" />
                        <Text className="text-white">{dayName}</Text>
                        <Text className="text-white text-xl font-semibold">
                          {item?.day?.avgtemp_c}&#176;
                        </Text>
                      </View>
                    );
                  })
                }
              </ScrollView>
            </View>
          </View>
        </SafeAreaView>
      )}
    </View>
  );
}
