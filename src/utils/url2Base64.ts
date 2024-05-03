
export const url2Base64 = async (url: string) : Promise<string| ArrayBuffer| null> => {
  try {
    const response = await fetch(url)

    // Check if the request was successful
    if (!response.ok) {
      console.error('Failed to fetch image from URL')
      return null
    }

    // Convert the image data to a Buffer
    const buffer = await response.blob()
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        resolve(reader.result)
      }

      reader.onerror = () => {
        reject(new Error('Unable to read blob as base64'));
      }
      reader.readAsDataURL(buffer)
    })


  }
  catch (error) {
    console.error('Error fetching or encoding image:', error)
    return null
  }
}