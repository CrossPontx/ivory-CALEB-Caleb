import { Capacitor } from '@capacitor/core'
import { Camera } from '@capacitor/camera'
import { Filesystem, Directory } from '@capacitor/filesystem'

/**
 * Check if the app is running in a native Capacitor environment
 */
export const isNative = () => {
  return Capacitor.isNativePlatform()
}

/**
 * Check if running on iOS
 */
export const isIOS = () => {
  return Capacitor.getPlatform() === 'ios'
}

/**
 * Check if running on Android
 */
export const isAndroid = () => {
  return Capacitor.getPlatform() === 'android'
}

/**
 * Check if running in web browser
 */
export const isWeb = () => {
  return Capacitor.getPlatform() === 'web'
}

/**
 * Get the platform name
 */
export const getPlatform = () => {
  return Capacitor.getPlatform()
}

/**
 * Take a photo using native camera
 */
export const takePhoto = async () => {
  try {
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: 'uri',
      source: 'camera',
    })
    
    return image.webPath
  } catch (error) {
    console.error('Error taking photo:', error)
    throw error
  }
}

/**
 * Pick a photo from gallery
 */
export const pickPhoto = async () => {
  try {
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: 'uri',
      source: 'photos',
    })
    
    return image.webPath
  } catch (error) {
    console.error('Error picking photo:', error)
    throw error
  }
}

/**
 * Convert a web path to a blob for uploading
 */
export const webPathToBlob = async (webPath: string): Promise<Blob> => {
  const response = await fetch(webPath)
  return await response.blob()
}

/**
 * Save a file to the device
 */
export const saveFile = async (data: string, fileName: string) => {
  try {
    const result = await Filesystem.writeFile({
      path: fileName,
      data: data,
      directory: Directory.Documents,
    })
    
    return result.uri
  } catch (error) {
    console.error('Error saving file:', error)
    throw error
  }
}

export { Camera, Filesystem, Directory }
