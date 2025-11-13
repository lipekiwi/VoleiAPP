# VoleiAPP - Complete Feature List

## 🏐 Overview
VoleiAPP is a comprehensive Progressive Web App designed for volleyball athletes to manage training, track progress, and monitor jump performance.

---

## ✨ Core Features

### 🏠 Home Dashboard
- **Personalized Welcome**: Greeting with user's name
- **Motivational Message**: Encouraging message to keep training
- **Stats Cards**:
  - 📅 **Weekly Trainings**: Count of completed exercises in the last 7 days
  - 🔥 **Streak**: Consecutive days with completed workouts
  - 📈 **Best Jump**: Highest recorded jump height in cm

### 📋 Training Management
- **Day-by-Day Navigation**: 7-day selector (Sunday-Saturday)
- **Exercise CRUD Operations**:
  - ➕ Add exercises with name, sets, reps, and weight
  - ✏️ Edit existing exercises
  - 🗑️ Delete exercises with confirmation
  - ✓ Mark exercises as completed
- **Visual Feedback**: Completed exercises have different styling
- **Empty States**: Helpful messages when no exercises exist
- **Data Persistence**: All training data saved to localStorage

### 🦘 Jump Tracking
- **Record Jump Heights**: Log jump performance with date and notes
- **Best Jump Calculation**: Automatic tracking of highest jump
- **Jump History**: Chronological list of all jump records
- **Visual Highlights**: Best jump marked with golden badge 🏆
- **Delete Records**: Remove incorrect or old entries
- **Notes Support**: Add observations for each jump (optional)
- **Date Selection**: Record jumps for any date

### 👤 Profile Management
- **User Information**:
  - Name (required)
  - Height in cm (optional)
  - Position: Ponteiro, Oposto, Central, Levantador, Líbero
- **Theme Toggle**: Switch between Light and Dark mode
- **Data Management**: Save profile or logout (clears all data)

### 📊 History & Progress
- **Jump Records Display**: Beautiful card-based layout
- **Best Jump Badge**: Animated gradient badge showing record
- **Chart Placeholder**: Canvas ready for future visualization
- **Sorted History**: Records ordered by date (newest first)

---

## 🎨 Design Features

### Theme System
- **Dark Mode** (Default):
  - Deep navy background (#0f172a)
  - Slate cards (#1e293b)
  - Light text (#f1f5f9)
  
- **Light Mode**:
  - White background (#ffffff)
  - Subtle shadows
  - Dark text (#0f172a)

### Brand Colors
- **Primary**: Purple (#6d28d9)
- **Secondary**: Yellow (#facc15)
- Consistent across all UI elements

### Animations
- ✅ Fade-in for section transitions
- ✅ Slide-in for new items
- ✅ Pulse animation for best jump badge
- ✅ Hover effects on cards and buttons
- ✅ Smooth theme transitions

### Responsive Design
- Mobile-first approach
- Breakpoints at 600px and 400px
- Touch-friendly button sizes
- Stacked layouts on small screens
- Horizontal scrolling day selector

---

## 💾 Data Management

### localStorage Structure
```javascript
{
  "userProfile": {
    "name": "string",
    "height": number,
    "position": "string"
  },
  "trainings": {
    "0-6": [  // Day of week (0=Sunday, 6=Saturday)
      {
        "id": "string",
        "name": "string",
        "sets": number,
        "reps": number,
        "weight": number,
        "completed": boolean
      }
    ]
  },
  "jumpRecords": [
    {
      "id": "string",
      "height": number,
      "date": "YYYY-MM-DD",
      "notes": "string",
      "timestamp": "ISO string"
    }
  ],
  "theme": "dark" | "light"
}
```

### Data Persistence
- ✅ Automatic save on all operations
- ✅ Survives page refresh
- ✅ Error handling for localStorage failures
- ✅ Clear all data on logout

---

## 🔧 Technical Features

### Modular Architecture
- **AppState**: Centralized state management
- **ThemeManager**: Theme switching logic
- **TrainingManager**: Exercise CRUD operations
- **JumpTracker**: Jump records management
- **ProfileModal**: Profile management
- **Navigation**: Section switching
- **UI**: DOM updates and calculations
- **Toast**: Notification system
- **Validator**: Input validation

### Code Quality
- Clean, maintainable code
- Comprehensive error handling
- Input sanitization
- Consistent naming conventions
- Detailed comments

### Accessibility
- ARIA labels on all interactive elements
- Keyboard navigation support
- Focus management in modals
- Semantic HTML
- Screen reader friendly

---

## 🚀 Usage Statistics

### What Gets Tracked
1. Number of exercises completed per week
2. Consecutive days with completed workouts (streak)
3. Best jump height ever recorded
4. Total jump records

### Auto-Calculated Stats
- Weekly training count updates on exercise completion
- Streak recalculates based on consecutive days
- Best jump updates when new record is added

---

## 📱 PWA Features
- Installable on mobile devices
- Works offline (after first load)
- App manifest configured
- Service worker ready
- Mobile-optimized interface

---

**Version**: 2.1  
**Last Updated**: 2025-11-13  
**Platform**: Web (PWA)  
**Languages**: Portuguese (pt-BR)

