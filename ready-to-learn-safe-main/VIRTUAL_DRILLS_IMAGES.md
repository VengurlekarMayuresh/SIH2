# Virtual Drills - Image Integration Guide

## Overview
The Virtual Drills system now supports images to make scenarios more engaging and realistic. Images are displayed between the scenario description and the choice options.

## Image Directory Structure
Create the following directory structure in your `public` folder:

```
public/
├── images/
    └── drills/
        ├── flood/
        │   ├── classroom-flickering.jpg
        │   ├── lights-out.jpg
        │   ├── emergency-announcement.jpg
        │   ├── corridor-water.jpg
        │   ├── electrical-hazard.jpg
        │   └── ... (other flood scenario images)
        ├── fire/
        │   └── ... (fire drill images)
        ├── earthquake/
        │   └── ... (earthquake drill images)
        └── cyclone/
            └── ... (cyclone drill images)
```

## Current Flood Drill Images Needed

### Active Scenarios with Image Support:
1. **START** - `/images/drills/flood/classroom-flickering.jpg`
   - Scene: Classroom with flickering lights during heavy rain
   
2. **FLICKER_CHOICE** - `/images/drills/flood/lights-out.jpg`
   - Scene: Darkened classroom with gloomy daylight
   
3. **FLOOD_ALERT** - `/images/drills/flood/emergency-announcement.jpg`
   - Scene: Emergency announcement with water seeping under door
   
4. **CORRIDOR_CHOICE_FAST** - `/images/drills/flood/corridor-water.jpg`
   - Scene: Corridor with ankle-deep water, students evacuating
   
5. **ALT_ROUTE_HAZARD** - `/images/drills/flood/electrical-hazard.jpg`
   - Scene: Electrical junction box sparking in water

## Image Requirements
- **Format**: JPG, PNG, or WebP
- **Size**: Recommended 800x600px or similar 4:3 aspect ratio
- **Quality**: High resolution but optimized for web (under 500KB each)
- **Style**: Realistic or illustrated scenarios that match the story context

## How Images Work
- Images are automatically displayed when available
- If an image fails to load, it will be hidden gracefully
- Images are responsive and will scale appropriately on different devices
- Each image has a subtle gradient overlay for better text readability

## Adding New Images

### To add an image to an existing scenario:
1. Add the image file to the appropriate directory in `public/images/drills/`
2. Update the story node in the drill component:
```typescript
SCENARIO_NAME: {
  scene_description: "Your scenario description...",
  image: "/images/drills/flood/your-image.jpg", // Add this line
  choices: [
    // ... your choices
  ]
}
```

### Image Naming Convention:
- Use descriptive, lowercase names with hyphens
- Include the scenario context: `classroom-flickering.jpg`
- Keep names concise but clear: `electrical-hazard.jpg`

## Future Enhancements
- Support for multiple images per scenario
- Image captions or alt text customization
- Animated GIFs for dynamic scenarios
- Image preloading for smoother experience

## Testing
After adding images:
1. Start the development server
2. Navigate to Virtual Drills → Flood Evacuation Drill
3. Verify images load properly at each scenario
4. Test on mobile devices for responsive behavior
5. Check fallback behavior when images are missing

## Notes
- Images are optional - scenarios will work fine without them
- Always provide meaningful alt text for accessibility
- Consider file size optimization for better performance
- Test with slow internet connections to ensure good UX