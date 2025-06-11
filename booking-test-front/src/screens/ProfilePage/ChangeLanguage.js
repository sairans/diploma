import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function LanguageSelector() {
  const [modalVisible, setModalVisible] = useState(false);

  const languages = ['Kazakh', 'Russian', 'English'];

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.languageButton}>
        <Text style={styles.languageButtonText}>Change Language</Text>
      </TouchableOpacity>

      <Modal
        transparent
        animationType="fade"
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <View style={styles.header}>
                  <Ionicons name="arrow-back" size={24} color="#000" />
                  <Text style={styles.title}>Select language</Text>
                </View>
                {languages.map((lang, index) => (
                  <TouchableOpacity key={index} style={styles.languageOption}>
                    <Text style={styles.languageText}>{lang}</Text>
                    <View style={styles.underline} />
                  </TouchableOpacity>
                ))}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 50,
    paddingHorizontal: 20,
  },
  languageButton: {
    backgroundColor: '#ddd',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  languageButtonText: {
    fontSize: 16,
    color: '#000',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: 300,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: 20,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  title: {
    fontSize: 18,
    marginLeft: 10,
    fontWeight: '600',
  },
  languageOption: {
    marginVertical: 10,
  },
  languageText: {
    fontSize: 16,
    color: '#000',
  },
  underline: {
    height: 1,
    backgroundColor: '#888',
    marginTop: 4,
  },
});
