import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

function FileUpload({ onDrop, fileName }) {
  const onDropCallback = useCallback((acceptedFiles) => {
    onDrop(acceptedFiles);
  }, [onDrop]);

  const { getRootProps, getInputProps } = useDropzone({ onDrop: onDropCallback });

  return (
    <div {...getRootProps({ className: 'dropzone' })}>
      <input {...getInputProps()} />
      {fileName ? (
        <p>{fileName}</p>
      ) : (
        <p>Drag 'n' drop some files here, or click to select files</p>
      )}
    </div>
  );
}


export default FileUpload;
