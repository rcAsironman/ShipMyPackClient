import React, { useEffect, useRef } from 'react';
import {
  Animated,
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Linking,
} from 'react-native';

const { width, height } = Dimensions.get('window');

const AdvertisementPopup = ({
  imageUrl,
  linkUrl,
  onClose,
}: {
  imageUrl: string;
  linkUrl: string;
  onClose: () => void;
}) => {
  const slideAnim = useRef(new Animated.ValueXY({ x: width, y: height })).current;

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: { x: width / 2 - 150, y: height / 2 - 180 },
      useNativeDriver: false,
    }).start();
  }, []);

  const handleLinkPress = () => {
    Linking.openURL(linkUrl);
  };

  return (
    <Animated.View style={[styles.container, slideAnim.getLayout()]}>
      <View style={styles.card}>
        <TouchableOpacity onPress={handleLinkPress} activeOpacity={0.9}>
          <Image source={{ uri: imageUrl }} style={styles.image} />
        </TouchableOpacity>
      </View>

      {/* Dismiss button below */}
      <TouchableOpacity onPress={onClose} style={styles.dismissButton}>
        <Text style={styles.dismissText}>Dismiss</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: 300,
    alignItems: 'center',
    zIndex: 100,
  },
  card: {
    width: 300,
    height: height * 0.5,
    backgroundColor: '#fff',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 10,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  dismissButton: {
    marginTop: 12,
    backgroundColor: '#000',
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  dismissText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default AdvertisementPopup;
