import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Dimensions, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function WelcomeScreen() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showContinue, setShowContinue] = useState(false);
  const scrollX = new Animated.Value(0);
  const pulseValue = new Animated.Value(1);

  // Professional color palette
  const colors = {
    primaryGreen: '#2E7D32',
    secondaryGreen: '#4CAF50',
    lightGreen: '#E8F5E9',
    white: '#FFFFFF',
    offWhite: '#FAFAFA',
    lightGray: '#F5F7FA',
    primaryText: '#222222',
    secondaryText: '#757575',
    metadataText: '#BDBDBD',
    borderColor: '#E0E0E0',
  };

  const slides = [
    {
      title: 'Network with Farmers',
      description: 'Connect with fellow farmers across Kenya to share knowledge and opportunities',
      icon: 'group',
      color: colors.primaryGreen,
    },
    {
      title: 'Sell Your Produce',
      description: 'Reach buyers directly and get fair prices for your agricultural products',
      icon: 'shopping-cart',
      color: colors.secondaryGreen,
    },
    {
      title: 'Secure Payments',
      description: 'Trade with confidence using our escrow system and secure payment methods',
      icon: 'shield',
      color: colors.primaryGreen,
    },
  ];

  useEffect(() => {
    // Animate pulse for continue button
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseValue, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Show continue button after a delay
    const timer = setTimeout(() => {
      setShowContinue(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const handleGetStarted = () => {
    // Navigation would happen here
  };

  const handleSkip = () => {
    // Navigation would happen here
  };

  const handleScroll = (event: any) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / width);
    setCurrentSlide(index);
  };

  const renderSlide = ({ item, index }: any) => (
    <View style={[styles.slide, { width }]}>
      <View style={[styles.slideIconContainer, { backgroundColor: colors.lightGreen }]}>
        <MaterialIcons 
          name={item.icon as any} 
          size={64} 
          color={item.color} 
        />
      </View>
      <Text style={[styles.slideTitle, { color: colors.primaryText }]}>{item.title}</Text>
      <Text style={[styles.slideDescription, { color: colors.secondaryText }]}>
        {item.description}
      </Text>
    </View>
  );

  const renderDots = () => (
    <View style={styles.dotsContainer}>
      {slides.map((_, index) => {
        const opacity = currentSlide === index ? 1 : 0.3;
        return (
          <View
            key={index}
            style={[
              styles.dot,
              { 
                backgroundColor: colors.primaryGreen,
                opacity 
              }
            ]}
          />
        );
      })}
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.white }]}>
      {/* Skip Button */}
      <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
        <Text style={[styles.skipText, { color: colors.metadataText }]}>Skip</Text>
      </TouchableOpacity>

      {/* Logo Screen */}
      <View style={styles.logoScreen}>
        <View style={[styles.logo, { backgroundColor: colors.lightGreen }]}>
          <MaterialIcons name="agriculture" size={80} color={colors.primaryGreen} />
        </View>
        <Text style={[styles.appName, { color: colors.primaryText }]}>MkulimaNet</Text>
        <Text style={[styles.tagline, { color: colors.secondaryGreen }]}>
          Connect. Grow. Prosper.
        </Text>
        
        {showContinue && (
          <Animated.View style={[styles.continueButton, { transform: [{ scale: pulseValue }] }]}>
            <TouchableOpacity 
              style={[styles.continueTouch, { backgroundColor: colors.primaryGreen }]}
              onPress={handleGetStarted}
            >
              <Text style={styles.continueText}>Get Started</Text>
              <MaterialIcons name="arrow-forward" size={20} color={colors.white} />
            </TouchableOpacity>
          </Animated.View>
        )}
      </View>

      {/* Value Proposition Slides */}
      <View style={styles.slidesContainer}>
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          style={styles.scrollView}
        >
          {slides.map((slide, index) => (
            <View key={index} style={{ width }}>
              {renderSlide({ item: slide, index })}
            </View>
          ))}
        </ScrollView>
        
        {renderDots()}
        
        <View style={styles.bottomButtons}>
          <TouchableOpacity 
            style={[styles.getStartedButton, { backgroundColor: colors.primaryGreen }]}
            onPress={handleGetStarted}
          >
            <Text style={styles.getStartedText}>Get Started</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  skipButton: {
    position: 'absolute',
    top: 16,
    right: 24,
    zIndex: 10,
  },
  skipText: {
    fontSize: 14,
    fontWeight: '500',
  },
  logoScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 48,
  },
  logo: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  appName: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 12,
  },
  tagline: {
    fontSize: 18,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 48,
  },
  continueButton: {
    position: 'absolute',
    bottom: 48,
  },
  continueTouch: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 28,
  },
  continueText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginRight: 8,
  },
  slidesContainer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  slide: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 48,
  },
  slideIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  slideTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'center',
  },
  slideDescription: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  bottomButtons: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  getStartedButton: {
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  getStartedText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});