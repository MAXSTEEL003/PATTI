import React, { useState, useEffect } from 'react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import './App.css';
import BillPDF from './BillPDF';
import Select from 'react-select';

export default function App() {
  const [formData, setFormData] = useState({
    date: '',
    millerName: '',
    merchantName: '',
    rate: '',
    quintals: '',
    lorryHire: '',
    discount: '0',
    chequeAmount: '',
    paymentMode: 'Cheque',
    chequeNo: '',
    billNo: '',
  });

  const [previewData, setPreviewData] = useState({
    gross: 0,
    discountAmt: 0,
    total: 0,
    statusText: 'Excess ₹0.00',
    statusClassName: 'status-excess', // Use className for HTML styling
  });

  useEffect(() => {
    const rate = parseFloat(formData.rate) || 0;
    const quintals = parseFloat(formData.quintals) || 0;
    const lorryHire = parseFloat(formData.lorryHire) || 0;
    const discountPct = parseFloat(formData.discount) || 0;
    const cheque = parseFloat(formData.chequeAmount) || 0;

    const gross = rate * quintals;
    const discountAmt = (gross * discountPct) / 100;
    const total = gross - lorryHire - discountAmt;
    const diff = cheque - total;
    const statusText = diff < 0 ? `Shortage ₹${Math.abs(diff).toFixed(2)}` : `Excess ₹${diff.toFixed(2)}`;
    const statusClassName = diff < 0 ? 'status-shortage' : 'status-excess';

    setPreviewData({ gross, discountAmt, total, statusText, statusClassName });
  }, [formData]);

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(f => ({ ...f, [name]: value }));
  };

  const isFormIncomplete = !formData.date || !formData.millerName || !formData.merchantName || !formData.rate || !formData.quintals || !formData.chequeAmount;


  return (
    <div className="bill-generator-container">
      <h2 className="bill-generator-heading">✨ Tejas Canvassing ✨</h2>
      
      <div className="form-grid">
        <label className="form-label">
          <span className="label-span">📅 Date</span>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className="form-input"
          />
        </label>
        <label className="form-label">
          <span className="label-span">🏭 Miller Name</span>
          <input
            name="millerName"
            value={formData.millerName}
            onChange={handleChange}
            className="form-input"
            placeholder="Enter miller name"
          />
        </label>
        <label className="form-label">
          <span className="label-span">🛒 Merchant Name</span>
          <input
            name="merchantName"
            value={formData.merchantName}
            onChange={handleChange}
            className="form-input"
            placeholder="Enter merchant name"
          />
        </label>
        <label className="form-label">
          <span className="label-span">💰 Rate (₹)</span>
          <div className="input-with-icon">
            <span className="rupee-symbol">₹</span>
            <input
              name="rate"
              value={formData.rate}
              onChange={handleChange}
              type="number"
              className="form-input with-rupee"
              placeholder="e.g., 2500.00"
            />
          </div>
        </label>
        <label className="form-label">
          <span className="label-span">⚖️ Quintals</span>
          <input
            name="quintals"
            value={formData.quintals}
            onChange={handleChange}
            type="number"
            className="form-input"
            placeholder="e.g., 10.5"
          />
        </label>
        <label className="form-label">
          <span className="label-span">🚚 Lorry Hire (₹)</span>
          <div className="input-with-icon">
            <span className="rupee-symbol">₹</span>
            <input
              name="lorryHire"
              value={formData.lorryHire}
              onChange={handleChange}
              type="number"
              className="form-input with-rupee"
              placeholder="e.g., 1500.00"
            />
          </div>
        </label>
        <label className="form-label">
          <span className="label-span">🏷️ Discount (%)</span>
          <select
            name="discount"
            value={formData.discount}
            onChange={handleChange}
            className="form-select"
          >
            <option value="0">NIL</option>
            <option value="1">1%</option>
            <option value="2">2%</option>
            <option value="3">3%</option>
            <option value="4">4%</option>
          </select>
        </label>
        <label className="form-label">
          <span className="label-span">💸 Payment Amount (₹)</span>
          <div className="input-with-icon">
            <span className="rupee-symbol">₹</span>
            <input
              name="chequeAmount"
              value={formData.chequeAmount}
              onChange={handleChange}
              type="number"
              className="form-input with-rupee"
              placeholder="Enter amount paid"
            />
          </div>
        </label>
        <label className="form-label">
          <span className="label-span">💳 Payment Mode</span>
          <select
            name="paymentMode"
            value={formData.paymentMode}
            onChange={handleChange}
            className="form-select"
          >
            <option value="Cheque">Cheque</option>
            <option value="NEFT">NEFT</option>
            <option value="RTGS">RTGS</option>
          </select>
        </label>
        <label className="form-label">
          <span className="label-span">🔢 Cheque No / UTR</span>
          <input
            name="chequeNo"
            value={formData.chequeNo}
            onChange={handleChange}
            className="form-input"
            placeholder="Enter Cheque No. or UTR"
          />
        </label>
        <label className="form-label">
          <span className="label-span">📝 Bill No</span>
          <input
            name="billNo"
            value={formData.billNo}
            onChange={handleChange}
            className="form-input"
            placeholder="Enter bill number"
          />
        </label>
      </div>

      <div>
        <h3 className="preview-heading">💼 Bill Summary</h3>
        <div className="preview-container">
          <p className="preview-text">
            <strong>Gross Amount:</strong> 
            <span className="amount">₹ {previewData.gross.toFixed(2)}</span>
          </p>
          <p className="preview-text">
            <strong>Lorry Hire:</strong> 
            <span className="amount negative">- ₹ {(parseFloat(formData.lorryHire) || 0).toFixed(2)}</span>
          </p>
          <p className="preview-text">
            <strong>Discount ({formData.discount || 0}%):</strong> 
            <span className="amount negative">- ₹ {previewData.discountAmt.toFixed(2)}</span>
          </p>
          <hr className="hr-divider" />
          <p className="preview-text" style={{fontWeight: 'bold'}}>
            <strong>Total Payable:</strong> 
            <span className="amount total">₹ {previewData.total.toFixed(2)}</span>
          </p>
          <p className="preview-text">
            <strong>Amount Paid:</strong> 
            <span className="amount">₹ {(parseFloat(formData.chequeAmount) || 0).toFixed(2)}</span>
          </p>
          <hr className="hr-divider" />
          <p className="preview-text" style={{fontWeight: 'bold', fontSize: '1.1rem'}}>
            <strong>Balance:</strong>
            <span className={`status-text ${previewData.statusClassName}`}>
              {previewData.statusText}
            </span>
          </p>
        </div>
      </div>

      <div className="button-container">
        <PDFDownloadLink document={<BillPDF data={formData} />} fileName={formData.billNo ? `Bill-${formData.billNo}.pdf` : "bill.pdf"}>
          {({ loading }) => (
            <button
              className="download-button"
              disabled={loading || isFormIncomplete}
            >
              {loading ? '⏳ Preparing PDF...' : '📥 Generate PDF Bill'}
            </button>
          )}
        </PDFDownloadLink>
        {isFormIncomplete && <p className="error-message">⚠️ Please complete all required fields to generate the bill.</p>}
      </div>
    </div>
  );
}
