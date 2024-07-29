import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

const RFFileUpload = ({ onDrop, file }) => {
  const onDropCallback = useCallback(acceptedFiles => {
    onDrop(acceptedFiles);
  }, [onDrop]);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop: onDropCallback });
  return (
    <div {...getRootProps()} style={dropzoneStyles}>
      <input {...getInputProps()} />
      {
        isDragActive ?
          <p>Drop the file here ...</p> :
          file ?
            <p>{file.name}</p> :
            <p>Drag 'n' drop a file here, or click to select a file</p>
      }
    </div>
  );
};
const dropzoneStyles = {
  border: '2px dashed #cccccc',
  borderRadius: '4px',
  padding: '20px',
  textAlign: 'center',
  cursor: 'pointer'
};

export default RFFileUpload;