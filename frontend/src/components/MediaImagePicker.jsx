import React, { useRef } from 'react';
import { Image as ImageIcon, Upload, X, Sparkles, Check } from 'lucide-react';

const MAX_IMAGE_FILE_BYTES = 8 * 1024 * 1024;
const MAX_IMAGE_DATA_CHARS = 11_200_000;

export default function MediaImagePicker({
  value,
  onChange,
  label = 'Relevant Picture / Poster / Singer Portrait',
  defaultFallback = '',
  placeholder = 'Paste image URL (https://...) or click Browse File to pick from your computer...'
}) {
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > MAX_IMAGE_FILE_BYTES) {
        alert('Please choose an image under 8MB.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageData = event.target.result;
        if (typeof imageData !== 'string' || imageData.length > MAX_IMAGE_DATA_CHARS) {
          alert('The selected image exceeds the supported upload size.');
          return;
        }
        onChange(imageData);
      };
      reader.onerror = () => {
        alert('Could not read the selected image. Please try another file.');
      };
      reader.readAsDataURL(file);
    }
  };

  const previewSrc = value || defaultFallback;

  return (
    <div
      style={{
        marginTop: '14px',
        marginBottom: '16px',
        padding: '14px 16px',
        background: '#1c1b19',
        border: '1.5px solid #3d3a36',
        borderRadius: '10px',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: '26px',
              height: '26px',
              borderRadius: '6px',
              background: 'rgba(240, 120, 66, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <ImageIcon size={15} color="#f07842" />
          </div>
          <div>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#f4f0eb', display: 'block' }}>
              {label}
            </span>
            <span style={{ fontSize: '10.5px', color: '#a7a09a' }}>
              Upload local image file or paste direct picture URL
            </span>
          </div>
        </div>

        {value && (
          <button
            type="button"
            onClick={() => {
              onChange('');
              if (fileInputRef.current) fileInputRef.current.value = '';
            }}
            style={{
              background: 'rgba(224, 86, 86, 0.12)',
              border: '1px solid rgba(224, 86, 86, 0.3)',
              borderRadius: '5px',
              padding: '4px 9px',
              color: '#e05656',
              fontSize: '11px',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              fontWeight: 500
            }}
          >
            <X size={12} /> Reset to Auto-Match
          </button>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '10px', alignItems: 'center' }}>
        <input
          type="text"
          maxLength={MAX_IMAGE_DATA_CHARS}
          placeholder={placeholder}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          style={{
            width: '100%',
            padding: '9px 12px',
            fontSize: '12px',
            background: '#141414',
            border: '1px solid #3d3a36',
            borderRadius: '7px',
            color: '#f4f0eb',
            boxSizing: 'border-box'
          }}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '7px',
            padding: '9px 15px',
            background: 'rgba(240, 120, 66, 0.15)',
            border: '1px solid #f07842',
            borderRadius: '7px',
            color: '#f07842',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: 600,
            whiteSpace: 'nowrap'
          }}
        >
          <Upload size={14} color="#f07842" /> Browse File
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
      </div>

      {previewSrc && (
        <div
          style={{
            marginTop: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            padding: '8px 10px',
            background: '#141414',
            borderRadius: '8px',
            border: '1px solid #2a2826'
          }}
        >
          <img
            src={previewSrc}
            alt="Preview"
            style={{
              width: '108px',
              height: '60px',
              objectFit: 'cover',
              borderRadius: '6px',
              border: '1px solid #4a4642',
              boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
              flexShrink: 0
            }}
            onError={(e) => {
              if (defaultFallback && e.currentTarget.src !== defaultFallback) {
                e.currentTarget.src = defaultFallback;
              }
            }}
          />
          <div style={{ fontSize: '11px', color: '#a7a09a', lineHeight: '1.5' }}>
            {value ? (
              <span style={{ color: '#67d7a3', display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 600 }}>
                <Check size={13} color="#67d7a3" /> Custom picture attached
              </span>
            ) : (
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#e09868' }}>
                <Sparkles size={13} color="#f07842" /> Auto-matched poster / singer portrait active
              </span>
            )}
            <span style={{ display: 'block', fontSize: '10px', color: '#7a746e', marginTop: '2px' }}>
              This visual will display on Grid Cards, List rows, and Detail views.
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
