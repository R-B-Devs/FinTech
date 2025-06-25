import React, { useState } from 'react';
import Papa from 'papaparse';

function BankUpload({ onDataParsed }) {
  const [fileName, setFileName] = useState('');

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFileName(file.name);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: function (results) {
        onDataParsed(results.data);
      },
    });
  };

  return (
    <div style={{ padding: '1rem' }}>
      <label>📄 Upload Bank CSV: </label>
      <input type="file" accept=".csv" onChange={handleFileUpload} />
      {fileName && <p>✅ Loaded: {fileName}</p>}
    </div>
  );
}

export default BankUpload;
