import React, { useRef } from 'react';
import { Image as ImageIcon, Upload, X, Sparkles } from 'lucide-react';

export default function MediaImagePicker({
  value,
  onChange,
  label = 'Relevant Picture / Poster',
  defaultFallback = '',
  placeholder = 'Paste image URL (https://...) or choose local file below...'
}) {
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Please choose an image under 5MB.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        onChange(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const previewSrc = value || defaultFallback;

  return (
    <div
      style={{
        marginTop: '10px',
        marginBottom: '12px',
        padding: '12px 14px',
        background: 'rgba(255, 255, 255, 0.02)',
        border: '1px solid #2a2826',
        borderRadius: '8px'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
        <label
          style={{
            margin: 0,
            fontSize: '11.5px',
            fontWeight: 600,
            color: '#f4f0eb',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <ImageIcon size={14} color="#f07842" /> {label}
        </label>
        {value && (
          <button
            type="button"
            onClick={() => {
              onChange('');
              if (fileInputRef.current) fileInputRef.current.value = '';
            }}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#e05656',
              fontSize: '11px',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <X size={12} /> Clear Custom Image
          </button>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '8px', alignItems: 'center' }}>
        <input
          type="url"
          placeholder={placeholder}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          style={{
            width: '100%',
            padding: '8px 10px',
            fontSize: '12px',
            background: '#191919',
            border: '1px solid #3d3a36',
            borderRadius: '6px',
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
            gap: '6px',
            padding: '8px 12px',
            background: '#232220',
            border: '1px solid #3d3a36',
            borderRadius: '6px',
            color: '#f4f0eb',
            cursor: 'pointer',
            fontSize: '11.5px',
            whiteSpace: 'nowrap'
          }}
        >
          <Upload size={13} color="#f07842" /> Browse File
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
        <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img
            src={previewSrc}
            alt="Preview"
            style={{
              width: '84px',
              height: '48px',
              objectFit: 'cover',
              borderRadius: '6px',
              border: '1px solid #3d3a36',
              boxShadow: '0 2px 8px rgba(0,0,0,0.4)'
            }}
            onError={(e) => {
              if (defaultFallback && e.currentTarget.src !== defaultFallback) {
                e.currentTarget.src = defaultFallback;
              }
            }}
          />
          <div style={{ fontSize: '11px', color: '#a7a09a', lineHeight: '1.4' }}>
            {value ? (
              <span style={{ color: '#67d7a3' }}>Custom picture attached</span>
            ) : (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <Sparkles size={11} color="#f07842" /> Auto-matched picture preview
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
