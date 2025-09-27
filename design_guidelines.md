# Git Commit Cleanup System - Design Guidelines

## Design Approach
**System-Based Approach**: Using **Material Design** principles for this utility-focused application. The interface prioritizes efficiency, clarity, and trust - essential for a tool performing destructive Git operations.

## Core Design Elements

### A. Color Palette
**Dark Mode Primary** (default):
- Primary: 25 84% 57% (Modern blue for actions)
- Surface: 220 13% 18% (Dark background)
- Surface Variant: 220 9% 25% (Cards, inputs)
- Text Primary: 0 0% 95% (High contrast text)
- Text Secondary: 0 0% 70% (Subdued text)
- Danger: 0 84% 60% (Critical operations warning)
- Success: 142 76% 36% (Completion states)

**Light Mode**:
- Primary: 25 84% 47%
- Surface: 0 0% 98%
- Surface Variant: 0 0% 96%
- Text Primary: 0 0% 13%
- Text Secondary: 0 0% 40%

### B. Typography
**Primary Font**: Roboto (via Google Fonts CDN)
- Headlines: Roboto Medium, 24px/28px
- Body: Roboto Regular, 16px/24px
- Caption: Roboto Regular, 14px/20px
- Code/Technical: Roboto Mono, 14px/20px

### C. Layout System
**Tailwind Spacing Units**: Consistent use of 4, 6, 8, 12, 16 units
- Component padding: p-6
- Section margins: mb-8, mt-12
- Form spacing: space-y-4
- Grid gaps: gap-6

### D. Component Library

**Primary Navigation**:
- Clean sidebar with icon + text navigation
- Repository status indicators (clean/needs-cleanup)
- Active state highlighting

**Repository Management**:
- Repository cards with URL, status, and last scan date
- Add repository form with URL validation
- Batch selection for multi-repo operations

**Scanning Interface**:
- Progress indicators for repository analysis
- Commit preview cards showing before/after states
- Pattern matching results with confidence scores

**Critical Operation Controls**:
- Prominent warning dialogs for destructive operations
- Backup confirmation checkboxes
- Two-step confirmation for cleanup execution
- Progress tracking with detailed logs

**Data Display**:
- Commit tables with expandable details
- Repository status dashboards
- Operation history logs
- Pattern detection results

**Forms & Inputs**:
- GitHub URL input with validation
- Authentication token fields (masked)
- Repository selection checkboxes
- Cleanup configuration options

### E. Animations
**Minimal and Purposeful**:
- Subtle loading spinners for scanning operations
- Smooth transitions for card state changes
- Progress bar animations for long operations
- No decorative animations that could distract from critical operations

## Key Design Principles

1. **Trust & Safety**: Clear warning states, confirmation dialogs, and backup reminders
2. **Efficiency**: Minimal clicks to common operations, bulk selection capabilities
3. **Transparency**: Detailed operation logs, clear status indicators
4. **Accessibility**: High contrast ratios, keyboard navigation, screen reader support

## Critical UI Patterns

- **Destructive Action Pattern**: Red warning banners, multiple confirmation steps, backup requirements
- **Progress Indication**: Real-time status updates during Git operations
- **Batch Operations**: Checkbox selection with bulk action controls
- **Repository Status**: Clear visual indicators for scan status and cleanup needs

This utility-focused design prioritizes user confidence and operational clarity over visual flair, ensuring users feel secure when performing potentially destructive Git operations.