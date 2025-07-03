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
  Image, // Import Image for fallback if FastImage is not used
} from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faTimesCircle, faArrowLeft, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import FastImage from 'react-native-fast-image'; // Make sure FastImage is installed

const { width, height } = Dimensions.get('window');
const ITEM_WIDTH = width - 32; // Assuming a standard margin of 16px on each side

interface ImageItem {
  uri: string;
  // You can add other properties here if needed, like id, alt text, etc.
}

interface OrderDetailsCarouselProps {
  images: ImageItem[]; // Now explicitly expects an array of ImageItem
}

export default function OrderDetailsCarousel({ images: originalImages }: OrderDetailsCarouselProps) {
  // If no images are passed, render a placeholder or nothing
  if (!originalImages || originalImages.length === 0) {
    return (
      <View style={styles.noImagesContainer}>
        <Text style={styles.noImagesText}>No images available</Text>
      </View>
    );
  }

  // Create a looped array for the carousel effect if more than one image
  const loopedImages = originalImages.length > 1
    ? [originalImages[originalImages.length - 1], ...originalImages, originalImages[0]]
    : originalImages;

  const scrollX = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef<FlatList<ImageItem>>(null);
  const modalFlatListRef = useRef<FlatList<ImageItem>>(null);
  // Initial active index for looping carousel is the first actual image (index 1 in loopedImages)
  const [activeIndex, setActiveIndex] = useState(originalImages.length > 1 ? 1 : 0);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0); // Index for the originalImages array
  const [modalImageLoading, setModalImageLoading] = useState(false);
  const [loadedImages, setLoadedImages] = useState<{ [key: string]: boolean }>({});
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const swipeAnim = useRef(new Animated.Value(0)).current;

  // Effect for initial scroll to the actual first image for the looping effect
  useEffect(() => {
    if (originalImages.length > 1) {
      // Use setTimeout to ensure FlatList is fully rendered before scrolling
      setTimeout(() => {
        flatListRef.current?.scrollToIndex({ index: 1, animated: false });
      }, 100);
    }
  }, [originalImages.length]);

  // Effect for automatic carousel scrolling
  useEffect(() => {
    if (!modalVisible && originalImages.length > 1) {
      if (intervalRef.current) clearInterval(intervalRef.current); // Clear previous interval
      intervalRef.current = setInterval(() => {
        const nextIndex = activeIndex + 1;
        flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
      }, 3000); // Scrolls every 3 seconds
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current); // Stop auto-scroll when modal is open or only one image
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current); // Cleanup on unmount
    };
  }, [activeIndex, modalVisible, originalImages.length]);

  // Handle scroll end for seamless looping
  const handleMomentumScrollEnd = (e: any) => {
    const offsetX = e.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / ITEM_WIDTH);
    let newIndex = index;

    if (originalImages.length > 1) {
      if (index === 0) { // Scrolled from first actual image to last duplicate
        newIndex = originalImages.length; // Jump to last actual image
        flatListRef.current?.scrollToIndex({ index: newIndex, animated: false });
      } else if (index === loopedImages.length - 1) { // Scrolled from last actual image to first duplicate
        newIndex = 1; // Jump to first actual image
        flatListRef.current?.scrollToIndex({ index: newIndex, animated: false });
      }
    }
    setActiveIndex(newIndex);
  };

  const markImageLoaded = (uri: string) => {
    setLoadedImages((prev) => ({ ...prev, [uri]: true }));
  };

  // Open the modal image viewer
  const openImageViewer = (index: number) => {
    // Adjust the index to correspond to the originalImages array
    const realIndex = originalImages.length > 1 ? index - 1 : index;
    setSelectedImageIndex(realIndex);
    setModalVisible(true);
    setModalImageLoading(true);
    // Ensure modal FlatList scrolls to the correct image after it's rendered
    setTimeout(() => {
      modalFlatListRef.current?.scrollToIndex({ index: realIndex, animated: false });
    }, 50);
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
    }).start(() => {
      // Optional: reset value after animation or keep it for a fade-out
      swipeAnim.setValue(0);
    });
  };

  const handlePrevImage = () => {
    if (selectedImageIndex > 0) {
      const newIndex = selectedImageIndex - 1;
      modalFlatListRef.current?.scrollToIndex({ index: newIndex, animated: true });
      setSelectedImageIndex(newIndex);
      playSwipeAnimation(); // Play hint animation
    }
  };

  const handleNextImage = () => {
    if (selectedImageIndex < originalImages.length - 1) {
      const newIndex = selectedImageIndex + 1;
      modalFlatListRef.current?.scrollToIndex({ index: newIndex, animated: true });
      setSelectedImageIndex(newIndex);
      playSwipeAnimation(); // Play hint animation
    }
  };

  return (
    <View style={styles.carouselWrapper}>
      <Animated.FlatList
        ref={flatListRef}
        data={loopedImages} // Use loopedImages for the main carousel
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(_, index) => `carousel-item-${index.toString()}`}
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
              {FastImage ? (
                <FastImage
                  source={{ uri: item.uri }}
                  style={styles.image}
                  resizeMode={FastImage.resizeMode.cover}
                  onLoad={() => markImageLoaded(item.uri)}
                />
              ) : (
                <Image // Fallback to regular Image
                  source={{ uri: item.uri }}
                  style={styles.image}
                  resizeMode="cover"
                  onLoad={() => markImageLoaded(item.uri)}
                />
              )}
            </View>
          </TouchableOpacity>
        )}
      />

      {originalImages.length > 1 && (
        <View style={styles.dotContainer}>
          {originalImages.map((_, i) => {
            // Calculate input range based on actual image indices within loopedImages
            const inputRange = [
              ITEM_WIDTH * i,
              ITEM_WIDTH * (i + 1),
              ITEM_WIDTH * (i + 2),
            ];
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
              transform: [{ translateY: swipeAnim.interpolate({ inputRange: [0, 1], outputRange: [-10, 0] }) }], // Subtle up-down animation
            }]}
          >
            <Text style={styles.swipeHintText}>Swipe to navigate</Text>
          </Animated.View>

          <FlatList
            ref={modalFlatListRef}
            data={originalImages} // Use originalImages for the modal
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            keyExtractor={(_, index) => `modal-preview-${index}`}
            getItemLayout={(_, index) => ({ length: width, offset: width * index, index })}
            initialScrollIndex={selectedImageIndex}
            onMomentumScrollEnd={(e) => {
              const index = Math.round(e.nativeEvent.contentOffset.x / width);
              setSelectedImageIndex(index);
              playSwipeAnimation();
            }}
            renderItem={({ item }) => (
              <View style={styles.fullImageContainer}>
                {modalImageLoading && ( // Show loader only when the specific modal image is loading
                  <ActivityIndicator size="large" color="#ffffff" style={styles.modalImageLoader} />
                )}
                {FastImage ? (
                  <FastImage
                    source={{ uri: item.uri }}
                    style={styles.fullImage}
                    resizeMode={FastImage.resizeMode.contain}
                    onLoadStart={() => setModalImageLoading(true)}
                    onLoadEnd={() => setModalImageLoading(false)}
                  />
                ) : (
                  <Image // Fallback to regular Image
                    source={{ uri: item.uri }}
                    style={styles.fullImage}
                    resizeMode="contain"
                    onLoadStart={() => setModalImageLoading(true)}
                    onLoadEnd={() => setModalImageLoading(false)}
                  />
                )}
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
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  carouselWrapper: {
    height: height / 3.5, // Using a calculated height, adjust as needed
    position: 'relative',
    marginHorizontal: 16, // Apply horizontal margin to the wrapper
    borderRadius: 16, // Match the border radius of the images
    overflow: 'hidden', // Ensure content respects border radius
  },
  noImagesContainer: {
    height: height / 3.5,
    marginHorizontal: 16,
    borderRadius: 16,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  noImagesText: {
    color: '#888',
    fontSize: 16,
  },
  imageContainer: {
    width: width - 32,
    height: '100%', // Take full height of the wrapper
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#eee',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 16, // Apply border radius here as well
  },
  imageLoader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 1,
    borderRadius: 16, // Match border radius
  },
  dotContainer: {
    position: 'absolute',
    bottom: 15,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 16, // Ensure dots are within bounds
  },
  dot: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#000',
    marginHorizontal: 4,
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)', // Slightly transparent black background
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullImageContainer: {
    width: width,
    height: height,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullImage: {
    width: '100%',
    height: '100%',
  },
  modalImageLoader: { // Loader specifically for the image in the modal
    position: 'absolute',
    zIndex: 1,
  },
  closeButton: {
    position: 'absolute',
    top: 50, // Adjusted for typical safe area
    right: 20,
    zIndex: 3,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 20,
    padding: 6,
  },
  swipeFeedback: {
    position: 'absolute',
    top: 100, // Positioned above the image
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
    top: '50%', // Center vertically
    marginTop: -30, // Adjust for half of height (60/2)
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
    top: '50%', // Center vertically
    marginTop: -30, // Adjust for half of height (60/2)
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
    padding: 10, // Gives more touchable area
  },
});