import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Platform,
  Alert,
  StatusBar,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import {
  faCalendarAlt,
  faClock,
  faUpload,
  faTimesCircle,
} from '@fortawesome/free-solid-svg-icons';
import * as DocumentPicker from '@react-native-documents/picker';

export default function AddTripScreen() {
  const [travelDate, setTravelDate] = useState(new Date());
  const [pickupTime, setPickupTime] = useState(new Date());
  const [dropTime, setDropTime] = useState(new Date());
  const [ticketFile, setTicketFile] = useState(null);
  const [weight, setWeight] = useState('');
  const [startPincode, setStartPincode] = useState('');
  const [startLocation, setStartLocation] = useState('');
  const [pickupPoint, setPickupPoint] = useState('');
  const [destinationPincode, setDestinationPincode] = useState('');
  const [destinationLocation, setDestinationLocation] = useState('');
  const [dropPoint, setDropPoint] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showPickupTimePicker, setShowPickupTimePicker] = useState(false);
  const [showDropTimePicker, setShowDropTimePicker] = useState(false);

  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) setTravelDate(selectedDate);
  };

  const onPickupTimeChange = (event, selectedTime) => {
    setShowPickupTimePicker(false);
    if (selectedTime) setPickupTime(selectedTime);
  };

  const onDropTimeChange = (event, selectedTime) => {
    setShowDropTimePicker(false);
    if (selectedTime) setDropTime(selectedTime);
  };

  const handleUpload = async () => {
    try {
      const result = await DocumentPicker.pick({
        type: [
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ],
        allowMultiSelection: false,
        copyTo: 'cachesDirectory',
      });

      if (result && result.length > 0) {
        const file = result[0];
        setTicketFile(file);
        Alert.alert('File Uploaded', `Successfully uploaded: ${file.name || file.fileCopyUri?.split('/').pop()}`);
      }
    } catch (err) {
      if (!DocumentPicker.isCancel(err)) {
        Alert.alert('Upload Failed', 'There was an error uploading your file.');
      }
    }
  };

  const clearTicketFile = () => {
    setTicketFile(null);
    Alert.alert('File Removed', 'Uploaded ticket has been removed.');
  };

  const handleSubmit = () => {
    if (!travelDate || !pickupTime || !dropTime || !weight || !ticketFile ||
      !startPincode || !startLocation || !destinationPincode || !destinationLocation) {
      Alert.alert('Missing Information', 'Please fill in all required fields and upload your ticket.');
      return;
    }

    Alert.alert('Trip Submitted', 'Your trip details have been successfully added!');
    console.log({
      travelDate: travelDate.toISOString(),
      pickupTime: pickupTime.toLocaleTimeString(),
      dropTime: dropTime.toLocaleTimeString(),
      ticketFileName: ticketFile?.name,
      weight,
      startPincode,
      startLocation,
      pickupPoint,
      destinationPincode,
      destinationLocation,
      dropPoint,
    });

    setTravelDate(new Date());
    setPickupTime(new Date());
    setDropTime(new Date());
    setTicketFile(null);
    setWeight('');
    setStartPincode('');
    setStartLocation('');
    setPickupPoint('');
    setDestinationPincode('');
    setDestinationLocation('');
    setDropPoint('');
  };

  return (
    <ScrollView className="flex-1 bg-gray-50 p-4 pt-16" contentContainerStyle={{ paddingBottom: 50 }}>
      <StatusBar backgroundColor="white" barStyle="dark-content" />
      <Text className="text-2xl font-bold text-gray-800 mb-6 text-center">Add Your Trip</Text>

      {/* Travel Information */}
      <View className="bg-white rounded-xl shadow-md p-5 mb-6">
        <Text className="text-lg font-semibold text-gray-800 mb-4">Travel Information</Text>

        <TouchableOpacity onPress={() => setShowDatePicker(true)} className="flex-row items-center border border-gray-300 rounded-xl px-4 py-3 bg-gray-50 mb-4">
          <FontAwesomeIcon icon={faCalendarAlt} color="#888" size={18} />
          <Text className="ml-3 text-gray-800 text-base flex-1">
            {travelDate.toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
          </Text>
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker value={travelDate} mode="date" display="default" minimumDate={new Date()} onChange={onDateChange} />
        )}

        <TextInput
          className="border border-gray-300 px-4 py-3 rounded-xl bg-gray-50 text-gray-800 mb-4"
          keyboardType="numeric"
          maxLength={6}
          placeholder="Starting Pincode"
          value={startPincode}
          onChangeText={setStartPincode}
        />

        <TextInput
          className="border border-gray-300 px-4 py-3 rounded-xl bg-gray-50 text-gray-800 mb-4"
          placeholder="Starting Location"
          value={startLocation}
          onChangeText={setStartLocation}
        />

        <TextInput
          className="border border-gray-300 px-4 py-3 rounded-xl bg-gray-50 text-gray-800 mb-4"
          placeholder="Pickup Point (Optional)"
          value={pickupPoint}
          onChangeText={setPickupPoint}
        />

        <TouchableOpacity onPress={() => setShowPickupTimePicker(true)} className="flex-row items-center border border-gray-300 rounded-xl px-4 py-3 bg-gray-50 mb-4">
          <FontAwesomeIcon icon={faClock} color="#888" size={18} />
          <Text className="ml-3 text-gray-800 text-base flex-1">
            {pickupTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}
          </Text>
        </TouchableOpacity>
        {showPickupTimePicker && (
          <DateTimePicker value={pickupTime} mode="time" display="default" onChange={onPickupTimeChange} />
        )}
      </View>

      {/* Destination Information */}
      <View className="bg-white rounded-xl shadow-md p-5 mb-6">
        <Text className="text-lg font-semibold text-gray-800 mb-4">Destination Information</Text>

        <TextInput
          className="border border-gray-300 px-4 py-3 rounded-xl bg-gray-50 text-gray-800 mb-4"
          keyboardType="numeric"
          maxLength={6}
          placeholder="Destination Pincode"
          value={destinationPincode}
          onChangeText={setDestinationPincode}
        />

        <TextInput
          className="border border-gray-300 px-4 py-3 rounded-xl bg-gray-50 text-gray-800 mb-4"
          placeholder="Destination Location"
          value={destinationLocation}
          onChangeText={setDestinationLocation}
        />

        <TextInput
          className="border border-gray-300 px-4 py-3 rounded-xl bg-gray-50 text-gray-800 mb-4"
          placeholder="Drop Point (Optional)"
          value={dropPoint}
          onChangeText={setDropPoint}
        />

        <TouchableOpacity onPress={() => setShowDropTimePicker(true)} className="flex-row items-center border border-gray-300 rounded-xl px-4 py-3 bg-gray-50">
          <FontAwesomeIcon icon={faClock} color="#888" size={18} />
          <Text className="ml-3 text-gray-800 text-base flex-1">
            {dropTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}
          </Text>
        </TouchableOpacity>
        {showDropTimePicker && (
          <DateTimePicker value={dropTime} mode="time" display="default" onChange={onDropTimeChange} />
        )}
      </View>

      {/* Upload Ticket */}
      <View className="bg-white rounded-xl shadow-md p-5 mb-6">
        <Text className="text-lg font-semibold text-gray-800 mb-4">Upload Ticket</Text>
        <TouchableOpacity
          className="flex-row items-center justify-center border-2 border-dashed border-airbnb-primary-dark rounded-xl py-4 bg-red-50 mb-3"
          onPress={handleUpload}
        >
          <FontAwesomeIcon icon={faUpload} color="#DA2824" size={24} />
          <Text className="ml-3 text-airbnb-primary-dark font-semibold text-base">
            {ticketFile ? 'Change Ticket' : 'Upload Ticket (PDF/DOCX)'}
          </Text>
        </TouchableOpacity>

        {ticketFile && (
          <View className="flex-row items-center justify-between bg-gray-100 rounded-lg p-3">
            <Text className="text-sm text-gray-700 flex-1 mr-2" numberOfLines={1} ellipsizeMode="middle">
              File: {ticketFile.name || ticketFile.fileCopyUri?.split('/').pop()}
            </Text>
            <TouchableOpacity onPress={clearTicketFile} className="p-1">
              <FontAwesomeIcon icon={faTimesCircle} color="#dc2626" size={18} />
            </TouchableOpacity>
          </View>
        )}

        <Text className="text-xs text-gray-500 mt-2 text-center">
          Supported formats: PDF, DOCX, DOC. Max file size: 5MB.
        </Text>
      </View>

      {/* Weight */}
      <View className="bg-white rounded-xl shadow-md p-5 mb-6">
        <Text className="text-lg font-semibold text-gray-800 mb-4">Weight Capacity</Text>
        <TextInput
          className="border border-gray-300 px-4 py-3 rounded-xl bg-gray-50 text-gray-800"
          keyboardType="numeric"
          placeholder="e.g. 5"
          value={weight}
          onChangeText={setWeight}
        />
        <Text className="text-sm text-gray-500 mt-2">
          This is the approximate weight you can comfortably carry.
        </Text>
      </View>

      <Text className="mt-4 text-gray-600 text-sm text-center px-4 mb-8">
        Note: Cancel your trip at least 5 hours in advance to avoid penalties.
      </Text>

      {/* Submit */}
      <TouchableOpacity
        className="bg-airbnb-primary-dark py-4 rounded-xl items-center mx-4 shadow-lg"
        onPress={handleSubmit}
      >
        <Text className="text-white font-bold text-lg">Submit Trip</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
