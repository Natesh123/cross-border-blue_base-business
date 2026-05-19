import React from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet } from 'react-native';

type ToastConfigProps = {
  visible: boolean;
  message: string;
  onClose: () => void;
};

const ToastConfig: React.FC<ToastConfigProps> = ({ visible, message, onClose }) => {
  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* <Text style={styles.title}>Status</Text> */}
          <Text style={styles.message}>{message}</Text>
          <TouchableOpacity style={styles.button} onPress={onClose}>
            <Text style={styles.buttonText}>Done</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

import { SIZES, FONTS } from "../constants/Assets";

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    width: '85%',
    maxHeight: '50%',
  },
  title: { fontSize: SIZES.h2, fontFamily: FONTS.bold, fontWeight: 'bold', marginBottom: 10, textAlign: "center" },
  message: { fontSize: SIZES.p16, fontFamily: FONTS.medium, lineHeight: 22, textAlign: "center" },
  button: {
    marginTop: 20,
    alignSelf: 'center',
    paddingVertical: 12,
    paddingHorizontal: 30,
    backgroundColor: '#0EA5E9',
    borderRadius: 12,
  },
  buttonText: { color: 'white', fontWeight: 'bold', fontFamily: FONTS.bold, fontSize: SIZES.p16 },
});

export default ToastConfig;
