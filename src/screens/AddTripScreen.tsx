// import React, { useState } from 'react';
// import {
//   View,
//   Text,
//   TextInput,
//   ScrollView,
//   TouchableOpacity,
//   Platform,
//   Alert,
// } from 'react-native';

// // Make sure these are installed:
// // npm install @react-native-community/datetimepicker
// import DateTimePicker from '@react-native-community/datetimepicker';

// // Make sure these are installed:
// // npm install @fortawesome/react-native-fontawesome @fortawesome/free-solid-svg-icons @fortawesome/fontawesome-svg-core react-native-svg
// import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
// import { faCalendarAlt, faClock, faUpload, faTimesCircle } from '@fortawesome/free-solid-svg-icons';

// // IMPORTANT: Ensure react-native-document-picker is installed:
// // npm install react-native-document-picker@latest
// // npm install --save-dev @types/react-native-document-picker
// import DocumentPicker, { types } from 'react-native-document-picker';


// export default function AddTripScreen() {
//   const [travelDate, setTravelDate] = useState(new Date());
//   const [pickupTime, setPickupTime] = useState(new Date());
//   const [dropTime, setDropTime] = useState(new Date());
//   // Stores DocumentPickerResult object (includes name, uri, type, size etc.)
//   const [ticketFile, setTicketFile] = useState(null);
//   const [weight, setWeight] = useState('');

//   // State for Date/Time Picker visibility
//   const [showDatePicker, setShowDatePicker] = useState(false);
//   const [showPickupTimePicker, setShowPickupTimePicker] = useState(false);
//   const [showDropTimePicker, setShowDropTimePicker] = useState(false);

//   // Handlers for Date & Time Pickers
//   const onDateChange = (event, selectedDate) => {
//     const currentDate = selectedDate || travelDate;
//     setShowDatePicker(Platform.OS === 'ios'); // Keep picker open on iOS until "Done" for consistent UX
//     setTravelDate(currentDate);
//   };

//   const onPickupTimeChange = (event, selectedTime) => {
//     const currentTime = selectedTime || pickupTime;
//     setShowPickupTimePicker(Platform.OS === 'ios');
//     setPickupTime(currentTime);
//   };

//   const onDropTimeChange = (event, selectedTime) => {
//     const currentTime = selectedTime || dropTime;
//     setShowDropTimePicker(Platform.OS === 'ios');
//     setDropTime(currentTime);
//   };

//   const handleUpload = async () => {
//     try {
//       const result = await DocumentPicker.pickSingle({
//         // Using `types` imported from 'react-native-document-picker'
//         type: [types.pdf, types.docx, types.doc],
//         copyTo: 'cachesDirectory', // Recommended for reliable file access
//       });
//       setTicketFile(result);
//       Alert.alert('File Uploaded', `Successfully uploaded: ${result.name}`);
//     } catch (err) {
//       if (DocumentPicker.isCancel(err)) {
//         // User cancelled the picker
//         console.log('User cancelled file picker');
//       } else {
//         // Other errors
//         console.error('DocumentPicker error:', err);
//         Alert.alert('Upload Failed', 'There was an error uploading your file. Please try again.');
//       }
//     }
//   };

//   const clearTicketFile = () => {
//     setTicketFile(null);
//     Alert.alert('File Removed', 'Uploaded ticket has been removed.');
//   };

//   const handleSubmit = () => {
//     // Basic validation and submission logic
//     if (!travelDate || !pickupTime || !dropTime || !weight || !ticketFile) {
//       Alert.alert('Missing Information', 'Please fill in all required fields and upload your ticket.');
//       return;
//     }
//     // In a real app, you would send this data to your backend
//     Alert.alert('Trip Submitted', 'Your trip details have been successfully added!');
//     console.log({
//       travelDate: travelDate.toISOString(),
//       pickupTime: pickupTime.toLocaleTimeString(),
//       dropTime: dropTime.toLocaleTimeString(),
//       ticketFileName: ticketFile?.name,
//       weight,
//       // Add other form fields here if you expand the form
//     });

//     // Optionally reset form
//     setTravelDate(new Date());
//     setPickupTime(new Date());
//     setDropTime(new Date());
//     setTicketFile(null);
//     setWeight('');
//     // Reset other fields
//   };

//   return (
//     <ScrollView className="flex-1 bg-gray-50 p-4 pt-16" contentContainerStyle={{ paddingBottom: 50 }}>
//       <Text className="text-2xl font-bold text-gray-800 mb-6 text-center">Add Your Trip</Text>

//       {/* Travel Info Section */}
//       <View className="bg-white rounded-xl shadow-md p-5 mb-6">
//         <Text className="text-lg font-semibold text-gray-800 mb-4">Travel Information</Text>

//         <View className="mb-4">
//           <Text className="text-gray-700 font-medium mb-2">Travel Date</Text>
//           <TouchableOpacity
//             onPress={() => setShowDatePicker(true)}
//             className="flex-row items-center border border-gray-300 rounded-xl px-4 py-3 bg-gray-50"
//           >
//             <FontAwesomeIcon icon={faCalendarAlt} color="#888" size={18} />
//             <Text className="ml-3 text-gray-800 text-base flex-1">
//               {travelDate.toLocaleDateString('en-IN', {
//                 year: 'numeric',
//                 month: 'long',
//                 day: 'numeric',
//               })}
//             </Text>
//           </TouchableOpacity>
//           {showDatePicker && (
//             <DateTimePicker
//               testID="datePicker"
//               value={travelDate}
//               mode="date"
//               display={Platform.OS === 'ios' ? 'spinner' : 'default'}
//               onChange={onDateChange}
//               minimumDate={new Date()} // Cannot select past dates
//             />
//           )}
//         </View>

//         <View className="mb-4">
//           <Text className="text-gray-700 font-medium mb-2">Starting Pincode</Text>
//           <TextInput
//             className="border border-gray-300 px-4 py-3 rounded-xl bg-gray-50 text-gray-800"
//             keyboardType="numeric"
//             maxLength={6}
//             placeholder="e.g., 500032"
//             placeholderTextColor="#999"
//           />
//         </View>

//         <View className="mb-4">
//           <Text className="text-gray-700 font-medium mb-2">Starting Location</Text>
//           <TextInput
//             className="border border-gray-300 px-4 py-3 rounded-xl bg-gray-50 text-gray-800"
//             placeholder="Enter your city or town"
//             placeholderTextColor="#999"
//           />
//         </View>

//         <View className="mb-4">
//           <Text className="text-gray-700 font-medium mb-2">Pickup Point (Optional)</Text>
//           <TextInput
//             className="border border-gray-300 px-4 py-3 rounded-xl bg-gray-50 text-gray-800"
//             placeholder="Nearby landmark or specific address"
//             placeholderTextColor="#999"
//           />
//         </View>

//         <View className="mb-4">
//           <Text className="text-gray-700 font-medium mb-2">Pickup Time</Text>
//           <TouchableOpacity
//             onPress={() => setShowPickupTimePicker(true)}
//             className="flex-row items-center border border-gray-300 rounded-xl px-4 py-3 bg-gray-50"
//           >
//             <FontAwesomeIcon icon={faClock} color="#888" size={18} />
//             <Text className="ml-3 text-gray-800 text-base flex-1">
//               {pickupTime.toLocaleTimeString('en-IN', {
//                 hour: '2-digit',
//                 minute: '2-digit',
//                 hour12: true,
//               })}
//             </Text>
//           </TouchableOpacity>
//           {showPickupTimePicker && (
//             <DateTimePicker
//               testID="pickupTimePicker"
//               value={pickupTime}
//               mode="time"
//               display={Platform.OS === 'ios' ? 'spinner' : 'default'}
//               onChange={onPickupTimeChange}
//             />
//           )}
//         </View>
//       </View>

//       {/* Destination Info Section */}
//       <View className="bg-white rounded-xl shadow-md p-5 mb-6">
//         <Text className="text-lg font-semibold text-gray-800 mb-4">Destination Information</Text>

//         <View className="mb-4">
//           <Text className="text-gray-700 font-medium mb-2">Destination Pincode</Text>
//           <TextInput
//             className="border border-gray-300 px-4 py-3 rounded-xl bg-gray-50 text-gray-800"
//             keyboardType="numeric"
//             maxLength={6}
//             placeholder="e.g., 110001"
//             placeholderTextColor="#999"
//           />
//         </View>

//         <View className="mb-4">
//           <Text className="text-gray-700 font-medium mb-2">Destination Location</Text>
//           <TextInput
//             className="border border-gray-300 px-4 py-3 rounded-xl bg-gray-50 text-gray-800"
//             placeholder="City or town"
//             placeholderTextColor="#999"
//           />
//         </View>

//         <View className="mb-4">
//           <Text className="text-gray-700 font-medium mb-2">Drop Point (Optional)</Text>
//           <TextInput
//             className="border border-gray-300 px-4 py-3 rounded-xl bg-gray-50 text-gray-800"
//             placeholder="Drop location or specific address"
//             placeholderTextColor="#999"
//           />
//         </View>

//         <View className="mb-4">
//           <Text className="text-gray-700 font-medium mb-2">Drop Time</Text>
//           <TouchableOpacity
//             onPress={() => setShowDropTimePicker(true)}
//             className="flex-row items-center border border-gray-300 rounded-xl px-4 py-3 bg-gray-50"
//           >
//             <FontAwesomeIcon icon={faClock} color="#888" size={18} />
//             <Text className="ml-3 text-gray-800 text-base flex-1">
//               {dropTime.toLocaleTimeString('en-IN', {
//                 hour: '2-digit',
//                 minute: '2-digit',
//                 hour12: true,
//               })}
//             </Text>
//           </TouchableOpacity>
//           {showDropTimePicker && (
//             <DateTimePicker
//               testID="dropTimePicker"
//               value={dropTime}
//               mode="time"
//               display={Platform.OS === 'ios' ? 'spinner' : 'default'}
//               onChange={onDropTimeChange}
//             />
//           )}
//         </View>
//       </View>

//       {/* Upload Ticket */}
//       <View className="bg-white rounded-xl shadow-md p-5 mb-6">
//         <Text className="text-lg font-semibold text-gray-800 mb-4">Upload Ticket</Text>
//         <TouchableOpacity
//           className="flex-row items-center justify-center border-2 border-dashed border-airbnb-primary-dark rounded-xl py-4 bg-red-50 mb-3"
//           onPress={handleUpload}
//         >
//           <FontAwesomeIcon icon={faUpload} color="#DA2824" size={24} />
//           <Text className="ml-3 text-airbnb-primary-dark font-semibold text-base">
//             {ticketFile ? 'Change Ticket' : 'Upload Ticket (PDF/DOCX)'}
//           </Text>
//         </TouchableOpacity>
//         {ticketFile && (
//           <View className="flex-row items-center justify-between bg-gray-100 rounded-lg p-3">
//             <Text className="text-sm text-gray-700 flex-1 mr-2" numberOfLines={1} ellipsizeMode="middle">
//               File: {ticketFile.name}
//             </Text>
//             <TouchableOpacity onPress={clearTicketFile} className="p-1">
//               <FontAwesomeIcon icon={faTimesCircle} color="#dc2626" size={18} />
//             </TouchableOpacity>
//           </View>
//         )}
//         <Text className="text-xs text-gray-500 mt-2 text-center">
//           Supported formats: PDF, DOCX, DOC. Max file size: 5MB.
//         </Text>
//       </View>

//       {/* Weight Capacity */}
//       <View className="bg-white rounded-xl shadow-md p-5 mb-6">
//         <Text className="text-lg font-semibold text-gray-800 mb-4">Weight Capacity</Text>
//         <Text className="text-gray-700 font-medium mb-2">Weight You Can Carry (in kg)</Text>
//         <TextInput
//           className="border border-gray-300 px-4 py-3 rounded-xl bg-gray-50 text-gray-800"
//           keyboardType="numeric"
//           placeholder="e.g. 5"
//           placeholderTextColor="#999"
//           value={weight}
//           onChangeText={setWeight}
//         />
//         <Text className="text-sm text-gray-500 mt-2">
//           This is the approximate weight you can comfortably carry in your luggage/cargo space.
//         </Text>
//       </View>

//       {/* Note */}
//       <Text className="mt-4 text-gray-600 text-sm text-center px-4 mb-8">
//         Note: If you want to cancel the trip, please do so at least 5 hours in advance to avoid penalties.
//       </Text>

//       {/* Submit Button */}
//       <TouchableOpacity
//         className="bg-airbnb-primary-dark py-4 rounded-xl items-center mx-4 shadow-lg"
//         onPress={handleSubmit}
//       >
//         <Text className="text-white font-bold text-lg">Submit Trip</Text>
//       </TouchableOpacity>
//     </ScrollView>
//   );
// }

import { View, Text } from 'react-native'
import React from 'react'

const AddTripScreen = () => {
  return (
    <View>
      <Text>AddTripScreen</Text>
    </View>
  )
}

export default AddTripScreen