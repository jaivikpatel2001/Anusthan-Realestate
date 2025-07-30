import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  FiChevronUp,
  FiChevronDown,
  FiSearch,
  FiFilter,
  FiChevronLeft,
  FiChevronRight,
  FiMoreHorizontal,
  FiDownload
} from 'react-icons/fi';
import LoadingSpinner from '../LoadingSpinner';

const DataTable = ({
  data = [],
  columns = [],
  loading = false,
  searchable = true,
  sortable = true,
  filterable = false,
  pagination = true,
  pageSize = 10,
  onRowClick,
  onSort,
  onSearch,
  onFilter,
  className = '',
  emptyMessage = 'No data available',
  actions,
  bulkActions,
  selectable = false,
  ...props
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const [columnFilters, setColumnFilters] = useState({});

  // Filter and search data
  const filteredData = useMemo(() => {
    let filtered = [...data];

    // Apply search
    if (searchTerm && searchable) {
      filtered = filtered.filter(item =>
        columns.some(column => {
          const value = item[column.key];
          return value && value.toString().toLowerCase().includes(searchTerm.toLowerCase());
        })
      );
    }

    // Apply column filters
    Object.entries(columnFilters).forEach(([columnKey, filterValue]) => {
      if (filterValue) {
        filtered = filtered.filter(item => {
          const value = item[columnKey];
          if (value === null || value === undefined) return false;
          return value.toString().toLowerCase().includes(filterValue.toLowerCase());
        });
      }
    });

    // Apply sorting
    if (sortConfig.key && sortable) {
      filtered.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        
        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    return filtered;
  }, [data, searchTerm, sortConfig, columns, searchable, sortable]);

  // Pagination
  const totalPages = Math.ceil(filteredData.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedData = pagination 
    ? filteredData.slice(startIndex, startIndex + pageSize)
    : filteredData;

  const handleSort = (key) => {
    if (!sortable) return;

    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }

    setSortConfig({ key, direction });
    if (onSort) {
      onSort({ key, direction });
    }
  };

  const handleSearch = (value) => {
    setSearchTerm(value);
    setCurrentPage(1);
    if (onSearch) {
      onSearch(value);
    }
  };

  const handleColumnFilter = (columnKey, value) => {
    setColumnFilters(prev => ({
      ...prev,
      [columnKey]: value
    }));
    setCurrentPage(1);
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setColumnFilters({});
    setCurrentPage(1);
  };

  const handleRowSelect = (id) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedRows(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedRows.size === paginatedData.length && paginatedData.length > 0) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(paginatedData.map(item => item.id || item._id)));
    }
  };

  const handleSelectAllPages = () => {
    setSelectedRows(new Set(filteredData.map(item => item.id || item._id)));
  };

  const handleClearSelection = () => {
    setSelectedRows(new Set());
  };

  const exportToCSV = () => {
    const dataToExport = selectedRows.size > 0
      ? filteredData.filter(item => selectedRows.has(item.id || item._id))
      : filteredData;

    if (dataToExport.length === 0) {
      return;
    }

    // Create CSV headers
    const headers = columns.map(col => col.title).join(',');

    // Create CSV rows
    const rows = dataToExport.map(item => {
      return columns.map(col => {
        let value = item[col.key];
        if (col.render && typeof col.render === 'function') {
          // For rendered columns, try to extract text content
          const rendered = col.render(value, item);
          if (typeof rendered === 'string') {
            value = rendered;
          } else if (rendered && rendered.props && rendered.props.children) {
            value = rendered.props.children;
          }
        }
        // Clean and escape the value
        if (value === null || value === undefined) value = '';
        value = String(value).replace(/"/g, '""'); // Escape quotes
        return `"${value}"`;
      }).join(',');
    });

    // Combine headers and rows
    const csvContent = [headers, ...rows].join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === 'asc' ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />;
  };

  const renderCell = (item, column) => {
    if (column.render) {
      return column.render(item[column.key], item);
    }
    
    const value = item[column.key];
    if (value === null || value === undefined) return '-';
    
    return value.toString();
  };

  if (loading) {
    return (
      <div className="data-table-loading">
        <LoadingSpinner size="large" text="Loading data..." />
      </div>
    );
  }

  return (
    <div className={`data-table ${className}`} {...props}>
      {/* Table Header */}
      <div className="data-table-header">
        <div className="data-table-controls">
          {searchable && (
            <div className="search-box">
              <FiSearch size={18} />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="search-input"
              />
            </div>
          )}

          {filterable && (
            <button
              className="filter-btn"
              onClick={() => setShowFilters(!showFilters)}
            >
              <FiFilter size={18} />
              Filters
            </button>
          )}

          <button
            className="export-btn"
            onClick={exportToCSV}
            title={selectedRows.size > 0 ? `Export ${selectedRows.size} selected items` : `Export all ${filteredData.length} items`}
          >
            <FiDownload size={18} />
            Export CSV
          </button>
        </div>

        {bulkActions && selectedRows.size > 0 && (
          <div className="bulk-actions">
            <div className="bulk-selection-info">
              <span className="selection-count">{selectedRows.size} selected</span>
              {selectedRows.size < filteredData.length && (
                <button
                  className="select-all-btn"
                  onClick={handleSelectAllPages}
                >
                  Select all {filteredData.length} items
                </button>
              )}
              <button
                className="clear-selection-btn"
                onClick={handleClearSelection}
              >
                Clear selection
              </button>
            </div>
            <div className="bulk-action-buttons">
              {bulkActions.map((action, index) => (
                <button
                  key={index}
                  className={`bulk-action-btn ${action.className || ''}`}
                  onClick={() => action.onClick(Array.from(selectedRows))}
                  title={action.title}
                >
                  {action.icon && action.icon}
                  {action.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="table-container">
        <table className="data-table-table">
          <thead>
            <tr>
              {selectable && (
                <th className="select-column">
                  <input
                    type="checkbox"
                    checked={selectedRows.size === paginatedData.length && paginatedData.length > 0}
                    onChange={handleSelectAll}
                  />
                </th>
              )}
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`${column.sortable !== false && sortable ? 'sortable' : ''} ${column.className || ''}`}
                  onClick={() => column.sortable !== false && handleSort(column.key)}
                  style={{ width: column.width }}
                >
                  <div className="th-content">
                    <span>{column.title}</span>
                    {column.sortable !== false && sortable && getSortIcon(column.key)}
                  </div>
                </th>
              ))}
              {actions && <th className="actions-column">Actions</th>}
            </tr>
            {showFilters && (
              <tr className="filter-row">
                {selectable && <th></th>}
                {columns.map((column) => (
                  <th key={`filter-${column.key}`}>
                    {column.filterable !== false && (
                      <input
                        type="text"
                        placeholder={`Filter ${column.title.toLowerCase()}...`}
                        value={columnFilters[column.key] || ''}
                        onChange={(e) => handleColumnFilter(column.key, e.target.value)}
                        className="column-filter-input"
                      />
                    )}
                  </th>
                ))}
                {actions && (
                  <th>
                    <button
                      className="clear-filters-btn"
                      onClick={clearAllFilters}
                      title="Clear all filters"
                    >
                      Clear
                    </button>
                  </th>
                )}
              </tr>
            )}
          </thead>
          <tbody>
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (selectable ? 1 : 0) + (actions ? 1 : 0)} className="empty-row">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              paginatedData.map((item, index) => (
                <motion.tr
                  key={item.id || item._id || index}
                  className={`${onRowClick ? 'clickable' : ''} ${selectedRows.has(item.id || item._id) ? 'selected' : ''}`}
                  onClick={() => onRowClick && onRowClick(item)}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  {selectable && (
                    <td className="select-column">
                      <input
                        type="checkbox"
                        checked={selectedRows.has(item.id || item._id)}
                        onChange={() => handleRowSelect(item.id || item._id)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </td>
                  )}
                  {columns.map((column) => (
                    <td key={column.key} className={column.className || ''}>
                      {renderCell(item, column)}
                    </td>
                  ))}
                  {actions && (
                    <td className="actions-column">
                      <div className="action-buttons">
                        {actions.map((action, actionIndex) => (
                          <button
                            key={actionIndex}
                            className={`action-btn ${action.className || ''}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              action.onClick(item);
                            }}
                            title={action.title}
                          >
                            {action.icon}
                          </button>
                        ))}
                      </div>
                    </td>
                  )}
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && totalPages > 1 && (
        <div className="data-table-pagination">
          <div className="pagination-info">
            Showing {startIndex + 1} to {Math.min(startIndex + pageSize, filteredData.length)} of {filteredData.length} entries
          </div>
          <div className="pagination-controls">
            <button
              className="pagination-btn"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <FiChevronLeft size={16} />
            </button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                className={`pagination-btn ${currentPage === page ? 'active' : ''}`}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </button>
            ))}
            
            <button
              className="pagination-btn"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <FiChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;
