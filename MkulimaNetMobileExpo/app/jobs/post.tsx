import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';

export default function PostJobScreen() {
  const [currentStep, setCurrentStep] = useState(1);
  const [jobInfo, setJobInfo] = useState({
    title: '',
    category: '',
    type: 'Full-time',
    location: '',
    description: '',
    requirements: [''] as string[],
    experience: 'Entry Level',
    salaryFrom: '',
    salaryTo: '',
    salaryType: 'Monthly',
    negotiable: false,
    benefits: {
      health: false,
      accommodation: false,
      transport: false,
      meals: false,
      training: false,
      other: ''
    },
    visibility: 'Public',
    deadline: '',
    duration: '30 days',
    boost: false
  });

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

  const categories = ['Farming', 'Livestock', 'Veterinary', 'Sales', 'Management', 'Labor', 'Tech', 'Transport'];
  const employmentTypes = ['Full-time', 'Part-time', 'Contract', 'Internship'];
  const experienceLevels = ['Entry Level', 'Mid Level', 'Senior Level', 'Expert'];
  const salaryTypes = ['Monthly', 'Daily', 'Hourly', 'Negotiable'];

  const steps = [
    { number: 1, title: 'Basic Info' },
    { number: 2, title: 'Job Details' },
    { number: 3, title: 'Compensation' },
    { number: 4, title: 'Review' }
  ];

  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      <Text style={[styles.stepTitle, { color: colors.primaryText }]}>Post a New Job</Text>
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
        <Text style={[styles.label, { color: colors.primaryText }]}>Job Title *</Text>
        <View style={[styles.inputContainer, { backgroundColor: colors.lightGray }]}>
          <TextInput
            style={[styles.input, { color: colors.primaryText }]}
            value={jobInfo.title}
            onChangeText={(text) => setJobInfo({...jobInfo, title: text})}
            placeholder="e.g., Experienced Farm Manager"
            placeholderTextColor={colors.metadataText}
          />
        </View>
      </View>

      <View style={styles.formGroup}>
        <Text style={[styles.label, { color: colors.primaryText }]}>Category *</Text>
        <TouchableOpacity 
          style={[styles.dropdown, { backgroundColor: colors.lightGray }]}
          onPress={() => {/* Open category picker */}}
        >
          <Text style={[styles.dropdownText, { color: jobInfo.category ? colors.primaryText : colors.metadataText }]}>
            {jobInfo.category || 'Select Category'}
          </Text>
          <MaterialIcons name="arrow-drop-down" size={24} color={colors.metadataText} />
        </TouchableOpacity>
      </View>

      <View style={styles.formGroup}>
        <Text style={[styles.label, { color: colors.primaryText }]}>Employment Type</Text>
        <View style={styles.chipContainer}>
          {employmentTypes.map((type) => (
            <TouchableOpacity
              key={type}
              style={[
                styles.chip,
                { 
                  backgroundColor: jobInfo.type === type ? colors.primaryGreen : colors.lightGray,
                  borderColor: jobInfo.type === type ? colors.primaryGreen : colors.borderColor
                }
              ]}
              onPress={() => setJobInfo({...jobInfo, type: type})}
            >
              <Text 
                style={[
                  styles.chipText,
                  { color: jobInfo.type === type ? colors.white : colors.metadataText }
                ]}
              >
                {type}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.formGroup}>
        <Text style={[styles.label, { color: colors.primaryText }]}>Location *</Text>
        <View style={[styles.inputContainer, { backgroundColor: colors.lightGray }]}>
          <TextInput
            style={[styles.input, { color: colors.primaryText }]}
            value={jobInfo.location}
            onChangeText={(text) => setJobInfo({...jobInfo, location: text})}
            placeholder="County/City"
            placeholderTextColor={colors.metadataText}
          />
        </View>
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContent}>
      <View style={styles.formGroup}>
        <Text style={[styles.label, { color: colors.primaryText }]}>Job Description *</Text>
        <TextInput
          style={[styles.textarea, { backgroundColor: colors.lightGray, color: colors.primaryText }]}
          value={jobInfo.description}
          onChangeText={(text) => setJobInfo({...jobInfo, description: text})}
          placeholder="Describe the role, responsibilities, and what makes this position special..."
          placeholderTextColor={colors.metadataText}
          multiline
          numberOfLines={6}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={[styles.label, { color: colors.primaryText }]}>Requirements</Text>
        {jobInfo.requirements.map((req, index) => (
          <View key={index} style={styles.requirementRow}>
            <View style={[styles.inputContainer, { backgroundColor: colors.lightGray, flex: 1 }]}>
              <TextInput
                style={[styles.input, { color: colors.primaryText }]}
                value={req}
                onChangeText={(text) => {
                  const newReqs = [...jobInfo.requirements];
                  newReqs[index] = text;
                  setJobInfo({...jobInfo, requirements: newReqs});
                }}
                placeholder="Add requirement"
                placeholderTextColor={colors.metadataText}
              />
            </View>
            {jobInfo.requirements.length > 1 && (
              <TouchableOpacity 
                style={styles.removeButton}
                onPress={() => {
                  const newReqs = jobInfo.requirements.filter((_, i) => i !== index);
                  setJobInfo({...jobInfo, requirements: newReqs});
                }}
              >
                <MaterialIcons name="remove-circle" size={24} color={colors.error} />
              </TouchableOpacity>
            )}
          </View>
        ))}
        <TouchableOpacity 
          style={[styles.addButton, { backgroundColor: colors.lightGray }]}
          onPress={() => setJobInfo({...jobInfo, requirements: [...jobInfo.requirements, '']})}
        >
          <MaterialIcons name="add" size={20} color={colors.primaryGreen} />
          <Text style={[styles.addButtonText, { color: colors.primaryGreen }]}>Add Another</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.formGroup}>
        <Text style={[styles.label, { color: colors.primaryText }]}>Experience Level</Text>
        <View style={styles.chipContainer}>
          {experienceLevels.map((level) => (
            <TouchableOpacity
              key={level}
              style={[
                styles.chip,
                { 
                  backgroundColor: jobInfo.experience === level ? colors.primaryGreen : colors.lightGray,
                  borderColor: jobInfo.experience === level ? colors.primaryGreen : colors.borderColor
                }
              ]}
              onPress={() => setJobInfo({...jobInfo, experience: level})}
            >
              <Text 
                style={[
                  styles.chipText,
                  { color: jobInfo.experience === level ? colors.white : colors.metadataText }
                ]}
              >
                {level}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContent}>
      <View style={styles.formGroup}>
        <Text style={[styles.label, { color: colors.primaryText }]}>Salary Range</Text>
        <View style={styles.salaryRow}>
          <View style={[styles.salaryInput, { backgroundColor: colors.lightGray }]}>
            <Text style={[styles.currencyLabel, { color: colors.metadataText }]}>From</Text>
            <TextInput
              style={[styles.input, { color: colors.primaryText, flex: 1 }]}
              value={jobInfo.salaryFrom}
              onChangeText={(text) => setJobInfo({...jobInfo, salaryFrom: text})}
              placeholder="0"
              placeholderTextColor={colors.metadataText}
              keyboardType="numeric"
            />
          </View>
          <View style={[styles.salaryInput, { backgroundColor: colors.lightGray }]}>
            <Text style={[styles.currencyLabel, { color: colors.metadataText }]}>To</Text>
            <TextInput
              style={[styles.input, { color: colors.primaryText, flex: 1 }]}
              value={jobInfo.salaryTo}
              onChangeText={(text) => setJobInfo({...jobInfo, salaryTo: text})}
              placeholder="0"
              placeholderTextColor={colors.metadataText}
              keyboardType="numeric"
            />
          </View>
        </View>
        <View style={styles.salaryTypeContainer}>
          {salaryTypes.map((type) => (
            <TouchableOpacity
              key={type}
              style={styles.salaryTypeOption}
              onPress={() => setJobInfo({...jobInfo, salaryType: type})}
            >
              <View 
                style={[
                  styles.radioButton,
                  { 
                    borderColor: jobInfo.salaryType === type ? colors.primaryGreen : colors.borderColor,
                    backgroundColor: jobInfo.salaryType === type ? colors.primaryGreen : 'transparent'
                  }
                ]}
              >
                {jobInfo.salaryType === type && (
                  <MaterialIcons name="check" size={16} color={colors.white} />
                )}
              </View>
              <Text style={[styles.radioLabel, { color: colors.primaryText }]}>{type}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.formGroup}>
        <Text style={[styles.label, { color: colors.primaryText }]}>Benefits (Select all that apply)</Text>
        <View style={styles.benefitsGrid}>
          {[
            { key: 'health', label: 'Health Insurance' },
            { key: 'accommodation', label: 'Accommodation' },
            { key: 'transport', label: 'Transport' },
            { key: 'meals', label: 'Meals' },
            { key: 'training', label: 'Training' }
          ].map((benefit) => (
            <TouchableOpacity
              key={benefit.key}
              style={styles.benefitOption}
              onPress={() => setJobInfo({
                ...jobInfo, 
                benefits: { 
                  ...jobInfo.benefits, 
                  [benefit.key]: !jobInfo.benefits[benefit.key as keyof typeof jobInfo.benefits]
                }
              })}
            >
              <View 
                style={[
                  styles.checkbox,
                  { 
                    backgroundColor: jobInfo.benefits[benefit.key as keyof typeof jobInfo.benefits] 
                      ? colors.primaryGreen 
                      : 'transparent',
                    borderColor: jobInfo.benefits[benefit.key as keyof typeof jobInfo.benefits] 
                      ? colors.primaryGreen 
                      : colors.borderColor
                  }
                ]}
              >
                {jobInfo.benefits[benefit.key as keyof typeof jobInfo.benefits] && (
                  <MaterialIcons name="check" size={16} color={colors.white} />
                )}
              </View>
              <Text style={[styles.benefitText, { color: colors.primaryText }]}>{benefit.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.otherBenefit}>
          <TextInput
            style={[styles.input, { backgroundColor: colors.lightGray, color: colors.primaryText, flex: 1 }]}
            value={jobInfo.benefits.other}
            onChangeText={(text) => setJobInfo({
              ...jobInfo,
              benefits: { ...jobInfo.benefits, other: text }
            })}
            placeholder="Other benefits..."
            placeholderTextColor={colors.metadataText}
          />
        </View>
      </View>
    </View>
  );

  const renderStep4 = () => (
    <View style={styles.stepContent}>
      <Text style={[styles.sectionTitle, { color: colors.primaryText }]}>Review Your Job Post</Text>
      
      <View style={[styles.reviewCard, { backgroundColor: colors.lightGray }]}>
        <Text style={[styles.reviewTitle, { color: colors.primaryText }]}>{jobInfo.title || 'Job Title'}</Text>
        <Text style={[styles.reviewCompany, { color: colors.metadataText }]}>Posted by Your Company</Text>
        <View style={styles.reviewDetails}>
          <View style={styles.reviewItem}>
            <MaterialIcons name="location-on" size={16} color={colors.secondaryGreen} />
            <Text style={[styles.reviewText, { color: colors.metadataText }]}>{jobInfo.location || 'Location'}</Text>
          </View>
          <View style={styles.reviewItem}>
            <MaterialIcons name="work" size={16} color={colors.secondaryGreen} />
            <Text style={[styles.reviewText, { color: colors.metadataText }]}>{jobInfo.type}</Text>
          </View>
          <View style={styles.reviewItem}>
            <MaterialIcons name="payments" size={16} color={colors.secondaryGreen} />
            <Text style={[styles.reviewText, { color: colors.metadataText }]}>
              {jobInfo.salaryFrom && jobInfo.salaryTo 
                ? `${jobInfo.salaryFrom}-${jobInfo.salaryTo} KES/${jobInfo.salaryType.toLowerCase()}`
                : 'Salary not specified'
              }
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.formGroup}>
        <Text style={[styles.label, { color: colors.primaryText }]}>Visibility Options</Text>
        <View style={styles.visibilityOptions}>
          {['Public', 'Verified Farmers Only', 'Private'].map((option) => (
            <TouchableOpacity
              key={option}
              style={styles.visibilityOption}
              onPress={() => setJobInfo({...jobInfo, visibility: option})}
            >
              <View 
                style={[
                  styles.radioButton,
                  { 
                    borderColor: jobInfo.visibility === option ? colors.primaryGreen : colors.borderColor,
                    backgroundColor: jobInfo.visibility === option ? colors.primaryGreen : 'transparent'
                  }
                ]}
              >
                {jobInfo.visibility === option && (
                  <MaterialIcons name="check" size={16} color={colors.white} />
                )}
              </View>
              <Text style={[styles.radioLabel, { color: colors.primaryText }]}>{option}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.formGroup}>
        <Text style={[styles.label, { color: colors.primaryText }]}>Promotion (Optional)</Text>
        <View style={styles.promotionOption}>
          <View style={styles.promotionInfo}>
            <Text style={[styles.promotionText, { color: colors.primaryText }]}>
              Boost post for 500 KES
            </Text>
            <Text style={[styles.promotionSubtext, { color: colors.metadataText }]}>
              Featured for 7 days
            </Text>
          </View>
          <Switch
            value={jobInfo.boost}
            onValueChange={(value) => setJobInfo({...jobInfo, boost: value})}
            trackColor={{ false: colors.borderColor, true: colors.lightGreen }}
            thumbColor={jobInfo.boost ? colors.primaryGreen : colors.metadataText}
          />
        </View>
      </View>

      <View style={[styles.totalContainer, { backgroundColor: colors.lightGray }]}>
        <Text style={[styles.totalLabel, { color: colors.primaryText }]}>Total:</Text>
        <Text style={[styles.totalAmount, { color: jobInfo.boost ? colors.primaryGreen : colors.metadataText }]}>
          {jobInfo.boost ? '500 KES' : 'Free Post'}
        </Text>
      </View>
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
          if (currentStep < 4) {
            setCurrentStep(currentStep + 1);
          } else {
            // Submit job post
          }
        }}
      >
        <Text style={styles.continueText}>
          {currentStep < 4 ? 'Continue' : 'Post Job Now'}
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
        <Text style={[styles.headerTitle, { color: colors.primaryText }]}>Post Job</Text>
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
        {currentStep === 4 && renderStep4()}
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
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  dropdownText: {
    fontSize: 16,
    flex: 1,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '500',
  },
  textarea: {
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    height: 120,
    textAlignVertical: 'top',
  },
  requirementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  removeButton: {
    padding: 8,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  salaryRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  salaryInput: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  currencyLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginRight: 8,
  },
  salaryTypeContainer: {
    gap: 16,
  },
  salaryTypeOption: {
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
  benefitsGrid: {
    gap: 16,
    marginBottom: 16,
  },
  benefitOption: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  benefitText: {
    fontSize: 16,
    fontWeight: '500',
  },
  otherBenefit: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reviewCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  reviewTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  reviewCompany: {
    fontSize: 14,
    marginBottom: 16,
  },
  reviewDetails: {
    gap: 12,
  },
  reviewItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reviewText: {
    fontSize: 14,
    marginLeft: 8,
  },
  visibilityOptions: {
    gap: 16,
  },
  visibilityOption: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  promotionOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
  },
  promotionInfo: {
    flex: 1,
  },
  promotionText: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  promotionSubtext: {
    fontSize: 14,
  },
  totalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: '700',
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