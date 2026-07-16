export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  createdTime: string;
  webViewLink: string;
  thumbnailLink?: string;
}

/**
 * Fetch files (presentations and PDFs) from the user's Google Drive
 * @param accessToken The Google OAuth access token
 * @returns A promise that resolves to an array of DriveFile objects
 */
export async function fetchGoogleDriveFiles(accessToken: string, folderId?: string): Promise<DriveFile[]> {
  let query = "(mimeType = 'application/vnd.google-apps.presentation' or mimeType = 'application/pdf')";
  if (folderId) {
    query = `'${folderId}' in parents and ` + query;
  }
  const queryStr = encodeURIComponent(query);
  const url = `https://www.googleapis.com/drive/v3/files?q=${queryStr}&fields=files(id,name,mimeType,size,createdTime,webViewLink,thumbnailLink)&pageSize=40&orderBy=createdTime desc`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('UNAUTHORIZED');
    }
    throw new Error(`Google Drive API returned status: ${response.status}`);
  }

  const data = await response.json();
  return data.files || [];
}

/**
 * Extract slide text content slide-by-slide from a Google Slides presentation
 * @param presentationId The ID of the presentation file
 * @param accessToken The Google OAuth access token
 * @returns The extracted plain text content
 */
export async function fetchPresentationText(presentationId: string, accessToken: string): Promise<string> {
  const response = await fetch(`https://slides.googleapis.com/v1/presentations/${presentationId}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Google Slides API returned status: ${response.status}`);
  }

  const presentation = await response.json();
  let extractedText = '';

  if (presentation.slides) {
    presentation.slides.forEach((slide: any, idx: number) => {
      extractedText += `\n[Slide ${idx + 1}]\n`;
      if (slide.pageElements) {
        slide.pageElements.forEach((element: any) => {
          if (element.shape?.text?.textElements) {
            element.shape.text.textElements.forEach((te: any) => {
              if (te.textRun?.content) {
                extractedText += te.textRun.content + ' ';
              }
            });
          }
        });
      }
    });
  }

  return extractedText;
}
