import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';

export default function JobApplicationScreen() {
  const [currentStep, setCurrentStep] = useState(1);
  const [personalInfo, setPersonalInfo] = useState({
    fullName: 'John Mwangi',
    phone: '+254 712 345 678',
    email: 'john@example.com',
    location: 'Nakuru, Kenya'
  });
  const [resumeUploaded, setResumeUploaded] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [expectedSalary, setExpectedSalary] = useState('');
  const [experience, setExperience] = useState('yes');
  const [relocate, setRelocate] = useState('yes');

  // Professional color palette
  const colors = {
    primaryGreen: '#2E7D32',
    secondaryGreen: '#4CAF50',
    lightGreen: '#E8F5E9',
    white: '#FFFFFF',
    offWhite: '#FAFAFA',
    lightGray: '#F5F7FA',
    primaryText: '#222222',
    secondaryText: '#424242',
    metadataText: '#757575',
    lightText: '#BDBDBD',
    borderColor: '#E0E0E0',
    error: '#F44336',
    success: '#4CAF50',
  };

  const steps = [
    { number: 1, title: 'Personal Info' },
    { number: 2, title: 'Resume/CV' },
    { number: 3, title: 'Questions' }
  ];

  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      <Text style={[styles.stepTitle, { color: colors.primaryText }]}>
        Apply for Farm Manager Position
      </Text>
      <View style={styles.stepsContainer}>
        {steps.map((step) => (
          <View key={step.number} style={styles.stepItem}>
            <View 
              style={[
                styles.stepCircle,
                { 
                  backgroundColor: currentStep >= step.number ? colors.primaryGreen : colors.borderColor
                }
              ]}
            >
              <Text 
                style={[
                  styles.stepNumber,
                  { color: currentStep >= step.number ? colors.white : colors.metadataText }
                ]}
              >
                {step.number}
              </Text>
            </View>
            <Text 
              style={[
                styles.stepText,
                { color: currentStep >= step.number ? colors.primaryGreen : colors.metadataText }
              ]}
            >
              {step.title}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );

  const renderStep1 = () => (
    <View style={styles.stepContent}>
      <View style={styles.formGroup}>
        <Text style={[styles.label, { color: colors.primaryText }]}>Profile Photo</Text>
        <TouchableOpacity style={[styles.photoUpload, { backgroundColor: colors.lightGray }]}>
          <MaterialIcons name="camera-alt" size={32} color={colors.secondaryGreen} />
          <Text style={[styles.photoText, { color: colors.metadataText }]}>Add photo (optional)</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.formGroup}>
        <Text style={[styles.label, { color: colors.primaryText }]}>Full Name</Text>
        <View style={[styles.inputContainer, { backgroundColor: colors.lightGray }]}>
          <TextInput
            style={[styles.input, { color: colors.primaryText }]}
            value={personalInfo.fullName}
            onChangeText={(text) => setPersonalInfo({...personalInfo, fullName: text})}
          />
        </View>
      </View>

      <View style={styles.formGroup}>
        <Text style={[styles.label, { color: colors.primaryText }]}>Phone Number</Text>
        <View style={[styles.inputContainer, { backgroundColor: colors.lightGray }]}>
          <TextInput
            style={[styles.input, { color: colors.primaryText }]}
            value={personalInfo.phone}
            onChangeText={(text) => setPersonalInfo({...personalInfo, phone: text})}
            keyboardType="phone-pad"
          />
        </View>
      </View>

      <View style={styles.formGroup}>
        <Text style={[styles.label, { color: colors.primaryText }]}>Email</Text>
        <View style={[styles.inputContainer, { backgroundColor: colors.lightGray }]}>
          <TextInput
            style={[styles.input, { color: colors.primaryText }]}
            value={personalInfo.email}
            onChangeText={(text) => setPersonalInfo({...personalInfo, email: text})}
            keyboardType="email-address"
          />
        </View>
      </View>

      <View style={styles.formGroup}>
        <Text style={[styles.label, { color: colors.primaryText }]}>Location</Text>
        <View style={[styles.inputContainer, { backgroundColor: colors.lightGray }]}>
          <TextInput
            style={[styles.input, { color: colors.primaryText }]}
            value={personalInfo.location}
            onChangeText={(text) => setPersonalInfo({...personalInfo, location: text})}
          />
        </View>
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContent}>
      <Text style={[styles.sectionTitle, { color: colors.primaryText }]}>Upload Your Resume/CV</Text>
      
      <TouchableOpacity 
        style={[
          styles.uploadArea,
          { 
            backgroundColor: resumeUploaded ? colors.lightGreen : colors.lightGray,
            borderColor: resumeUploaded ? colors.primaryGreen : colors.secondaryGreen
          }
        ]}
        onPress={() => setResumeUploaded(!resumeUploaded)}
      >
        {resumeUploaded ? (
          <View style={styles.uploadedContent}>
            <MaterialIcons name="check-circle" size={40} color={colors.primaryGreen} />
            <Text style={[styles.uploadedText, { color: colors.primaryText }]}>resume_john_mwangi.pdf</Text>
            <Text style={[styles.uploadedSize, { color: colors.metadataText }]}>2.4 MB</Text>
            <TouchableOpacity 
              style={styles.removeButton}
              onPress={() => setResumeUploaded(false)}
            >
              <MaterialIcons name="close" size={20} color={colors.error} />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.uploadContent}>
            <MaterialIcons name="upload-file" size={40} color={colors.secondaryGreen} />
            <Text style={[styles.uploadText, { color: colors.primaryText }]}>Upload CV/Resume</Text>
            <Text style={[styles.uploadSubtext, { color: colors.metadataText }]}>
              Drag or tap to upload
            </Text>
            <Text style={[styles.uploadSubtext, { color: colors.metadataText }]}>
              PDF, DOC up to 5MB
            </Text>
          </View>
        )}
      </TouchableOpacity>

      <View style={styles.orDivider}>
        <View style={[styles.dividerLine, { backgroundColor: colors.borderColor }]} />
        <Text style={[styles.orText, { color: colors.metadataText, backgroundColor: colors.lightGray }]}>OR</Text>
        <View style={[styles.dividerLine, { backgroundColor: colors.borderColor }]} />
      </View>

      <TouchableOpacity style={[styles.portfolioButton, { borderColor: colors.borderColor }]}>
        <MaterialIcons name="folder" size={20} color={colors.metadataText} />
        <Text style={[styles.portfolioText, { color: colors.primaryText }]}>Choose from Portfolio</Text>
      </TouchableOpacity>

      <View style={styles.formGroup}>
        <View style={styles.toggleHeader}>
          <Text style={[styles.label, { color: colors.primaryText }]}>Add Cover Letter (Optional)</Text>
          <TouchableOpacity>
            <MaterialIcons name="add" size={20} color={colors.primaryGreen} />
          </TouchableOpacity>
        </View>
        
        {coverLetter !== undefined && (
          <View>
            <TextInput
              style={[styles.textarea, { backgroundColor: colors.lightGray, color: colors.primaryText }]}
              value={coverLetter}
              onChangeText={setCoverLetter}
              placeholder="Write your cover letter here..."
              placeholderTextColor={colors.metadataText}
              multiline
              numberOfLines={6}
            />
            <View style={styles.characterCount}>
              <Text style={[styles.countText, { color: colors.metadataText }]}>
                {coverLetter.length}/500
              </Text>
              <View style={[styles.progressBar, { backgroundColor: colors.borderColor }]}>
                <View 
                  style={[
                    styles.progressFill,
                    { 
                      backgroundColor: colors.primaryGreen,
                      width: `${(coverLetter.length / 500) * 100}%`
                    }
                  ]}
                />
              </View>
            </View>
          </View>
        )}
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContent}>
      <Text style={[styles.sectionTitle, { color: colors.primaryText }]}>Additional Information</Text>
      
      <View style={styles.formGroup}>
        <Text style={[styles.label, { color: colors.primaryText }]}>Available Start Date</Text>
        <TouchableOpacity style={[styles.dateInput, { backgroundColor: colors.lightGray }]}>
          <Text style={[styles.dateText, { color: colors.metadataText }]}>Select date</Text>
          <MaterialIcons name="calendar-today" size={20} color={colors.metadataText} />
        </TouchableOpacity>
      </View>

      <View style={styles.formGroup}>
        <Text style={[styles.label, { color: colors.primaryText }]}>Expected Salary</Text>
        <View style={[styles.salaryInput, { backgroundColor: colors.lightGray }]}>
          <TextInput
            style={[styles.input, { color: colors.primaryText, flex: 1 }]}
            value={expectedSalary}
            onChangeText={setExpectedSalary}
            placeholder="Enter amount"
            placeholderTextColor={colors.metadataText}
            keyboardType="numeric"
          />
          <Text style={[styles.currency, { color: colors.metadataText }]}>KES/month</Text>
        </View>
      </View>

      <View style={styles.formGroup}>
        <Text style={[styles.label, { color: colors.primaryText }]}>Do you have farming experience?</Text>
        <View style={styles.radioGroup}>
          {[
            { value: 'yes', label: 'Yes' },
            { value: 'no', label: 'No' },
            { value: 'some', label: 'Some experience' }
          ].map((option) => (
            <TouchableOpacity
              key={option.value}
              style={styles.radioOption}
              onPress={() => setExperience(option.value)}
            >
              <View 
                style={[
                  styles.radioButton,
                  { 
                    borderColor: experience === option.value ? colors.primaryGreen : colors.borderColor,
                    backgroundColor: experience === option.value ? colors.primaryGreen : 'transparent'
                  }
                ]}
              >
                {experience === option.value && (
                  <MaterialIcons name="check" size={16} color={colors.white} />
                )}
              </View>
              <Text style={[styles.radioLabel, { color: colors.primaryText }]}>{option.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.formGroup}>
        <Text style={[styles.label, { color: colors.primaryText }]}>Are you willing to relocate?</Text>
        <View style={styles.radioGroup}>
          {[
            { value: 'yes', label: 'Yes' },
            { value: 'no', label: 'No' },
            { value: 'depends', label: 'Depends' }
          ].map((option) => (
            <TouchableOpacity
              key={option.value}
              style={styles.radioOption}
              onPress={() => setRelocate(option.value)}
            >
              <View 
                style={[
                  styles.radioButton,
                  { 
                    borderColor: relocate === option.value ? colors.primaryGreen : colors.borderColor,
                    backgroundColor: relocate === option.value ? colors.primaryGreen : 'transparent'
                  }
                ]}
              >
                {relocate === option.value && (
                  <MaterialIcons name="check" size={16} color={colors.white} />
                )}
              </View>
              <Text style={[styles.radioLabel, { color: colors.primaryText }]}>{option.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <TouchableOpacity style={[styles.addReference, { backgroundColor: colors.lightGray }]}>
        <MaterialIcons name="add" size={20} color={colors.primaryGreen} />
        <Text style={[styles.referenceText, { color: colors.primaryGreen }]}>Add Reference (Optional)</Text>
      </TouchableOpacity>
    </View>
  );

  const renderNavigation = () => (
    <View style={[styles.navigation, { backgroundColor: colors.white }]}>
      {currentStep > 1 && (
        <TouchableOpacity 
          style={[styles.navButton, styles.backButton]}
          onPress={() => setCurrentStep(currentStep - 1)}
        >
          <MaterialIcons name="arrow-back" size={20} color={colors.primaryGreen} />
          <Text style={[styles.navButtonText, { color: colors.primaryGreen }]}>Back</Text>
        </TouchableOpacity>
      )}
      
      <TouchableOpacity
        style={[styles.navButton, styles.continueButton, { backgroundColor: colors.primaryGreen }]}
        onPress={() => {
          if (currentStep < 3) {
            setCurrentStep(currentStep + 1);
          } else {
            // Submit application
          }
        }}
      >
        <Text style={styles.continueText}>
          {currentStep < 3 ? 'Continue' : 'Submit Application'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.lightGray }]}>
      <View style={[styles.header, { backgroundColor: colors.white }]}>
        <TouchableOpacity style={styles.backButtonHeader}>
          <MaterialIcons name="arrow-back" size={24} color={colors.metadataText} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.primaryText }]}>Apply Now</Text>
        <View style={styles.headerSpacer} />
      </View>
      
      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {renderStepIndicator()}
        
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}
      </ScrollView>
      
      {renderNavigation()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButtonHeader: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  stepIndicator: {
    paddingHorizontal: 24,
    paddingVertical: 24,
    backgroundColor: '#FFFFFF',
    marginBottom: 16,
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 24,
    textAlign: 'center',
  },
  stepsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stepItem: {
    alignItems: 'center',
    flex: 1,
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  stepNumber: {
    fontSize: 16,
    fontWeight: '700',
  },
  stepText: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  stepContent: {
    paddingHorizontal: 24,
    paddingVertical: 24,
    backgroundColor: '#FFFFFF',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 24,
  },
  formGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  inputContainer: {
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  input: {
    fontSize: 16,
  },
  photoUpload: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
    borderRadius: 12,
    borderStyle: 'dashed',
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  photoText: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 8,
  },
  uploadArea: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 20,
    height: 160,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  uploadContent: {
    alignItems: 'center',
  },
  uploadText: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 4,
  },
  uploadSubtext: {
    fontSize: 14,
  },
  uploadedContent: {
    alignItems: 'center',
    position: 'relative',
  },
  uploadedText: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 4,
  },
  uploadedSize: {
    fontSize: 14,
    marginBottom: 8,
  },
  removeButton: {
    position: 'absolute',
    top: 0,
    right: 0,
    padding: 8,
  },
  orDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  orText: {
    paddingHorizontal: 16,
    fontSize: 14,
    fontWeight: '500',
  },
  portfolioButton: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 24,
  },
  portfolioText: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  toggleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  textarea: {
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    height: 120,
    textAlignVertical: 'top',
  },
  characterCount: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  countText: {
    fontSize: 12,
    fontWeight: '500',
  },
  progressBar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    marginLeft: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  dateText: {
    fontSize: 16,
  },
  salaryInput: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  currency: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  radioGroup: {
    gap: 16,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  radioLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  addReference: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  referenceText: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  navigation: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 12,
  },
  backButton: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginRight: 16,
  },
  continueButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  continueText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});