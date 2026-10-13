const DRIVE_BACKUP_FILENAME = 'PR_ACADEMY_BACKUP.json';

export interface DriveFileInfo {
  id: string;
  name: string;
  modifiedTime: string;
  size?: string;
}

export const GoogleDriveService = {
  /**
   * Search for existing backup file in user's Google Drive
   */
  findBackupFile: async (accessToken: string): Promise<DriveFileInfo | null> => {
    try {
      const q = encodeURIComponent(`name = '${DRIVE_BACKUP_FILENAME}' and trashed = false`);
      const response = await fetch(
        `https://www.googleapis.com/drive/v3/files?q=${q}&fields=files(id,name,modifiedTime,size)&spaces=drive`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Drive search failed: ${response.statusText}`);
      }

      const data = await response.json();
      if (data.files && data.files.length > 0) {
        return data.files[0] as DriveFileInfo;
      }
      return null;
    } catch (error) {
      console.error('Error finding Drive backup:', error);
      throw error;
    }
  },

  /**
   * Upload or update the PR Academy backup to user's Google Drive
   */
  saveBackupToDrive: async (
    backupData: any,
    accessToken: string
  ): Promise<DriveFileInfo> => {
    try {
      const content = JSON.stringify(backupData, null, 2);
      const existingFile = await GoogleDriveService.findBackupFile(accessToken);

      if (existingFile) {
        // Update existing file content
        const updateResponse = await fetch(
          `https://www.googleapis.com/upload/drive/v3/files/${existingFile.id}?uploadType=media`,
          {
            method: 'PATCH',
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
            body: content,
          }
        );

        if (!updateResponse.ok) {
          throw new Error(`Drive update failed: ${updateResponse.statusText}`);
        }

        const updated = await updateResponse.json();
        return {
          id: existingFile.id,
          name: DRIVE_BACKUP_FILENAME,
          modifiedTime: new Date().toISOString(),
          size: content.length.toString(),
        };
      } else {
        // Create new file with multipart upload
        const metadata = {
          name: DRIVE_BACKUP_FILENAME,
          mimeType: 'application/json',
          description: 'PR ACADEMY management database backup file',
        };

        const boundary = '-------314159265358979323846';
        const delimiter = `\r\n--${boundary}\r\n`;
        const closeDelimiter = `\r\n--${boundary}--`;

        const multipartRequestBody =
          delimiter +
          'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
          JSON.stringify(metadata) +
          delimiter +
          'Content-Type: application/json\r\n\r\n' +
          content +
          closeDelimiter;

        const createResponse = await fetch(
          'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'Content-Type': `multipart/related; boundary=${boundary}`,
            },
            body: multipartRequestBody,
          }
        );

        if (!createResponse.ok) {
          throw new Error(`Drive create failed: ${createResponse.statusText}`);
        }

        const created = await createResponse.json();
        return {
          id: created.id,
          name: DRIVE_BACKUP_FILENAME,
          modifiedTime: new Date().toISOString(),
          size: content.length.toString(),
        };
      }
    } catch (error) {
      console.error('Error saving to Google Drive:', error);
      throw error;
    }
  },

  /**
   * Download the backup file from user's Google Drive
   */
  loadBackupFromDrive: async (accessToken: string): Promise<any> => {
    try {
      const file = await GoogleDriveService.findBackupFile(accessToken);
      if (!file) {
        throw new Error('Google Drive par koi PR ACADEMY backup file nahi mili.');
      }

      const response = await fetch(
        `https://www.googleapis.com/drive/v3/files/${file.id}?alt=media`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Drive file download failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error loading from Google Drive:', error);
      throw error;
    }
  },
};
