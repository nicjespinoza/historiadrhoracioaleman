import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from './firebase';

/**
 * Upload a file to Firebase Storage
 * @param file - The file to upload
 * @param path - Storage path (e.g., 'patients/{id}/documents')
 * @returns Download URL of the uploaded file
 */
export const uploadFile = async (file: File, path: string): Promise<string> => {
    const fileName = `${Date.now()}_${file.name}`;
    const storageRef = ref(storage, `${path}/${fileName}`);

    const uploadResult = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(uploadResult.ref);

    return downloadURL;
};

/**
 * Upload a chat image
 */
export const uploadChatImage = async (file: File, chatRoomId: string): Promise<string> => {
    return uploadFile(file, `chat/${chatRoomId}`);
};

/**
 * Upload a patient document (medical records, lab results, etc.)
 */
export const uploadPatientDocument = async (file: File, patientId: string): Promise<string> => {
    return uploadFile(file, `patients/${patientId}/documents`);
};

/**
 * Upload a profile picture
 */
export const uploadProfilePicture = async (file: File, userId: string): Promise<string> => {
    return uploadFile(file, `profiles/${userId}`);
};

/**
 * Upload an observation image (3D body designer)
 */
export const uploadObservationImage = async (file: File, patientId: string): Promise<string> => {
    return uploadFile(file, `patients/${patientId}/observations`);
};

/**
 * Delete a file from Firebase Storage
 * @param url - The Firebase Storage URL of the file to delete
 */
export const deleteFile = async (url: string): Promise<void> => {
    try {
        const storageRef = ref(storage, url);
        await deleteObject(storageRef);
    } catch (error) {
        console.error('Error deleting file:', error);
        throw error;
    }
};

/**
 * Get file extension from filename
 */
export const getFileExtension = (filename: string): string => {
    return filename.split('.').pop()?.toLowerCase() || '';
};

/**
 * Check if file is an image
 */
export const isImageFile = (file: File): boolean => {
    const imageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    return imageTypes.includes(file.type);
};

/**
 * Check if file is a PDF
 */
export const isPDFFile = (file: File): boolean => {
    return file.type === 'application/pdf';
};

/**
 * Validate file size (default max: 10MB)
 */
export const validateFileSize = (file: File, maxSizeMB: number = 10): boolean => {
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    return file.size <= maxSizeBytes;
};
