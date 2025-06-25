import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  FlatList,
  Dimensions,
  StyleSheet,
  Animated,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
  Text,
} from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faTimesCircle, faArrowLeft, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import FastImage from 'react-native-fast-image';

const { width, height } = Dimensions.get('window');
const ITEM_WIDTH = width - 32;

const originalImages = [
  { uri: 'https://images.unsplash.com/photo-1532635042-a6f6ad4745f9?q=80' },
  { uri: 'https://images.unsplash.com/photo-1532635042-a6f6ad4745f9?q=80' },
  { uri: 'https://images.unsplash.com/photo-1532635042-a6f6ad4745f9?q=80' },
  // add more images here if needed
];

const images = originalImages.length > 1
  ? [originalImages[originalImages.length - 1], ...originalImages, originalImages[0]]
  : originalImages;

export default function OrderDetailsCarousel() {
  if (originalImages.length === 0) return null;

  const scrollX = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef<FlatList>(null);
  const modalFlatListRef = useRef<FlatList>(null);
  const [activeIndex, setActiveIndex] = useState(originalImages.length > 1 ? 1 : 0);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [modalImageLoading, setModalImageLoading] = useState(false);
  const [loadedImages, setLoadedImages] = useState<{ [key: string]: boolean }>({});
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const swipeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (originalImages.length > 1) {
      flatListRef.current?.scrollToIndex({ index: 1, animated: false });
    }
  }, []);

  useEffect(() => {
    if (!modalVisible && originalImages.length > 1) {
      intervalRef.current = setInterval(() => {
        flatListRef.current?.scrollToIndex({ index: activeIndex + 1, animated: true });
      }, 3000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [activeIndex, modalVisible]);

  const handleMomentumScrollEnd = (e: any) => {
    const offsetX = e.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / ITEM_WIDTH);
    let newIndex = index;
    if (index === 0) {
      newIndex = originalImages.length;
      flatListRef.current?.scrollToIndex({ index: newIndex, animated: false });
    } else if (index === images.length - 1) {
      newIndex = 1;
      flatListRef.current?.scrollToIndex({ index: newIndex, animated: false });
    }
    setActiveIndex(newIndex);
  };

  const markImageLoaded = (uri: string) => {
    setLoadedImages((prev) => ({ ...prev, [uri]: true }));
  };

  const openImageViewer = (index: number) => {
    setSelectedImageIndex(index);
    setModalImageLoading(true);
    setModalVisible(true);
  };

  const closeImageViewer = () => {
    setModalVisible(false);
  };

  const playSwipeAnimation = () => {
    swipeAnim.setValue(0);
    Animated.timing(swipeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  };

  const handlePrevImage = () => {
    if (selectedImageIndex > 0) {
      const newIndex = selectedImageIndex - 1;
      modalFlatListRef.current?.scrollToIndex({ index: newIndex });
      setSelectedImageIndex(newIndex);
    }
  };

  const handleNextImage = () => {
    if (selectedImageIndex < originalImages.length - 1) {
      const newIndex = selectedImageIndex + 1;
      modalFlatListRef.current?.scrollToIndex({ index: newIndex });
      setSelectedImageIndex(newIndex);
    }
  };

  return (
    <View style={styles.carouselWrapper}>
      <Animated.FlatList
        ref={flatListRef}
        data={images}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(_, index) => index.toString()}
        pagingEnabled
        snapToInterval={ITEM_WIDTH}
        decelerationRate="fast"
        getItemLayout={(_, index) => ({ length: ITEM_WIDTH, offset: ITEM_WIDTH * index, index })}
        onScroll={Animated.event([
          { nativeEvent: { contentOffset: { x: scrollX } } },
        ], { useNativeDriver: false })}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        renderItem={({ item, index }) => (
          <TouchableOpacity onPress={() => openImageViewer(index)}>
            <View style={styles.imageContainer}>
              {!loadedImages[item.uri] && (
                <View style={styles.imageLoader}>
                  <ActivityIndicator size="large" color="#fff" />
                </View>
              )}
              <FastImage
                source={{ uri: item.uri }}
                style={styles.image}
                resizeMode={FastImage.resizeMode.cover}
                onLoad={() => markImageLoaded(item.uri)}
              />
            </View>
          </TouchableOpacity>
        )}
      />

      {originalImages.length > 1 && (
        <View style={styles.dotContainer}>
          {originalImages.map((_, i) => {
            const inputRange = [ITEM_WIDTH * i, ITEM_WIDTH * (i + 1), ITEM_WIDTH * (i + 2)];
            const dotWidth = scrollX.interpolate({ inputRange, outputRange: [8, 20, 8], extrapolate: 'clamp' });
            const opacity = scrollX.interpolate({ inputRange, outputRange: [0.4, 1, 0.4], extrapolate: 'clamp' });
            return <Animated.View key={i} style={[styles.dot, { width: dotWidth, opacity }]} />;
          })}
        </View>
      )}

      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalBackground}>
          <TouchableOpacity style={styles.closeButton} onPress={closeImageViewer}>
            <FontAwesomeIcon icon={faTimesCircle} size={30} color="#fff" />
          </TouchableOpacity>

          <Animated.View
            style={[styles.swipeFeedback, {
              opacity: swipeAnim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, 1, 0] }),
              transform: [{ translateX: swipeAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 10] }) }],
            }]}
          >
            <Text style={styles.swipeHintText}>Swipe</Text>
          </Animated.View>

          <FlatList
            ref={modalFlatListRef}
            data={originalImages}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            keyExtractor={(_, index) => `preview-${index}`}
            getItemLayout={(_, index) => ({ length: width, offset: width * index, index })}
            initialScrollIndex={selectedImageIndex}
            onMomentumScrollEnd={(e) => {
              const index = Math.round(e.nativeEvent.contentOffset.x / width);
              setSelectedImageIndex(index);
              playSwipeAnimation();
            }}
            renderItem={({ item }) => (
              <View style={{ width, height, justifyContent: 'center', alignItems: 'center' }}>
                <FastImage
                  source={{ uri: item.uri }}
                  style={styles.fullImage}
                  resizeMode={FastImage.resizeMode.contain}
                  onLoadStart={() => setModalImageLoading(true)}
                  onLoadEnd={() => setModalImageLoading(false)}
                />
              </View>
            )}
          />

          {originalImages.length > 1 && selectedImageIndex > 0 && (
            <TouchableOpacity style={styles.leftSwipeIcon} onPress={handlePrevImage}>
              <View style={styles.swipeTouchable}>
                <FontAwesomeIcon icon={faArrowLeft} size={28} color="white" />
              </View>
            </TouchableOpacity>
          )}

          {originalImages.length > 1 && selectedImageIndex < originalImages.length - 1 && (
            <TouchableOpacity style={styles.rightSwipeIcon} onPress={handleNextImage}>
              <View style={styles.swipeTouchable}>
                <FontAwesomeIcon icon={faArrowRight} size={28} color="white" />
              </View>
            </TouchableOpacity>
          )}

          {modalImageLoading && (
            <ActivityIndicator size="large" color="#ffffff" style={styles.modalLoader} />
          )}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  carouselWrapper: { height: 200, position: 'relative' },
  imageContainer: {
    width: ITEM_WIDTH,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#eee',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: { width: '100%', height: '100%' },
  imageLoader: {
    position: 'absolute',
    width: ITEM_WIDTH,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#00000055',
    zIndex: 1,
  },
  dotContainer: {
    position: 'absolute',
    bottom: 15,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  dot: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#000',
    marginHorizontal: 4,
  },
  modalBackground: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullImage: {
    width: width,
    height: height,
  },
  modalLoader: {
    position: 'absolute',
    top: height / 2 - 25,
    alignSelf: 'center',
    zIndex: 1,
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 3,
    backgroundColor: '#00000060',
    borderRadius: 20,
    padding: 4,
  },
  swipeFeedback: {
    position: 'absolute',
    top: 120,
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    zIndex: 10,
  },
  swipeHintText: {
    color: '#fff',
    fontSize: 14,
  },
  leftSwipeIcon: {
    position: 'absolute',
    left: 0,
    top: height / 2,
    zIndex: 5,
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderTopRightRadius: 30,
    borderBottomRightRadius: 30,
  },
  rightSwipeIcon: {
    position: 'absolute',
    right: 0,
    top: height / 2,
    zIndex: 5,
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderTopLeftRadius: 30,
    borderBottomLeftRadius: 30,
  },
  swipeTouchable: {
    padding: 10,
  },
});