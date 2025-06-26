import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    FlatList,
    SafeAreaView,
    KeyboardAvoidingView,
    Platform,
    Image,
    Animated,
    Linking,
    StatusBar,
    ActivityIndicator,
    Keyboard // Added Keyboard import for dismissing it
} from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faArrowLeft, faPhone, faPaperclip, faTimes, faCheck, faCheckDouble } from '@fortawesome/free-solid-svg-icons';
import { GestureHandlerRootView, PanGestureHandler, State } from 'react-native-gesture-handler';
import { launchImageLibrary } from 'react-native-image-picker';

// --- Constants ---
const generateUniqueId = () => Math.random().toString(36).substring(2) + Date.now().toString(36);
const MY_USER_ID = 'user123';
const SUPPORT_USER_ID = 'support456';

// Mock replies for support agent
const SUPPORT_REPLIES = [
    "Thanks for reaching out! How can I assist you further?",
    "I understand. Let me look into that for you.",
    "Could you please provide more details?",
    "We're currently experiencing high volume. Your query is important to us.",
    "Thank you for your patience. I'll be right with you.",
    "Got it. I'm checking with the team now."
];

const SupportScreen = ({ navigation }) => {
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const [isSupportTyping, setIsSupportTyping] = useState(false);
    const [repliedToMessage, setRepliedToMessage] = useState(null);
    const flatListRef = useRef(null);
    const inputRef = useRef(null); // Ref for TextInput

    // --- Effects ---
    // Auto-scroll to end of messages when messages change
    useEffect(() => {
        if (flatListRef.current) {
            // Use setTimeout to ensure scroll happens after render and layout calculations
            const timer = setTimeout(() => {
                flatListRef.current.scrollToEnd({ animated: true });
            }, 100); // Small delay
            return () => clearTimeout(timer);
        }
    }, [messages]);

    // --- Message Sending Logic ---
    const sendMessage = () => {
        if (inputText.trim() === '' && !repliedToMessage) return;

        const newMessage = {
            id: generateUniqueId(),
            text: inputText.trim(),
            timestamp: new Date().toISOString(),
            userId: MY_USER_ID,
            repliedTo: repliedToMessage,
            mediaUri: null,
            status: 'sent', // Initial status
        };

        // Add user's message immediately
        setMessages((prev) => [...prev, newMessage]);
        setInputText(''); // Clear input
        setRepliedToMessage(null); // Clear reply context
        Keyboard.dismiss(); // Dismiss keyboard after sending

        // Simulate support reply
        const typingDelay = 1000; // Delay before typing indicator appears
        const replyDelay = 3000; // Delay before support sends actual reply (after typing starts)

        setTimeout(() => {
            setIsSupportTyping(true); // Support starts typing
        }, typingDelay);

        setTimeout(() => {
            setIsSupportTyping(false); // Support stops typing

            const randomReplyText = SUPPORT_REPLIES[Math.floor(Math.random() * SUPPORT_REPLIES.length)];
            const supportReply = {
                id: generateUniqueId(),
                text: newMessage.text ? `${randomReplyText}` : randomReplyText, // Simpler reply
                timestamp: new Date().toISOString(),
                userId: SUPPORT_USER_ID,
                repliedTo: newMessage, // Support is replying to user's message
                mediaUri: null,
                status: 'sent',
            };

            setMessages((curr) =>
                curr.map((msg) =>
                    msg.id === newMessage.id ? { ...msg, status: 'read' } : msg // Mark user's message as read
                ).concat(supportReply) // Add support's reply
            );
        }, typingDelay + replyDelay); // Total delay for reply
    };

    const handleMediaUpload = async () => {
        try {
            const result = await launchImageLibrary({
                mediaType: 'mixed', // Allows both photos and videos
                selectionLimit: 1, // Only one asset at a time
                quality: 0.7, // Reduce quality for faster upload
            });

            if (result.didCancel) {
                console.log('User cancelled image picker');
                return;
            }
            if (result.errorCode) {
                console.log('ImagePicker Error: ', result.errorCode);
                return;
            }

            if (result.assets && result.assets.length > 0) {
                const uri = result.assets[0].uri;

                const mediaMessage = {
                    id: generateUniqueId(),
                    text: '', // Media messages usually don't have text directly
                    timestamp: new Date().toISOString(),
                    userId: MY_USER_ID,
                    mediaUri: uri,
                    repliedTo: repliedToMessage,
                    status: 'sent',
                };

                setMessages((prev) => [...prev, mediaMessage]);
                setRepliedToMessage(null); // Clear reply context
                Keyboard.dismiss();

                // Simulate support reply to media
                const typingDelay = 1000;
                const replyDelay = 3000;

                setTimeout(() => {
                    setIsSupportTyping(true);
                }, typingDelay);

                setTimeout(() => {
                    setIsSupportTyping(false);
                    const supportReply = {
                        id: generateUniqueId(),
                        text: 'Thanks for the media! Let me check that and get back to you shortly.',
                        timestamp: new Date().toISOString(),
                        userId: SUPPORT_USER_ID,
                        repliedTo: mediaMessage,
                        mediaUri: null,
                        status: 'sent',
                    };
                    setMessages((curr) =>
                        curr.map((msg) =>
                            msg.id === mediaMessage.id ? { ...msg, status: 'read' } : msg
                        ).concat(supportReply)
                    );
                }, typingDelay + replyDelay);
            }
        } catch (error) {
            console.warn('Media picker error:', error);
        }
    };

    // --- Header Actions ---
    const handleBack = () => navigation?.goBack?.();

    const handleCallSupport = () => {
        Linking.openURL('tel:+1234567890').catch((err) => console.log('Call failed:', err));
    };

    // --- UI Components ---
    const TypingIndicator = () => (
        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#E8E8E8', borderRadius: 20, padding: 8, marginLeft: 10, alignSelf: 'flex-start', marginBottom: 4 }}>
            <ActivityIndicator size="small" color="#DA2824" style={{ marginRight: 8 }} />
            <Text style={{ fontSize: 13, color: '#555' }}>Support is typing...</Text>
        </View>
    );

    const Message = ({ item }) => {
        const message = item;
        const isMyMessage = message.userId === MY_USER_ID;
        const date = new Date(message.timestamp);
        const timeString = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const translateX = useRef(new Animated.Value(0)).current;

        // PanGestureHandler for swipe-to-reply
        const onGestureEvent = Animated.event(
            [{ nativeEvent: { translationX: translateX } }],
            { useNativeDriver: true }
        );

        const onHandlerStateChange = (event) => {
            if (event.nativeEvent.state === State.END) {
                if (event.nativeEvent.translationX > 60 && message.userId !== MY_USER_ID) {
                    setRepliedToMessage(message);
                    setTimeout(() => {
                        inputRef.current?.focus();
                        // For iOS, Keyboard.show() might be needed sometimes if focus isn't enough
                    }, 100);
                }
                // Animate back to original position
                Animated.spring(translateX, {
                    toValue: 0,
                    useNativeDriver: true,
                    bounciness: 10,
                    speed: 10
                }).start();
            }
        };

        return (
            // Only enable swipe for messages from the other user
            <PanGestureHandler
                onGestureEvent={onGestureEvent}
                onHandlerStateChange={onHandlerStateChange}
                enabled={message.userId !== MY_USER_ID}
            >
                <Animated.View style={{
                    transform: [{ translateX }],
                    alignSelf: isMyMessage ? 'flex-end' : 'flex-start',
                    marginHorizontal: 10,
                    marginVertical: 4,
                    maxWidth: '80%',
                    backgroundColor: isMyMessage ? '#DCF8C6' : '#E8E8E8', // Light green for my messages, light gray for support
                    borderRadius: 20,
                    padding: 10,
                    // Specific border radii for chat bubble shape
                    borderTopLeftRadius: isMyMessage ? 20 : 0,
                    borderTopRightRadius: isMyMessage ? 0 : 20,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.1,
                    shadowRadius: 1,
                    elevation: 1,
                }}>
                    {message.repliedTo && (
                        <View style={{
                            backgroundColor: isMyMessage ? 'rgba(0,0,0,0.05)' : 'rgba(0,0,0,0.08)', // Slightly darker background for replied message
                            borderLeftWidth: 3,
                            borderColor: '#DA2824', // Consistent red border for replied message
                            padding: 6,
                            marginBottom: 6,
                            borderRadius: 8,
                        }}>
                            <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#333' }}>
                                {message.repliedTo.userId === MY_USER_ID ? 'You' : 'Support'}
                            </Text>
                            <Text style={{ fontSize: 12, color: '#555' }} numberOfLines={1}>
                                {message.repliedTo.mediaUri ? '(Image)' : message.repliedTo.text}
                            </Text>
                        </View>
                    )}
                    {message.mediaUri && (
                        <Image source={{ uri: message.mediaUri }} style={{ width: 180, height: 180, borderRadius: 12, marginBottom: 5 }} resizeMode="cover" />
                    )}
                    {!!message.text && (
                        <Text style={{ color: '#333', fontSize: 15 }}>{message.text}</Text>
                    )}
                    <View style={{ flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', marginTop: 4 }}>
                        <Text style={{ fontSize: 10, color: '#607D8B' }}>{timeString}</Text>
                        {isMyMessage && (
                            <FontAwesomeIcon
                                icon={message.status === 'read' ? faCheckDouble : faCheck}
                                size={10}
                                color={message.status === 'read' ? '#DA2824' : '#607D8B'} // Red when read, gray when sent
                                style={{ marginLeft: 4 }}
                            />
                        )}
                    </View>
                </Animated.View>
            </PanGestureHandler>
        );
    };

    return (
        <>
            {/* Status Bar: Ensures content is below on Android, and visual style for both */}
            <StatusBar
                backgroundColor="white" // Status bar background for Android
                barStyle="dark-content" // Text/icon color for status bar
            />
            <GestureHandlerRootView style={{ flex: 1 }}>
                {/* SafeAreaView: Handles notches/cutouts on iOS. On Android, it typically does nothing as it's handled by StatusBar/system. */}
                <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
                    {/* Header */}
                    <View style={{
                        flexDirection: 'row',
                        backgroundColor: '#fff',
                        paddingHorizontal: 16,
                        // Fix for Android header overlap: Add paddingTop for StatusBar.currentHeight
                        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 12 : 12, // +12 for additional spacing
                        paddingBottom: 12,
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        borderBottomWidth: 1,
                        borderColor: '#E0E0E0',
                        shadowColor: '#000', // For iOS shadow
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.1,
                        shadowRadius: 3,
                        elevation: 5, // For Android shadow
                    }}>
                        <TouchableOpacity onPress={handleBack} style={{ padding: 5 }}>
                            <FontAwesomeIcon icon={faArrowLeft} size={20} color="#000" />
                        </TouchableOpacity>
                        <Text style={{ color: '#000', fontSize: 18, fontWeight: 'bold' }}>Ship My Pack Support</Text>
                        <TouchableOpacity onPress={handleCallSupport} style={{ padding: 5 }}>
                            <FontAwesomeIcon icon={faPhone} size={20} color="#FF5A5F" />
                        </TouchableOpacity>
                    </View>

                    {/* Chat Messages */}
                    <FlatList
                        ref={flatListRef}
                        data={messages}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item }) => <Message item={item} />}
                        // *** KEY CHANGE HERE: Add flex: 1 to FlatList itself ***
                        style={{ flex: 1 }}
                        contentContainerStyle={{ padding: 10, backgroundColor: '#F0F2F5', flexGrow: 1 }}
                        keyboardShouldPersistTaps="handled" // Prevents keyboard from closing on message tap
                    />

                    {/* Typing Indicator */}
                    {isSupportTyping && (
                        <View style={{ marginBottom: 6, marginLeft: 10 }}>
                            <TypingIndicator />
                        </View>
                    )}

                    {/* Input Area */}
                    <KeyboardAvoidingView
                        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                        keyboardVerticalOffset={0}
                        style={{ paddingHorizontal: 10, paddingTop: 6, paddingBottom: Platform.OS === 'ios' ? 10 : 6, backgroundColor: '#F0F2F5' }}
                    >
                        {repliedToMessage && (
                            <View style={{ backgroundColor: '#eee', padding: 8, borderRadius: 10, marginBottom: 6, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderLeftWidth: 4, borderColor: '#DA2824' }}>
                                <View style={{ flex: 1 }}>
                                    <Text style={{ fontWeight: 'bold', color: '#DA2824', marginBottom: 2 }}>
                                        Replying to {repliedToMessage.userId === MY_USER_ID ? 'Your' : 'Support'} Message
                                    </Text>
                                    <Text numberOfLines={1} style={{ fontSize: 13, color: '#555' }}>
                                        {repliedToMessage.mediaUri ? '(Image attached)' : repliedToMessage.text}
                                    </Text>
                                </View>
                                <TouchableOpacity onPress={() => setRepliedToMessage(null)} style={{ paddingHorizontal: 10, paddingVertical: 4 }}>
                                    <FontAwesomeIcon icon={faTimes} size={18} color="#666" />
                                </TouchableOpacity>
                            </View>
                        )}

                        <View style={{ flexDirection: 'row', alignItems: 'flex-end', backgroundColor: '#fff', borderRadius: 24, paddingHorizontal: 12, paddingVertical: Platform.OS === 'ios' ? 8 : 4, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 3, elevation: 2 }}>
                            <TouchableOpacity onPress={handleMediaUpload} style={{ marginRight: 10, padding: 5 }}>
                                <FontAwesomeIcon icon={faPaperclip} size={20} color="#555" />
                            </TouchableOpacity>
                            <TextInput
                                ref={inputRef}
                                style={{
                                    flex: 1,
                                    fontSize: 16,
                                    paddingVertical: Platform.OS === 'ios' ? 6 : 8, // Adjust for different vertical padding needs
                                    maxHeight: 120, // Max height for multiline input
                                    color: '#333'
                                }}
                                placeholder="Type a message..."
                                placeholderTextColor="#999"
                                value={inputText}
                                onChangeText={setInputText}
                                multiline
                                scrollEnabled={true} // Allow scrolling for long text
                            />
                            <TouchableOpacity
                                onPress={sendMessage}
                                disabled={inputText.trim() === '' && !repliedToMessage}
                                style={{
                                    backgroundColor: (inputText.trim() === '' && !repliedToMessage) ? '#FF5A5F80' : '#FF5A5F', // Dim if disabled
                                    borderRadius: 20,
                                    paddingVertical: 8,
                                    paddingHorizontal: 16,
                                    marginLeft: 8,
                                    marginBottom: Platform.OS === 'ios' ? 0 : 4, // Align send button on Android
                                }}
                            >
                                <Text style={{ color: '#fff', fontWeight: '600' }}>Send</Text>
                            </TouchableOpacity>
                        </View>
                    </KeyboardAvoidingView>
                </SafeAreaView>
            </GestureHandlerRootView>
        </>
    );
};

export default SupportScreen;