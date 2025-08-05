import { useState } from 'react';
import { FiEye, FiEyeOff, FiUpload, FiX } from 'react-icons/fi';

const FormField = ({
  label,
  name,
  type = 'text',
  value,
  onChange,
  onBlur,
  error,
  placeholder,
  required = false,
  disabled = false,
  options = [], // For select fields
  multiple = false, // For select multiple
  rows = 4, // For textarea
  accept, // For file input
  className = '',
  helpText,
  children, // For custom select options
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const handleInputChange = (e) => {
    const { value: inputValue, files, type: inputType } = e.target;

    if (inputType === 'file') {
      // Convert FileList to Array and extract only serializable properties
      const fileArray = files ? Array.from(files).map(file => ({
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: file.lastModified,
        // Store the actual File object separately if needed for upload
        _file: file
      })) : [];
      // Call onChange with name and value for consistency
      if (onChange) {
        onChange(name, fileArray);
      }
    } else if (inputType === 'checkbox') {
      if (onChange) {
        onChange(name, e.target.checked);
      }
    } else if (multiple && inputType === 'select-multiple') {
      const selectedValues = Array.from(e.target.selectedOptions, option => option.value);
      if (onChange) {
        onChange(name, selectedValues);
      }
    } else {
      // Handle regular inputs (text, select, textarea, etc.)
      if (onChange) {
        onChange(name, inputValue);
      }
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      // Convert FileList to Array and extract only serializable properties
      const fileArray = Array.from(files).map(file => ({
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: file.lastModified,
        // Store the actual File object separately if needed for upload
        _file: file
      }));
      if (onChange) {
        onChange(name, fileArray);
      }
    }
  };

  const renderInput = () => {
    const baseClasses = `form-input ${error ? 'error' : ''} ${disabled ? 'disabled' : ''} ${className}`;

    switch (type) {
      case 'textarea':
        return (
          <textarea
            name={name}
            value={value || ''}
            onChange={handleInputChange}
            onBlur={onBlur}
            placeholder={placeholder}
            required={required}
            disabled={disabled}
            rows={rows}
            className={baseClasses}
            {...props}
          />
        );

      case 'select':
        return (
          <select
            name={name}
            value={multiple ? (value || []) : (value || '')}
            onChange={handleInputChange}
            onBlur={onBlur}
            required={required}
            disabled={disabled}
            multiple={multiple}
            className={baseClasses}
            {...props}
          >
            {!multiple && !children && <option value="">Select {label}</option>}
            {children || options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case 'checkbox':
        return (
          <div className="checkbox-wrapper">
            <input
              type="checkbox"
              name={name}
              checked={value || false}
              onChange={handleInputChange}
              onBlur={onBlur}
              required={required}
              disabled={disabled}
              className="form-checkbox"
              {...props}
            />
            <span className="checkbox-label">{label}</span>
          </div>
        );

      case 'file':
        return (
          <div className="file-field-container">
            <div
              className={`file-upload-area ${dragOver ? 'drag-over' : ''} ${baseClasses}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => document.getElementById(`file-input-${name}`)?.click()}
            >
              <input
                id={`file-input-${name}`}
                type="file"
                name={name}
                onChange={handleInputChange}
                onBlur={onBlur}
                required={required}
                disabled={disabled}
                accept={accept}
                multiple={multiple}
                className="file-input"
                style={{ display: 'none' }}
                {...props}
              />
              <div className="file-upload-content">
                <FiUpload size={24} />
                <p>
                  {multiple ? 'Click to select files or drag and drop' : 'Click to select file or drag and drop'}
                </p>
                {accept && <small>Accepted formats: {accept}</small>}
                {multiple && <small>You can select multiple files at once</small>}
              </div>
            </div>
            {value && value.length > 0 && (
              <div className="selected-files">
                <h4>Selected Files ({value.length}):</h4>
                <ul className="file-list">
                  {value.map((file, index) => (
                    <li key={index} className="selected-file">
                      <span className="file-name">{file.name}</span>
                      <span className="file-size">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          const newFiles = value.filter((_, i) => i !== index);
                          if (onChange) {
                            onChange(name, newFiles);
                          }
                        }}
                        className="remove-file-btn"
                        title="Remove file"
                      >
                        <FiX size={16} />
                      </button>
                    </li>
                  ))}
                </ul>
                {multiple && (
                  <div className="file-actions">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onChange) {
                          onChange(name, []);
                        }
                      }}
                      className="clear-all-btn"
                    >
                      Clear All
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        );

      case 'password':
        return (
          <div className="password-input-wrapper">
            <input
              type={showPassword ? 'text' : 'password'}
              name={name}
              value={value || ''}
              onChange={handleInputChange}
              onBlur={onBlur}
              placeholder={placeholder}
              required={required}
              disabled={disabled}
              className={baseClasses}
              {...props}
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
              disabled={disabled}
            >
              {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
            </button>
          </div>
        );

      default:
        return (
          <input
            type={type}
            name={name}
            value={value || ''}
            onChange={handleInputChange}
            onBlur={onBlur}
            placeholder={placeholder}
            required={required}
            disabled={disabled}
            className={baseClasses}
            {...props}
          />
        );
    }
  };

  if (type === 'checkbox') {
    return (
      <div className={`form-field checkbox-field ${error ? 'has-error' : ''}`}>
        {renderInput()}
        {error && <span className="error-message">{error}</span>}
        {helpText && <small className="help-text">{helpText}</small>}
      </div>
    );
  }

  return (
    <div className={`form-field ${error ? 'has-error' : ''}`}>
      {label && (
        <label htmlFor={name} className="form-label">
          {label}
          {required && <span className="required">*</span>}
        </label>
      )}
      {renderInput()}
      {error && <span className="error-message">{error}</span>}
      {helpText && <small className="help-text">{helpText}</small>}
    </div>
  );
};

export default FormField;