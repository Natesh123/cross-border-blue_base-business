import React, { useState, useCallback, memo } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Modal,
    TextInput,
    FlatList,
    StyleSheet,
    Image,
    Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from "@expo/vector-icons";
import { theme } from '../../core/theme';
import { FONTS } from '../../constants/Assets';

type Props = {
    label?: string;
    selectedValue?: string;
    onValueChange: (itemValue: string, itemIndex: number) => void;
    dataList: { dataValue: string; displayvalue: string; flag?: string | null }[];
    errorText?: string;
    placeholder?: string;
    disabled?: boolean;
    enabled?: boolean;
    required?: boolean;
    modalTitle?: string;
    style?: any;
};

const ModalPicker = memo(({
    label,
    selectedValue,
    onValueChange,
    dataList = [],
    errorText,
    placeholder = "Select Option",
    disabled,
    enabled,
    required,
    modalTitle = "Select Option",
    style,
}: Props) => {
    const [modalVisible, setModalVisible] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const isPickerDisabled = disabled ?? (enabled !== undefined ? !enabled : false);
    const selectedItem = dataList.find(item => item.dataValue === selectedValue);

    const filteredData = dataList.filter(item =>
        item.displayvalue.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleSelect = useCallback((value: string) => {
        const index = dataList.findIndex(item => item.dataValue === value);
        onValueChange(value, index);
        setModalVisible(false);
        setSearchQuery('');
    }, [dataList, onValueChange]);

    const renderItem = useCallback(({ item }: { item: any }) => (
        <TouchableOpacity
            key={item.dataValue}
            style={[
                styles.itemRow,
                selectedValue === item.dataValue && styles.selectedItemRow
            ]}
            onPress={() => handleSelect(item.dataValue)}
        >
            <View style={styles.itemContent}>
                {item.flag ? (
                    <Image source={{ uri: item.flag }} style={styles.itemFlag} />
                ) : (
                    <View style={styles.placeholderFlag}>
                        <Ionicons name="globe-outline" size={20} color="#94a3b8" />
                    </View>
                )}
                <Text style={[
                    styles.itemText,
                    selectedValue === item.dataValue && styles.selectedItemText
                ]}>
                    {item.displayvalue}
                </Text>
            </View>
            {selectedValue === item.dataValue && (
                <View style={styles.checkBadge}>
                    <Ionicons name="checkmark" size={14} color="#fff" />
                </View>
            )}
        </TouchableOpacity>
    ), [selectedValue, handleSelect]);

    return (
        <View style={[styles.container, style]}>
            {label && (
                <Text style={styles.label}>
                    {label}{' '}
                    {required && <Text style={{ color: "red" }}>*</Text>}
                </Text>
            )}
            <TouchableOpacity
                activeOpacity={0.7}
                style={[
                    styles.inputContainer,
                    errorText ? styles.inputError : null,
                    isPickerDisabled ? styles.disabledInput : null
                ]}
                onPress={() => !isPickerDisabled && setModalVisible(true)}
                disabled={isPickerDisabled}
            >
                <View style={styles.selectedContent}>
                    <View style={styles.pillContainer}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                            {selectedItem?.flag && (
                                <Image source={{ uri: selectedItem.flag }} style={styles.flagIcon} />
                            )}
                            <Text style={[styles.selectedText, !selectedItem && styles.placeholderText]} numberOfLines={1}>
                                {selectedItem ? selectedItem.displayvalue : placeholder}
                            </Text>
                        </View>
                        <Ionicons name="chevron-down" size={20} color="#94a3b8" />
                    </View>
                </View>
            </TouchableOpacity>

            {errorText ? <Text style={styles.errorText}>{errorText}</Text> : null}

            <Modal
                visible={modalVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <LinearGradient
                            colors={['#0369a1', '#0ea5e9']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.modalHeader}
                        >
                            <View style={styles.handle} />
                            <View style={styles.headerTitleRow}>
                                <Text style={styles.modalTitle}>{modalTitle}</Text>
                                <TouchableOpacity
                                    onPress={() => {
                                        setModalVisible(false);
                                        setSearchQuery('');
                                    }}
                                    style={styles.closeBtn}
                                >
                                    <Ionicons name="close" size={20} color="#fff" />
                                </TouchableOpacity>
                            </View>
                        </LinearGradient>

                        <View style={styles.searchContainer}>
                            <View style={styles.searchWrapper}>
                                <Ionicons name="search" size={16} color="#94a3b8" style={styles.searchIcon} />
                                <TextInput
                                    style={styles.searchInput}
                                    placeholder="Search..."
                                    placeholderTextColor="#94a3b8"
                                    value={searchQuery}
                                    onChangeText={setSearchQuery}
                                />
                                {searchQuery.length > 0 && (
                                    <TouchableOpacity onPress={() => setSearchQuery('')}>
                                        <Ionicons name="close-circle" size={16} color="#94a3b8" />
                                    </TouchableOpacity>
                                )}
                            </View>
                        </View>

                        <FlatList
                            data={filteredData}
                            renderItem={renderItem}
                            keyExtractor={(item) => item.dataValue}
                            keyboardShouldPersistTaps="always"
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={styles.listContent}
                            ListEmptyComponent={
                                <View style={styles.noResults}>
                                    <View style={styles.emptyIconBox}>
                                        <Ionicons name="search-outline" size={40} color="#cbd5e1" />
                                    </View>
                                    <Text style={styles.noResultsText}>No results found for "{searchQuery}"</Text>
                                </View>
                            }
                        />
                    </View>
                </View>
            </Modal>
        </View>
    );
});

const styles = StyleSheet.create({
    container: {
        marginBottom: 5,
        width: '100%',
    },
    label: {
        color: '#64748b',
        fontSize: 13,
        fontFamily: FONTS.bold,
        marginBottom: 8,
        marginLeft: 4,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        backgroundColor: 'transparent',
        height: 60,
        width: '100%',
    },
    inputError: {
        borderColor: theme.colors.error,
    },
    disabledInput: {
        opacity: 0.6,
    },
    selectedContent: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        width: '100%',
    },
    pillContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8FAFC',
        borderColor: '#E2E8F0',
        borderWidth: 1.5,
        borderRadius: 18,
        paddingHorizontal: 20,
        height: 60,
        width: '100%',
    },
    flagIcon: {
        width: 24,
        height: 18,
        borderRadius: 4,
        marginRight: 12,
    },
    selectedText: {
        fontSize: 15,
        color: '#1e293b',
        fontFamily: FONTS.medium,
        flex: 1,
    },
    placeholderText: {
        color: '#cbd5e1',
    },
    errorText: {
        fontSize: 12,
        color: theme.colors.error,
        marginTop: 6,
        marginLeft: 6,
        fontFamily: FONTS.medium,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(15, 23, 42, 0.6)",
        justifyContent: "flex-end",
    },
    modalContent: {
        width: "100%",
        maxHeight: "90%",
        backgroundColor: "#fff",
        borderTopLeftRadius: 36,
        borderTopRightRadius: 36,
        paddingBottom: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 25,
    },
    modalHeader: {
        paddingHorizontal: 24,
        paddingTop: 12,
        paddingBottom: 15,
        borderTopLeftRadius: 36,
        borderTopRightRadius: 36,
    },
    searchContainer: {
        paddingHorizontal: 24,
        paddingVertical: 16,
        backgroundColor: '#fff',
    },
    handle: {
        width: 40,
        height: 5,
        backgroundColor: 'rgba(255,255,255,0.3)',
        borderRadius: 10,
        alignSelf: 'center',
        marginBottom: 20,
    },
    headerTitleRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 15,
    },
    modalTitle: {
        fontSize: 18,
        fontFamily: FONTS.bold,
        color: "#fff",
    },
    closeBtn: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    searchWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f1f5f9',
        borderRadius: 12,
        paddingHorizontal: 16,
        height: 52,
    },
    searchIcon: {
        marginRight: 10,
    },
    searchInput: {
        flex: 1,
        height: '100%',
        fontSize: 14,
        color: '#1e293b',
        fontFamily: FONTS.medium,
        padding: 0,
        backgroundColor: 'transparent',
        ...(Platform.select({ web: { outlineStyle: 'none' } }) as any),
    },
    listContent: {
        paddingHorizontal: 24,
        paddingTop: 10,
        paddingBottom: 40,
    },
    itemRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#f8fafc",
    },
    selectedItemRow: {
        backgroundColor: 'transparent',
    },
    itemContent: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
    },
    itemFlag: {
        width: 32,
        height: 24,
        borderRadius: 6,
        marginRight: 16,
    },
    placeholderFlag: {
        width: 32,
        height: 24,
        borderRadius: 6,
        backgroundColor: '#f1f5f9',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    itemText: {
        fontSize: 16,
        fontFamily: FONTS.medium,
        color: "#334155",
        flex: 1,
    },
    selectedItemText: {
        color: "#0ea5e9",
        fontFamily: FONTS.bold,
    },
    checkBadge: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#0ea5e9',
        justifyContent: 'center',
        alignItems: 'center',
    },
    noResults: {
        paddingVertical: 60,
        alignItems: "center",
    },
    emptyIconBox: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#f8fafc',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    noResultsText: {
        color: "#64748b",
        fontFamily: FONTS.medium,
        fontSize: 15,
        paddingHorizontal: 40,
        textAlign: 'center',
    },
});

export default ModalPicker;
