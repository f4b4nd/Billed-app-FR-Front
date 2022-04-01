export const fileMock = (file) => {
    const blob = new Blob([file.body], {type: file.mimeType})
    blob['lastModifiedDate'] = new Date()
    blob['name'] = file.name
    return blob
}
