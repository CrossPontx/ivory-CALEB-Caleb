# V0-Style Chatbot File Upload Implementation

## Overview

Successfully implemented a V0-style chatbot interface for website customization with file upload functionality. Users can now upload reference images alongside their customization prompts, similar to how Vercel V0 works.

## Features Implemented

### 1. Chatbot Interface
- **Location**: Integrated directly into the website management dashboard
- **Design**: Matches the elegant aesthetic of the landing page
- **Real-time Chat**: Message history with user and assistant messages
- **File Attachments**: Support for multiple image uploads per message
- **Credit System**: Shows remaining credits and cost per message

### 2. File Upload System
- **Multi-file Support**: Users can attach multiple reference images
- **File Preview**: Shows attached files with remove functionality
- **Storage Integration**: Files are uploaded to configured storage (R2/Vercel Blob)
- **V0 Integration**: File URLs are passed to V0 for analysis

### 3. API Implementation
- **FormData Support**: Handles both JSON and FormData requests
- **File Processing**: Uploads files to storage and generates public URLs
- **V0 SDK Integration**: Passes file URLs to V0 using the correct attachment format
- **Error Handling**: Comprehensive error handling for file uploads and V0 API calls

## Technical Implementation

### File Upload Flow
1. **Client Side**: User selects files and enters prompt
2. **API Endpoint**: Receives FormData with files and prompt
3. **File Upload**: Files are uploaded to storage (R2/Vercel Blob)
4. **V0 Integration**: File URLs are passed to V0 as attachments
5. **Response**: Updated website demo URL is returned

### Key Files Modified

#### `components/website-management-dashboard.tsx`
- Added complete chatbot interface beside the preview
- Implemented file upload functionality with drag-and-drop
- Added message history and real-time chat updates
- Integrated with credit system and error handling

#### `app/api/websites/[id]/customize/route.ts`
- Updated to handle FormData requests with file uploads
- Added file extraction and processing logic
- Maintained backward compatibility with JSON requests

#### `lib/website-builder.ts`
- Enhanced `customizeWebsite` method to accept file attachments
- Added file upload to storage before sending to V0
- Updated V0 SDK integration to use attachment URLs
- Added comprehensive error handling for file operations

### V0 SDK Integration

The implementation correctly follows V0's requirements:
- Files are uploaded to storage first (not sent as binary data)
- File URLs are passed in the `attachments` array
- Each attachment includes `url`, `name`, and `contentType`
- Prompts are enhanced to reference the uploaded images

## Usage

### In the Website Management Dashboard
1. Navigate to the website management page
2. The chatbot appears beside the website preview
3. Type a customization request
4. Optionally attach reference images using the paperclip icon
5. Send the message (costs 1 credit)
6. The website preview updates with the changes

### Example Prompts with Images
- "Make the color scheme match this uploaded image"
- "Use the layout style from these reference designs"
- "Apply the typography and spacing from this inspiration image"

## Testing

A comprehensive test page is available at `test-chatbot-file-upload.html` that allows testing:
- File upload functionality
- API endpoint integration
- Error handling scenarios
- Response validation

## Error Handling

The implementation includes robust error handling for:
- File upload failures
- Storage service errors
- V0 API rate limits and authentication issues
- Network connectivity problems
- Invalid file types or sizes

## Credit System Integration

- Each customization message costs 1 credit
- Credit balance is checked before processing
- Users are notified of insufficient credits
- Credit transactions are logged for audit purposes

## Future Enhancements

Potential improvements for the chatbot:
1. **File Type Validation**: Restrict to specific image formats
2. **File Size Limits**: Implement maximum file size restrictions
3. **Image Compression**: Automatically compress large images
4. **Batch Operations**: Allow multiple customizations in one session
5. **Template Suggestions**: Provide common customization templates
6. **Undo/Redo**: Enhanced version navigation with visual timeline

## Configuration Requirements

Ensure the following environment variables are configured:
- `V0_API_KEY`: Vercel V0 Platform API key
- Storage configuration (R2, Vercel Blob, etc.)
- Database connection for credit tracking

## Conclusion

The V0-style chatbot with file upload functionality is now fully implemented and integrated into the website management dashboard. Users can customize their websites using natural language prompts enhanced with reference images, providing a powerful and intuitive website editing experience.