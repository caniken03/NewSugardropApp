import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Dimensions,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, typography, spacing } from '@/design-system';

const { height: screenHeight } = Dimensions.get('window');

interface NavigationItem {
  key: string;
  title: string;
  icon: string;
  route: string;
  description: string;
}

interface AnimatedNavigationModalProps {
  visible: boolean;
  onClose: () => void;
  onNavigate: (route: string) => void;
  items: NavigationItem[];
}

export default function AnimatedNavigationModal({
  visible,
  onClose,
  onNavigate,
  items,
}: AnimatedNavigationModalProps) {
  const insets = useSafeAreaInsets();
  const translateY = useSharedValue(screenHeight);
  const opacity = useSharedValue(0);

  React.useEffect(() => {
    if (visible) {
      opacity.value = withTiming(1, { duration: 200 });
      translateY.value = withSpring(0, {
        damping: 20,
        stiffness: 200,
      });
    } else {
      opacity.value = withTiming(0, { duration: 150 });
      translateY.value = withTiming(screenHeight, { duration: 200 });
    }
  }, [visible]);

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const modalStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const handleNavigation = (route: string) => {
    // Animate out first
    opacity.value = withTiming(0, { duration: 150 });
    translateY.value = withTiming(screenHeight, { duration: 200 }, () => {
      runOnJS(onNavigate)(route);
    });
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      statusBarTranslucent={true}
      onRequestClose={onClose}>
      <Animated.View style={[styles.overlay, overlayStyle]}>
        <TouchableOpacity 
          style={styles.overlayTouch}
          activeOpacity={1}
          onPress={onClose}
        />
        
        <Animated.View style={[styles.modal, modalStyle, { paddingBottom: insets.bottom + 24 }]}>
          {/* Handle */}
          <View style={styles.handle} />
          
          {/* Title */}
          <Text style={styles.title}>Quick Actions</Text>
          
          {/* Navigation Items */}
          <View style={styles.itemsContainer}>
            {items.map((item) => (
              <TouchableOpacity
                key={item.key}
                style={styles.item}
                onPress={() => handleNavigation(item.route)}
                activeOpacity={0.7}>
                <View style={styles.iconContainer}>
                  <Ionicons name={item.icon as any} size={24} color="#4A90E2" />
                </View>
                <View style={styles.textContainer}>
                  <Text style={styles.itemTitle}>{item.title}</Text>
                  <Text style={styles.itemDescription}>{item.description}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#cccccc" />
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },

  overlayTouch: {
    flex: 1,
  },

  modal: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    paddingHorizontal: 24,
    maxHeight: screenHeight * 0.8,
  },

  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 24,
  },

  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 24,
    textAlign: 'center',
  },

  itemsContainer: {
    gap: 8,
  },

  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    marginBottom: 4,
  },

  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },

  textContainer: {
    flex: 1,
  },

  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 2,
  },

  itemDescription: {
    fontSize: 14,
    color: '#666666',
  },
});