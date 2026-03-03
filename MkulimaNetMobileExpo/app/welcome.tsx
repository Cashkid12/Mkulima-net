import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Dimensions, 
  FlatList,
  SafeAreaView
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const slides = [
  {
    id: '1',
    icon: 'leaf',
    heading: 'Welcome to MkulimaNet',
    subheading: "Kenya's largest agricultural network",
    description: 'Connect with farmers, buyers, and experts across the country',
    features: []
  },
  {
    id: '2',
    icon: 'cart',
    heading: 'Marketplace',
    subheading: 'Buy and sell farm products',
    features: ['Livestock', 'Crops', 'Equipment', 'Fertilizers', 'Seeds', 'Tools']
  },
  {
    id: '3',
    icon: 'briefcase',
    heading: 'Job Opportunities',
    subheading: 'Find agricultural work',
    features: ['Farm Manager', 'Veterinarian', 'Harvest Labor', 'Equipment Op', 'Agronomist', 'Sales Rep']
  }
];

export default function WelcomeScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const router = useRouter();

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      flatListRef.current?.scrollToIndex({
        index: nextIndex,
        animated: true
      });
    } else {
      router.push('/auth/signup');
    }
  };

  const handleSkip = () => {
    router.push('/auth/signup');
  };

  const handleSignIn = () => {
    router.push('/auth/login');
  };

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50
  }).current;

  const renderSlide = ({ item }: { item: typeof slides[0] }) => (
    <View style={styles.slide}>
      <View style={styles.iconContainer}>
        <Ionicons name={item.icon as any} size={100} color="#2E7D32" />
      </View>
      
      <Text style={styles.heading}>{item.heading}</Text>
      <Text style={styles.subheading}>{item.subheading}</Text>
      
      {item.features && item.features.length > 0 ? (
        <View style={styles.featuresContainer}>
          {item.features.map((feature, index) => (
            <View key={index} style={styles.featureRow}>
              <Ionicons name="ellipse" size={6} color="#4CAF50" style={styles.bullet} />
              <Text style={styles.featureText}>{feature}</Text>
            </View>
          ))}
        </View>
      ) : (
        <Text style={styles.description}>{item.description}</Text>
      )}
    </View>
  );

  const renderDots = () => (
    <View style={styles.dotsContainer}>
      {slides.map((_, index) => (
        <View
          key={index}
          style={[
            styles.dot,
            index === currentIndex ? styles.activeDot : styles.inactiveDot
          ]}
        />
      ))}
    </View>
  );

  const isLastSlide = currentIndex === slides.length - 1;

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>

      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderSlide}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        scrollEnabled={true}
      />

      <View style={styles.bottomContainer}>
        {renderDots()}

        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonText}>Get Started</Text>
        </TouchableOpacity>

        <View style={styles.signInContainer}>
          <Text style={styles.signInLabel}>Already have an account? </Text>
          <TouchableOpacity onPress={handleSignIn}>
            <Text style={styles.signInText}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  skipButton: {
    position: 'absolute',
    top: 60,
    right: 24,
    zIndex: 10,
  },
  skipText: {
    fontSize: 16,
    color: '#2E7D32',
    fontWeight: '500',
  },
  slide: {
    width: width,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  heading: {
    fontSize: 24,
    fontWeight: '700',
    color: '#222222',
    textAlign: 'center',
    marginBottom: 8,
  },
  subheading: {
    fontSize: 16,
    color: '#757575',
    textAlign: 'center',
    marginBottom: 24,
  },
  description: {
    fontSize: 16,
    color: '#757575',
    textAlign: 'center',
    lineHeight: 24,
  },
  featuresContainer: {
    width: '100%',
    marginBottom: 16,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    justifyContent: 'center',
  },
  bullet: {
    marginRight: 8,
  },
  featureText: {
    fontSize: 16,
    color: '#757575',
  },
  bottomContainer: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 32,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: '#2E7D32',
  },
  inactiveDot: {
    backgroundColor: '#F5F7FA',
  },
  nextButton: {
    backgroundColor: '#2E7D32',
    borderRadius: 30,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  signInContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  signInLabel: {
    fontSize: 15,
    color: '#757575',
  },
  signInText: {
    fontSize: 15,
    color: '#2E7D32',
    fontWeight: '600',
  },
});
