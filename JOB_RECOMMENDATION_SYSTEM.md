# MkulimaNet Job Recommendation System

## Overview
The MkulimaNet Job Recommendation System connects farmers to relevant jobs and internships based on their profile skills, certifications, services, and farm experience. The system uses a sophisticated matching algorithm to calculate compatibility between user profiles and job requirements.

## Features

### 1. Smart Job Matching Algorithm
- Matches jobs based on user profile skills, certifications, services, and farm experience
- Calculates match confidence score based on:
  - Skill overlap
  - Years of experience
  - Certifications held
  - Farm type or service provided
  - Optional location-based filtering (county-level)

### 2. Suggested Jobs / Jobs Feed
- Separate section in Dashboard / Feed / Jobs tab
- Each suggested job card shows:
  - Job title (bold)
  - Company / farm name
  - Location
  - Job type (Full-time / Internship / Contract)
  - Skills required (highlighted matched skills)
  - Match percentage
  - Posted date
- Click navigates to Job Details Screen
- Save or Apply directly from card

### 3. Real-Time Recommendations
- New jobs automatically added to suggestions feed
- Updates dynamically when user updates profile skills or certifications
- Optional email/push notifications for new matching jobs

### 4. Backend Requirements

#### Jobs Collection Enhancements
The Job model has been enhanced with an applications array:
```javascript
applications: [{
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  appliedAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending'
  },
  coverLetter: String
}]
```

#### API Endpoints
- **GET /api/jobs/suggestions/:userId** - Gets job suggestions based on user profile
- **POST /api/jobs/:id/apply** - Submits job application

### 5. Job Suggestions Algorithm
The matching algorithm calculates scores based on:
- **Skills (20 points each)** - Direct skill matches between user profile and job requirements
- **Certifications (15 points each)** - Matches between user certifications and job requirements
- **Services (15 points each)** - Matches between user services and job requirements
- **Crops/Livestock (10 points each)** - Matches between user farm details and job requirements
- **Experience Level** - Bonus points based on experience level alignment
- **Location** - Bonus for location matches

### 6. Frontend Components

#### Jobs Dashboard (/dashboard/jobs)
- Tabbed interface with "Recommended for You" and "All Jobs"
- Search and filter functionality
- Job cards with match percentages and highlighted skills
- Responsive design for web and mobile

#### Job Details Page (/jobs/[id])
- Comprehensive job information display
- Application submission with optional cover letter
- Success feedback and application status

#### Post Job Page (/dashboard/jobs/post)
- Comprehensive form for job posting
- Validation for all required fields
- Salary range input
- Experience level selection

## Implementation Details

### Backend Implementation

#### Job Model Enhancement
The Job model was extended with an applications array to track job applications and statuses.

#### Job Suggestions Endpoint
The `/api/jobs/suggestions/:userId` endpoint:
1. Verifies user authorization
2. Fetches user profile data (skills, certifications, services, crops, livestock, experience, location)
3. Retrieves all active jobs
4. Calculates match scores for each job based on profile alignment
5. Returns jobs sorted by match score (highest first)
6. Limits results to top 20 suggestions

#### Job Application Endpoint
The `/api/jobs/:id/apply` endpoint:
1. Validates job existence
2. Checks if user has already applied
3. Adds application to job's applications array
4. Returns success confirmation

### Frontend Implementation

#### Jobs Dashboard
- Tabbed interface for recommended and all jobs
- Dynamic loading of job suggestions
- Match percentage display
- Highlighted matching skills
- Responsive design

#### Job Details Page
- Complete job information display
- Application modal with cover letter
- Success feedback
- Navigation controls

#### Post Job Page
- Comprehensive job posting form
- Validation for all fields
- Dynamic requirement fields
- Accessible form elements

## Benefits

### For Users
- **Personalized Job Matches**: Jobs tailored to individual skills and experience
- **Time Savings**: No need to manually search through irrelevant postings
- **Career Growth**: Exposure to opportunities aligned with current capabilities
- **Easy Application**: Streamlined application process with cover letter option

### For Employers
- **Better Candidates**: Users with relevant skills and experience see their postings
- **Higher Conversion**: More qualified applicants apply to jobs
- **Reduced Screening**: Applicants are pre-matched to job requirements

### For Platform
- **Increased Engagement**: Personalized experience keeps users active
- **Higher Retention**: Valuable job matching improves user satisfaction
- **Network Effects**: More valuable job market increases platform adoption

## Technical Architecture

### Data Flow
1. User updates profile with skills, certifications, etc.
2. System recalculates job matches in real-time
3. Recommended jobs appear in user's dashboard
4. User applies for suitable positions
5. Applications are tracked in job records

### Security
- JWT authentication required for all job operations
- Authorization checks ensure users can only access their own data
- Input validation prevents malicious submissions
- Rate limiting prevents abuse

### Performance
- Efficient querying with database indexes
- Caching for frequently accessed data
- Optimized matching algorithm
- Pagination for large datasets

## Future Enhancements

### Planned Features
- Email notifications for new matching jobs
- Push notifications for mobile app
- Advanced filtering options
- Skill gap analysis and recommendations
- Interview scheduling integration
- Application tracking dashboard
- Employer response notifications

### Potential Improvements
- Machine learning for improved matching accuracy
- Natural language processing for requirement analysis
- Integration with external job boards
- Video interview capabilities
- Skill assessment tools
- Career progression pathways

## Conclusion
The MkulimaNet Job Recommendation System creates a powerful bridge between agricultural professionals and employment opportunities. By leveraging user profile data and sophisticated matching algorithms, the system provides personalized job recommendations that benefit both job seekers and employers while increasing platform engagement and retention.