import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  View,
  FlatList,
  Dimensions,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Modal,
  Image as RNImage,
  Platform,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import Text from './Text';

const { width: screenWidth } = Dimensions.get('window');

const ITEM_WIDTH = screenWidth * 0.9;
const ITEM_HORIZONTAL_PADDING = (screenWidth - ITEM_WIDTH) / 2;
const SNAP_INTERVAL = ITEM_WIDTH;

export interface CarouselItem {
  id: number;
  uri: string;
}

interface InfiniteCarouselProps {
  imagesData: CarouselItem[];
}

export default function InfiniteCarousel({ imagesData }: InfiniteCarouselProps) {
  const flatListRef = useRef<FlatList<CarouselItem>>(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const [activeIndex, setActiveIndex] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalImage, setModalImage] = useState<string | null>(null);

  const shouldLoop = imagesData.length > 1;

  const images = shouldLoop
    ? [imagesData[imagesData.length - 1], ...imagesData, imagesData[0]]
    : imagesData;

  useEffect(() => {
    if (shouldLoop) {
      setTimeout(() => {
        flatListRef.current?.scrollToOffset({
          offset: SNAP_INTERVAL,
          animated: false,
        });
      }, 50);
    }
  }, [shouldLoop]);

  useEffect(() => {
    if (!shouldLoop) return;

    const interval = setInterval(() => {
      let nextIndex = activeIndex + 2;

      if (nextIndex >= images.length) {
        flatListRef.current?.scrollToOffset({
          offset: SNAP_INTERVAL,
          animated: false,
        });
        nextIndex = 2;
      }

      flatListRef.current?.scrollToOffset({
        offset: nextIndex * SNAP_INTERVAL,
        animated: true,
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [activeIndex]);

  const handleMomentumScrollEnd = useCallback((e) => {
    if (!shouldLoop) return;

    const offsetX = e.nativeEvent.contentOffset.x;
    const snappedIndex = Math.round(offsetX / SNAP_INTERVAL);

    if (snappedIndex === 0) {
      flatListRef.current?.scrollToOffset({
        offset: imagesData.length * SNAP_INTERVAL,
        animated: false,
      });
      setActiveIndex(imagesData.length - 1);
    } else if (snappedIndex === images.length - 1) {
      flatListRef.current?.scrollToOffset({
        offset: SNAP_INTERVAL,
        animated: false,
      });
      setActiveIndex(0);
    } else {
      setActiveIndex(snappedIndex - 1);
    }
  }, []);

  const openModal = (uri: string) => {
    setModalImage(uri);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setModalImage(null);
  };

  const viewabilityConfigCallbackPairs = useRef([{
    viewabilityConfig: {
      itemVisiblePercentThreshold: 50,
      minimumViewTime: 100,
    },
    onViewableItemsChanged: ({ viewableItems }: any) => {
      const visible = viewableItems.find(item => item.isViewable);
      if (!visible || visible.index == null) return;

      const currentIndex = visible.index;
      const index = currentIndex === 0
        ? imagesData.length - 1
        : currentIndex === images.length - 1
        ? 0
        : currentIndex - 1;

      setActiveIndex(index);
    }
  }]);

  if (imagesData.length === 0) {
    return (
      <View style={styles.carouselWrapperEmpty}>
        <Text style={styles.emptyText}>No images to display.</Text>
      </View>
    );
  }

  if (imagesData.length === 1) {
    const item = imagesData[0];
    return (
      <View style={styles.carouselWrapper}>
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => openModal(item.uri)}
          style={styles.imageContainerSingle}
        >
          {FastImage ? (
            <FastImage source={{ uri: item.uri }} style={styles.image} resizeMode="cover" />
          ) : (
            <RNImage source={{ uri: item.uri }} style={styles.image} resizeMode="cover" />
          )}
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.carouselWrapper}>
      <Animated.FlatList
        ref={flatListRef}
        data={images}
        horizontal
        keyExtractor={(item, index) => `${item.id}-${index}`}
        showsHorizontalScrollIndicator={false}
        pagingEnabled={false}
        snapToInterval={SNAP_INTERVAL}
        snapToAlignment="center"
        decelerationRate="fast"
        contentContainerStyle={styles.flatListContentMulti}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        viewabilityConfigCallbackPairs={viewabilityConfigCallbackPairs.current}
        getItemLayout={(data, index) => ({
          length: SNAP_INTERVAL,
          offset: SNAP_INTERVAL * index,
          index,
        })}
        renderItem={({ item }) => (
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => openModal(item.uri)}
            style={styles.itemWrapper}
          >
            <View style={styles.imageContainer}>
              {FastImage ? (
                <FastImage source={{ uri: item.uri }} style={styles.image} resizeMode="cover" />
              ) : (
                <RNImage source={{ uri: item.uri }} style={styles.image} resizeMode="cover" />
              )}
            </View>
          </TouchableOpacity>
        )}
      />

      <View style={styles.dotContainer}>
        {imagesData.map((_, i) => (
          <Animated.View
            key={i}
            style={[
              styles.dot,
              {
                width: activeIndex === i ? 20 : 8,
                opacity: activeIndex === i ? 1 : 0.4,
              },
            ]}
          />
        ))}
      </View>

      <Modal visible={modalVisible} transparent onRequestClose={closeModal}>
        <View style={styles.modalContainer}>
          <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
            <FontAwesomeIcon icon={faTimesCircle} size={30} color="#fff" />
          </TouchableOpacity>
          {modalImage && (
            FastImage ? (
              <FastImage source={{ uri: modalImage }} style={styles.modalImage} resizeMode="contain" />
            ) : (
              <RNImage source={{ uri: modalImage }} style={styles.modalImage} resizeMode="contain" />
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
    width: screenWidth,
    alignSelf: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  carouselWrapperEmpty: {
    height: 220,
    width: ITEM_WIDTH,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 16,
    marginVertical: 10,
    alignSelf: 'center',
  },
  emptyText: {
    color: '#666',
    fontSize: 16,
  },
  flatListContentMulti: {
    paddingHorizontal: ITEM_HORIZONTAL_PADDING,
  },
  itemWrapper: {
    width: ITEM_WIDTH,
    borderRadius: 16,
    overflow: 'hidden',
  },
  imageContainer: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    overflow: 'hidden',
  },
  imageContainerSingle: {
    height: 220,
    width: ITEM_WIDTH,
    marginHorizontal: ITEM_HORIZONTAL_PADDING,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    overflow: 'hidden',
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
    top: Platform.OS === 'ios' ? 60 : 40,
    right: 20,
    zIndex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    padding: 5,
  },
});
