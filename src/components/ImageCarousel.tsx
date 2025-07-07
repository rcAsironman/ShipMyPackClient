import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  FlatList,
  Dimensions,
  StyleSheet,
  Animated,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Text,
  Image as RNImage,
} from 'react-native';
import FastImage from 'react-native-fast-image'; // Optional, fallback provided
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faTimesCircle } from '@fortawesome/free-solid-svg-icons';

const { width } = Dimensions.get('window');
const ITEM_SPACING = 16;
const ITEM_WIDTH = width * 0.9;

export interface CarouselItem {
  id: number;
  uri: string;
}

interface InfiniteCarouselProps {
  imagesData: CarouselItem[];
}

export default function InfiniteCarousel({ imagesData }: InfiniteCarouselProps) {
  const scrollX = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef<FlatList<CarouselItem>>(null);
  const [activeIndex, setActiveIndex] = useState(imagesData.length > 1 ? 1 : 0);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalImage, setModalImage] = useState<string | null>(null);

  // Create looped images array
  const images = imagesData.length > 1
    ? [
        imagesData[imagesData.length - 1],
        ...imagesData,
        imagesData[0],
      ]
    : [...imagesData];

  // Scroll to initial position
  useEffect(() => {
    if (imagesData.length > 1) {
      setTimeout(() => {
        flatListRef.current?.scrollToIndex({ index: 1, animated: false });
      }, 50);
    }
  }, [imagesData.length]);  

  // Auto-scroll every 3s
  useEffect(() => {
    if (imagesData.length <= 1) return;
  
    const interval = setInterval(() => {
      const nextIndex = activeIndex + 1;
      flatListRef.current?.scrollToIndex({
        index: nextIndex,
        animated: true,
      });
    }, 3000);
  
    return () => clearInterval(interval);
  }, [activeIndex, imagesData.length]);
  

  // Infinite scroll logic
  const handleMomentumScrollEnd = (e: any) => {
    if (imagesData.length <= 1) return; // Skip handling
  
    const offsetX = e.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / (ITEM_WIDTH + ITEM_SPACING));
  
    let newIndex = index;
  
    if (index === 0) {
      newIndex = imagesData.length;
      flatListRef.current?.scrollToIndex({ index: newIndex, animated: false });
    } else if (index === images.length - 1) {
      newIndex = 1;
      flatListRef.current?.scrollToIndex({ index: newIndex, animated: false });
    }
  
    setActiveIndex(newIndex);
  };
  

  const openModal = (uri: string) => {
    setModalImage(uri);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setModalImage(null);
  };

  return (
    <View style={styles.carouselWrapper}>
      <Animated.FlatList
        ref={flatListRef}
        data={images}
        horizontal
        keyExtractor={(item, index) => `${item.id}-${index}`}
        showsHorizontalScrollIndicator={false}
        pagingEnabled
        snapToInterval={ITEM_WIDTH + ITEM_SPACING}
        decelerationRate="fast"
        contentContainerStyle={{ paddingHorizontal: ITEM_SPACING / 2 }}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        renderItem={({ item }) => (
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => openModal(item.uri)}
          >
            <View style={styles.imageContainer}>
              {FastImage ? (
                <FastImage
                  source={{ uri: item.uri }}
                  style={styles.image}
                  resizeMode={FastImage.resizeMode.cover}
                />
              ) : (
                <RNImage
                  source={{ uri: item.uri }}
                  style={styles.image}
                  resizeMode="cover"
                />
              )}
            </View>
          </TouchableOpacity>
        )}
      />

      <View style={styles.dotContainer}>
        {imagesData.map((_, i) => {
          const inputRange = [
            (i) * (ITEM_WIDTH + ITEM_SPACING),
            (i + 1) * (ITEM_WIDTH + ITEM_SPACING),
            (i + 2) * (ITEM_WIDTH + ITEM_SPACING),
          ];

          const dotWidth = scrollX.interpolate({
            inputRange,
            outputRange: [8, 20, 8],
            extrapolate: 'clamp',
          });

          const opacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.4, 1, 0.4],
            extrapolate: 'clamp',
          });

          return (
            <Animated.View
              key={i}
              style={[
                styles.dot,
                { width: dotWidth, opacity },
              ]}
            />
          );
        })}
      </View>

      {/* Modal Image Viewer */}
      <Modal visible={modalVisible} transparent onRequestClose={closeModal}>
        <View style={styles.modalContainer}>
          <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
            <FontAwesomeIcon icon={faTimesCircle} size={30} color="#fff" />
          </TouchableOpacity>
          {modalImage && (
            FastImage ? (
              <FastImage
                source={{ uri: modalImage }}
                style={styles.modalImage}
                resizeMode={FastImage.resizeMode.contain}
              />
            ) : (
              <RNImage
                source={{ uri: modalImage }}
                style={styles.modalImage}
                resizeMode="contain"
              />
            )
          )}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  carouselWrapper: {
    height: 220,
    position: 'relative',
  },
  imageContainer: {
    width: ITEM_WIDTH,
    height: 220,
    marginRight: ITEM_SPACING,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  dotContainer: {
    position: 'absolute',
    bottom: 12,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  dot: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#333',
    marginHorizontal: 4,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalImage: {
    width: '90%',
    height: '80%',
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 1,
  },
});
