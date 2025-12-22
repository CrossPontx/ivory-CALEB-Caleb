# Reference Image Persistence - User Guide

## What's New? 🎉

Your reference images and hand photos now **stay with you** as you work! No more re-uploading or re-capturing when you switch between design tabs.

## Key Improvements

### 1. **Persistent Hand Photos** 📸
- Take a photo of your hand once
- Use it across multiple design tabs
- Never need to re-capture when switching tabs
- Camera only starts when you explicitly need it

### 2. **Saved Reference Images** 🖼️
- Upload design reference images once
- They stay available across all tabs
- Visual indicators show which tabs have references
- References are saved when you save your design

### 3. **Preserved Drawings** ✏️
- Draw on your hand photo
- Drawing overlay persists across tabs
- Edit your drawing anytime
- Drawings are saved with your design

## How to Use

### Creating Multiple Designs from One Photo

1. **Take Your Hand Photo**
   - Open the capture page
   - Position your hand in the frame
   - Take a photo

2. **Upload Reference Images** (Optional)
   - Tap the "Upload Design" button
   - Select up to 3 reference images
   - Adjust influence sliders as needed

3. **Create Your First Design**
   - Adjust design parameters
   - Generate your design
   - Review the results

4. **Create Variations**
   - Tap the "+" button to add a new tab
   - Your hand photo is automatically copied
   - Upload different reference images
   - Try different design parameters
   - Generate a new variation

### Visual Indicators

Each tab now shows helpful badges:

- **📷 Number Badge** - Shows how many reference images are attached
  - Example: `Design 1 📷 2` means 2 reference images
  
- **✏️ Pencil Icon** - Shows the tab has a drawing overlay
  - Purple badge indicates drawing is present

- **Number Badge** - Shows how many generated designs
  - Example: `Design 1 3` means 3 generated variations

### Switching Between Tabs

Simply tap any tab to switch to it. All your images will be instantly restored:
- ✅ Original hand photo
- ✅ Reference design images
- ✅ Drawing overlays
- ✅ Generated previews

**No camera restart!** The camera only starts when you explicitly need to take a new photo.

## Workflow Examples

### Example 1: Multiple Color Variations
```
1. Take hand photo
2. Upload nail art reference
3. Tab 1: Generate with pink base
4. Tab 2: Generate with blue base
5. Tab 3: Generate with gold base
6. Compare all three side-by-side
```

### Example 2: Different Styles
```
1. Take hand photo
2. Tab 1: Upload floral reference → Generate
3. Tab 2: Upload geometric reference → Generate
4. Tab 3: Upload abstract reference → Generate
5. Pick your favorite
```

### Example 3: Refinement Process
```
1. Take hand photo
2. Upload reference image
3. Tab 1: Generate initial design
4. Tab 2: Adjust influence sliders → Generate
5. Tab 3: Add drawing overlay → Generate
6. Compare results
```

## Tips & Tricks

### 💡 Best Practices

1. **Take a Good Hand Photo First**
   - Use good lighting
   - Keep hand steady
   - Position fingers clearly
   - This photo will be reused across tabs

2. **Organize Your Tabs**
   - Name tabs descriptively (coming soon!)
   - Keep related variations together
   - Delete tabs you don't need

3. **Use Reference Images Wisely**
   - Upload clear, high-quality references
   - Use up to 3 references per tab
   - Adjust influence sliders to control strength

4. **Experiment Freely**
   - Create multiple tabs to try different ideas
   - No penalty for experimentation
   - All images are preserved

### ⚡ Quick Actions

- **Change Hand Photo**: Tap "Change Photo" button
- **Add Reference**: Tap "Upload Design" button
- **Add Drawing**: Tap the pencil icon on your hand photo
- **New Variation**: Tap "+" to add a new tab
- **Switch Tabs**: Tap any tab to switch instantly

## Troubleshooting

### Camera Starts Unexpectedly
- **Cause**: Tab has no images
- **Solution**: Upload a photo or switch to a tab with images

### Reference Images Not Showing
- **Cause**: Images may not have uploaded successfully
- **Solution**: Check the upload drawer - you should see thumbnails
- **Check**: Look for the 📷 badge on the tab

### Drawing Disappeared
- **Cause**: May have switched tabs before saving
- **Solution**: Drawings are auto-saved per tab - switch back to the correct tab
- **Check**: Look for the ✏️ badge on the tab

### Lost All My Work
- **Cause**: Browser cleared localStorage
- **Solution**: Save your designs frequently using the "Generate" button
- **Prevention**: Saved designs are stored in the database and can be edited later

## Data Persistence

### Session Storage (Temporary)
- Active while you're working
- Cleared when you save designs
- Cleared when you close the browser
- Used for quick tab switching

### Database Storage (Permanent)
- Activated when you save a design
- Includes all reference images
- Includes drawing overlays
- Accessible via "Edit" button on saved designs

### What Gets Saved?
When you save a design, we store:
- ✅ Original hand photo
- ✅ Reference design images
- ✅ Drawing overlays
- ✅ All design parameters
- ✅ Influence weights
- ✅ Generated previews

### Editing Saved Designs
1. Go to your design collection
2. Tap "Edit" on any design
3. All images and settings are restored
4. Make changes and generate new variations
5. Save again to update

## Privacy & Storage

- **Local Storage**: Used for temporary session data only
- **Database**: Stores your saved designs securely
- **Images**: Stored in secure cloud storage (R2)
- **Privacy**: Only you can see your designs (unless shared)

## Coming Soon

- 📝 Custom tab names
- 🗂️ Reference image library
- 🔄 Sync across devices
- 📤 Batch export
- 🎨 Reference image collections

## Need Help?

If you encounter any issues:
1. Check the console logs (for developers)
2. Try refreshing the page
3. Clear browser cache if problems persist
4. Contact support with details

---

**Enjoy creating with persistent reference images!** 🎨✨
