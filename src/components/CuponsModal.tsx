// CuponsModal.tsx
import { faCopy } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import React, { useCallback, useRef, useState } from "react";
import {
    View,
    Text,
    FlatList,
    NativeSyntheticEvent,
    NativeScrollEvent,
    LayoutChangeEvent,
    StyleSheet,
    TouchableOpacity,
} from "react-native";
import Modal from "react-native-modal";
import Toast from "react-native-toast-message";
import CustomToast from "./CustomToast";
import Clipboard from '@react-native-clipboard/clipboard';

type Props = {
    isVisible: boolean;
    setCuponModalvisible: React.Dispatch<React.SetStateAction<boolean>>;
};

const ITEM_ESTIMATED_HEIGHT = 120; // tweak if your card is taller/shorter

const CuponCard = ({ code, description, expiry }: { code: string; description: string; expiry: string }) => {
    
    const handleCopyCode = (code: string) => {
        Toast.show({
            type: 'success',
            text1: 'Coupon Code Copied!',
            position: 'top',
            visibilityTime: 2000,
        })
        Clipboard.setString(code);
    }    
    return (
 <View style={styles.card}>
        <View className="flex-row justify-between items-center">
            <View style={styles.codeBox}>
                <Text style={styles.codeText}>{code}</Text>
            </View>
            <TouchableOpacity
            onPress={() => handleCopyCode(code)}
            >
                <FontAwesomeIcon icon={faCopy} size={20} color={'#e0dddd'} />
            </TouchableOpacity>
        </View>
        <View style={{ marginTop: 6, marginBottom: 8 }}>
            <Text style={styles.expiryText}>Valid till: {expiry}</Text>
        </View>
        <Text style={styles.descText}>{description}</Text>
    </View>
)};

const CuponsModal: React.FC<Props> = ({ isVisible, setCuponModalvisible }) => {
    const cuponsData = [
        { id: "1", code: "WELCOME10", description: "Get 10% off on your first order", expiry: "2024-12-31" },
        { id: "2", code: "FREESHIP", description: "Free shipping on orders over $50", expiry: "2024-11-30" },
        { id: "3", code: "SAVE20", description: "Save $20 on orders over $100", expiry: "2024-10-15" },
        { id: "4", code: "HOLIDAY15", description: "15% off during holiday season", expiry: "2024-12-25" },
        { id: "5", code: "SPRING5", description: "Get $5 off on spring collection", expiry: "2024-09-30" },
        { id: "6", code: "SUMMER10", description: "10% off on summer collection", expiry: "2024-08-31" },
        { id: "7", code: "FALL20", description: "20% off on fall collection", expiry: "2024-11-30" },
        { id: "8", code: "WINTER25", description: "25% off on winter collection", expiry: "2024-12-31" },
        { id: "9", code: "BIRTHDAY30", description: "30% off on your birthday", expiry: "2024-12-31" },
        { id: "10", code: "LOYALTY15", description: "15% off for loyal customers", expiry: "2024-12-31" },
    ];

    const flatListRef = useRef<FlatList | null>(null);
    const [scrollOffset, setScrollOffset] = useState<number>(0);
    const [containerHeight, setContainerHeight] = useState<number>(0);

    // onScroll for FlatList -> update scrollOffset (so modal knows where the list is)
    const onListScroll = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
        setScrollOffset(e.nativeEvent.contentOffset.y);
    }, []);

    // handle modal asking to scroll: map modal's scrollTo param -> FlatList.scrollToOffset
    const modalScrollTo = useCallback((p: any) => {
        // react-native-modal sometimes passes a number, sometimes an object. normalize it:
        const offset = typeof p === "number" ? p : p?.offset ?? p?.y ?? 0;
        flatListRef.current?.scrollToOffset({ offset, animated: true });
    }, []);

    // measure container height so we can set scrollOffsetMax
    const onContainerLayout = useCallback((e: LayoutChangeEvent) => {
        setContainerHeight(e.nativeEvent.layout.height);
    }, []);

    // rough maximum scroll range (tweak ITEM_ESTIMATED_HEIGHT to match your card)
    const scrollOffsetMax = Math.max(1, cuponsData.length * ITEM_ESTIMATED_HEIGHT - containerHeight + 50);

    return (
        <Modal
            isVisible={isVisible}
            propagateSwipe={true}                // allow children to receive gestures
            swipeDirection={"down"}              // enable swipe-to-close
            onSwipeComplete={() => setCuponModalvisible(false)}
            style={{ margin: 0, justifyContent: "flex-end" }}
            scrollTo={modalScrollTo}             // REQUIRED so modal can forward drag gestures
            scrollOffset={scrollOffset}
            scrollOffsetMax={scrollOffsetMax}
            useNativeDriverForBackdrop={true}
        >
            <View style={styles.container} onLayout={onContainerLayout}>
                 {/*drag pointer*/}
                 <View className='h-2 w-8 bg-gray-500 self-center mt-2 rounded'></View>

                <FlatList
                    ref={flatListRef}
                    data={cuponsData}
                    keyExtractor={(i) => i.id}
                    renderItem={({ item }) => (
                        <CuponCard code={item.code} description={item.description} expiry={item.expiry} />
                    )}
                    ListHeaderComponent={<Text style={styles.header}>Available Coupons</Text>}
                    onScroll={onListScroll}
                    scrollEventThrottle={16}
                    nestedScrollEnabled={true}           // important for Android nested scrolling
                    keyboardShouldPersistTaps="handled"
                    contentContainerStyle={{ paddingBottom: 40 }}
                    showsVerticalScrollIndicator={true}
                />
            </View>
            <CustomToast/>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: { width: "100%", height: "70%", backgroundColor: "white", borderTopLeftRadius: 12, borderTopRightRadius: 12, overflow: "hidden" },
    dragHandle: { height: 6, width: 48, backgroundColor: "#ccc", alignSelf: "center", borderRadius: 4, marginTop: 8 },
    header: { fontSize: 20, fontWeight: "700", margin: 16 },
    card: { margin: 12, 
        padding: 14, 
        backgroundColor: "white", 
        borderRadius: 10, 
        elevation: 4, 
        shadowColor: "#000", 
        shadowOpacity: 0.2, 
        shadowOffset: 
        { 
            width: 0, 
            height: 2 
        },
        shadowRadius: 4 
    },
    codeBox: { backgroundColor: "#ffbfbf", padding: 8, borderRadius: 8, alignSelf: "flex-start" },
    codeText: { fontSize: 18, fontWeight: "700" },
    expiryText: { color: "#666", fontSize: 13 },
    descText: { color: "#666", fontSize: 16, marginTop: 6 },
});

export default CuponsModal;
