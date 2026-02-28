import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';

export default function WelcomeScreen() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const router = useRouter();

  const slides = [
    {
      title: 'Welcome to MkulimaNet',
      subtitle: 'Kenya\'s largest agricultural network',
      description: 'Connect with farmers, buyers, and experts across the country',
      image: '🌾'
    },
    {
      title: 'Smart Marketplace',
      subtitle: 'Buy and sell agricultural products',
      description: 'From fresh produce to farm equipment, find what you need',
      image: '🛍️'
    },
    {
      title: 'Job Opportunities',
      subtitle: 'Find agricultural work',
      description: 'Connect with employers and land your next opportunity',
      image: '💼'
    }
  ];

  const handleGetStarted = () => {
    router.push('/clerk-signup');
  };

  const handleSignIn = () => {
    router.push('/clerk-login');
  };

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.carousel}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / 300);
          setCurrentSlide(index);
        }}
        scrollEventThrottle={16}
      >
        {slides.map((slide, index) => (
          <View key={index} style={styles.slide}>
            <View style={styles.imageContainer}>
              <Text style={styles.emoji}>{slide.image}</Text>
            </View>
            <Text style={styles.title}>{slide.title}</Text>
            <Text style={styles.subtitle}>{slide.subtitle}</Text>
            <Text style={styles.description}>{slide.description}</Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.indicatorContainer}>
        {slides.map((_, index) => (
          <View
            key={index}
            style={[
              styles.indicator,
              currentSlide === index && styles.activeIndicator
            ]}
          />
        ))}
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.getStartedButton} onPress={handleGetStarted}>
          <Text style={styles.getStartedText}>Get Started</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.signInButton} onPress={handleSignIn}>
          <Text style={styles.signInText}>Sign In</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  carousel: {
    flex: 1,
  },
  slide: {
    width: 300,
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageContainer: {
    marginBottom: 30,
  },
  emoji: {
    fontSize: 80,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#222222',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#2E7D32',
    textAlign: 'center',
    marginBottom: 15,
  },
  description: {
    fontSize: 16,
    color: '#757575',
    textAlign: 'center',
    lineHeight: 24,
  },
  indicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 30,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D1D5DB',
    marginHorizontal: 4,
  },
  activeIndicator: {
    backgroundColor: '#2E7D32',
    width: 20,
  },
  buttonContainer: {
    padding: 20,
  },
  getStartedButton: {
    backgroundColor: '#2E7D32',
    borderRadius: 30,
    padding: 16,
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#2E7D32',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  getStartedText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  signInButton: {
    borderColor: '#2E7D32',
    borderWidth: 2,
    borderRadius: 30,
    padding: 16,
    alignItems: 'center',
  },
  signInText: {
    color: '#2E7D32',
    fontSize: 16,
    fontWeight: '600',
  },
});