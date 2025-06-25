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
    Keyboard
} from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faArrowLeft, faPhone, faPaperclip, faTimes, faCheck, faCheckDouble } from '@fortawesome/free-solid-svg-icons';
import { GestureHandlerRootView, PanGestureHandler, State } from 'react-native-gesture-handler';
import { launchImageLibrary } from 'react-native-image-picker';

const generateUniqueId = () => Math.random().toString(36).substring(2) + Date.now().toString(36);
const MY_USER_ID = 'user123';
const SUPPORT_USER_ID = 'support456';

const SupportScreen = ({ navigation }) => {
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const [isOtherUserTyping, setIsOtherUserTyping] = useState(false);
    const [repliedToMessage, setRepliedToMessage] = useState(null);
    const flatListRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        let typingTimeout;
        if (inputText.length > 0) {
            typingTimeout = setTimeout(() => {
                setIsOtherUserTyping(true);
                setTimeout(() => setIsOtherUserTyping(false), 3000);
            }, 1000);
        } else {
            setIsOtherUserTyping(false);
        }
        return () => clearTimeout(typingTimeout);
    }, [inputText]);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (flatListRef.current) {
                flatListRef.current.scrollToEnd({ animated: true });
            }
        }, 100);
        return () => clearTimeout(timer);
    }, [messages]);

    const sendMessage = () => {
        if (inputText.trim() === '' && !repliedToMessage) return;
        const newMessage = {
            id: generateUniqueId(),
            text: inputText.trim(),
            timestamp: new Date().toISOString(),
            userId: MY_USER_ID,
            repliedTo: repliedToMessage,
            mediaUri: null,
            status: 'sent',
        };
        setMessages((prev) => {
            const updated = [...prev, newMessage];
            setTimeout(() => {
                const reply = {
                    id: generateUniqueId(),
                    text: `Thanks for reaching out. Regarding "${newMessage.text}", how can I help?`,
                    timestamp: new Date().toISOString(),
                    userId: SUPPORT_USER_ID,
                    repliedTo: newMessage,
                    mediaUri: null,
                    status: 'sent',
                };
                setMessages((curr) =>
                    curr.map((msg) =>
                        msg.id === newMessage.id ? { ...msg, status: 'read' } : msg
                    ).concat(reply)
                );
            }, 1500);
            return updated;
        });
        setInputText('');
        setRepliedToMessage(null);
    };

    const handleMediaUpload = async () => {
        try {
            const result = await launchImageLibrary({
                mediaType: 'mixed',
                selectionLimit: 1,
            });

            if (result.assets && result.assets.length > 0) {
                const uri = result.assets[0].uri;

                const mediaMessage = {
                    id: generateUniqueId(),
                    text: '',
                    timestamp: new Date().toISOString(),
                    userId: MY_USER_ID,
                    mediaUri: uri,
                    repliedTo: repliedToMessage,
                    status: 'sent',
                };

                setMessages((prev) => {
                    const updated = [...prev, mediaMessage];
                    setTimeout(() => {
                        const reply = {
                            id: generateUniqueId(),
                            text: 'Thanks for the media! Let me check that.',
                            timestamp: new Date().toISOString(),
                            userId: SUPPORT_USER_ID,
                            repliedTo: mediaMessage,
                            mediaUri: null,
                            status: 'sent',
                        };
                        setMessages((curr) =>
                            curr.map((msg) =>
                                msg.id === mediaMessage.id ? { ...msg, status: 'read' } : msg
                            ).concat(reply)
                        );
                    }, 1500);
                    return updated;
                });

                setRepliedToMessage(null);
            }
        } catch (error) {
            console.warn('Media picker error:', error);
        }
    };

    const handleBack = () => navigation?.goBack?.();

    const handleCallSupport = () => {
        Linking.openURL('tel:+1234567890').catch((err) => console.log('Call failed:', err));
    };

    const TypingIndicator = () => (
        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 20, padding: 10, marginLeft: 10 }}>
            <ActivityIndicator size="small" color="#DA2824" style={{ marginRight: 8 }} />
            <Text style={{ fontSize: 14, color: '#555' }}>Support is typing...</Text>
        </View>
    );

    const Message = ({ item }) => {
        const message = item;
        const isMyMessage = message.userId === MY_USER_ID;
        const date = new Date(message.timestamp);
        const timeString = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const translateX = useRef(new Animated.Value(0)).current;

        const onGestureEvent = Animated.event([{ nativeEvent: { translationX: translateX } }], {
            useNativeDriver: true,
        });

        const onHandlerStateChange = (event) => {
            if (event.nativeEvent.state === State.END && event.nativeEvent.translationX > 60 && message.userId !== MY_USER_ID) {
                setRepliedToMessage(message);
                setTimeout(() => {
                    inputRef.current?.focus();
                    Keyboard?.emit?.('keyboardWillShow');
                }, 100);
            }
            Animated.spring(translateX, { toValue: 0, useNativeDriver: true }).start();
        };

        return (
            <PanGestureHandler onGestureEvent={onGestureEvent} onHandlerStateChange={onHandlerStateChange} enabled={message.userId !== MY_USER_ID}>
                <Animated.View style={{ transform: [{ translateX }], alignSelf: isMyMessage ? 'flex-end' : 'flex-start', marginHorizontal: 10, marginVertical: 4, maxWidth: '80%' }}>
                    <View style={{ backgroundColor: '#fff', borderRadius: 20, padding: 10, borderTopLeftRadius: isMyMessage ? 20 : 0, borderTopRightRadius: isMyMessage ? 0 : 20 }}>
                        {message.repliedTo && (
                            <View style={{ backgroundColor: '#eee', borderLeftWidth: 3, borderColor: '#DA2824', padding: 4, marginBottom: 4 }}>
                                <Text style={{ fontSize: 12, fontWeight: 'bold' }}>{message.repliedTo.userId === MY_USER_ID ? 'You' : 'Support'}</Text>
                                <Text style={{ fontSize: 12 }} numberOfLines={1}>{message.repliedTo.mediaUri ? 'Image' : message.repliedTo.text}</Text>
                            </View>
                        )}
                        {message.mediaUri && <Image source={{ uri: message.mediaUri }} style={{ width: 150, height: 150, borderRadius: 8 }} />}
                        {!!message.text && <Text>{message.text}</Text>}
                        <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 4 }}>
                            <Text style={{ fontSize: 10, color: '#607D8B' }}>{timeString}</Text>
                            {isMyMessage && (
                                <FontAwesomeIcon
                                    icon={message.status === 'read' ? faCheckDouble : faCheck}
                                    size={10}
                                    color={message.status === 'read' ? '#DA2824' : 'gray'}
                                    style={{ marginLeft: 4 }}
                                />
                            )}
                        </View>
                    </View>
                </Animated.View>
            </PanGestureHandler>
        );
    };

    return (
        <>
            <StatusBar backgroundColor="white" barStyle="dark-content" />
            <GestureHandlerRootView style={{ flex: 1 }}>
                <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
                    <View style={{ flexDirection: 'row', backgroundColor: '#fff', padding: 12, alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderColor: '#E0E0E0', elevation: 5 }}>
                        <TouchableOpacity onPress={handleBack}>
                            <FontAwesomeIcon icon={faArrowLeft} size={20} color="#000" />
                        </TouchableOpacity>
                        <Text style={{ color: '#000', fontSize: 18, fontWeight: 'bold' }}>Ship My Pack Support</Text>
                        <TouchableOpacity onPress={handleCallSupport}>
                            <FontAwesomeIcon icon={faPhone} size={20} color="#FF5A5F" />
                        </TouchableOpacity>
                    </View>

                    <FlatList
                        ref={flatListRef}
                        data={messages}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item }) => <Message item={item} />}
                        contentContainerStyle={{ padding: 10, backgroundColor: '#F0F2F5', flexGrow: 1 }}
                    />

                    {isOtherUserTyping && (
                        <View style={{ marginBottom: 6, marginLeft: 10 }}>
                            <TypingIndicator />
                        </View>
                    )}

                    <KeyboardAvoidingView
                        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                        keyboardVerticalOffset={Platform.OS === 'ios' ? 10 : 0}
                        style={{ paddingHorizontal: 10, paddingTop: 6, paddingBottom: 10, backgroundColor: '#F0F2F5' }}
                    >
                        {repliedToMessage && (
                            <View style={{ backgroundColor: '#eee', padding: 8, borderRadius: 10, marginBottom: 6, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                <View style={{ flex: 1 }}>
                                    <Text style={{ fontWeight: 'bold', color: '#DA2824' }}>
                                        Replying to {repliedToMessage.userId === MY_USER_ID ? 'Your' : 'Support'} Message
                                    </Text>
                                    <Text numberOfLines={1}>{repliedToMessage.mediaUri ? 'Image' : repliedToMessage.text}</Text>
                                </View>
                                <TouchableOpacity onPress={() => setRepliedToMessage(null)} style={{ paddingHorizontal: 10, paddingVertical: 4 }}>
                                    <FontAwesomeIcon icon={faTimes} size={18} color="#666" />
                                </TouchableOpacity>
                            </View>
                        )}

                        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 24, paddingHorizontal: 12, paddingVertical: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 3, elevation: 2 }}>
                            <TouchableOpacity onPress={handleMediaUpload}>
                                <FontAwesomeIcon icon={faPaperclip} size={20} color="#555" style={{ marginRight: 10 }} />
                            </TouchableOpacity>
                            <TextInput
                                ref={inputRef}
                                style={{ flex: 1, fontSize: 16, paddingVertical: 6, maxHeight: 120 }}
                                placeholder="Type a message..."
                                value={inputText}
                                onChangeText={setInputText}
                                multiline
                            />
                            <TouchableOpacity
                                onPress={sendMessage}
                                disabled={inputText.trim() === '' && !repliedToMessage}
                                style={{ backgroundColor: '#FF5A5F', borderRadius: 20, paddingVertical: 8, paddingHorizontal: 16, marginLeft: 8 }}
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