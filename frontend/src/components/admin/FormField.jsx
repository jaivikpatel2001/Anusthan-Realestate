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
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const handleInputChange = (e) => {
    const { value: inputValue, files, type: inputType } = e.target;
    
    if (inputType === 'file') {
      onChange(name, files);
    } else if (inputType === 'checkbox') {
      onChange(name, e.target.checked);
    } else if (multiple && inputType === 'select-multiple') {
      const selectedValues = Array.from(e.target.selectedOptions, option => option.value);
      onChange(name, selectedValues);
    } else {
      onChange(name, inputValue);
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
      onChange(name, files);
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
            {!multiple && <option value="">Select {label}</option>}
            {options.map((option) => (
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
          <div
            className={`file-upload-area ${dragOver ? 'drag-over' : ''} ${baseClasses}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <input
              type="file"
              name={name}
              onChange={handleInputChange}
              onBlur={onBlur}
              required={required}
              disabled={disabled}
              accept={accept}
              multiple={multiple}
              className="file-input"
              {...props}
            />
            <div className="file-upload-content">
              <FiUpload size={24} />
              <p>
                {multiple ? 'Drop files here or click to select' : 'Drop file here or click to select'}
              </p>
              {accept && <small>Accepted formats: {accept}</small>}
            </div>
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
