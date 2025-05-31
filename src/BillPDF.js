import React from 'react';
import { Page, Text, View, Document, Image, StyleSheet, Font } from '@react-pdf/renderer';
import logo from './logo.png';

// Create styles with white and blue color scheme
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 12,
    fontFamily: 'Helvetica',
    backgroundColor: '#ffffff',
  },
  dateContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 10,
  },
  dateText: {
    fontSize: 12,
    color: '#1e88e5',
  },
  centeredLogoContainer: {
    alignItems: 'center',
    marginVertical: 10,
  },
  logo: {
    width: 150,
    height: 150,
  },
  centeredHeader: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 10,
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e88e5',
    textAlign: 'center',
    marginBottom: 5,
  },
  subHeaderText: {
    fontSize: 12,
    color: '#333333',
    textAlign: 'center',
    marginTop: 5,
  },
  table: {
    display: 'table',
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#1e88e5',
    borderRightWidth: 0,
    borderBottomWidth: 0,
    marginBottom: 15,
  },
  tableRow: { 
    flexDirection: 'row',
  },
  tableColHeader: {
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#1e88e5',
    borderLeftWidth: 0,
    borderTopWidth: 0,
    backgroundColor: '#e3f2fd',
    padding: 5,
    flex: 1,
    fontWeight: 'bold',
    color: '#1e88e5',
  },
  tableCol: {
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#1e88e5',
    borderLeftWidth: 0,
    borderTopWidth: 0,
    padding: 5,
    flex: 1,
    color: '#333333',
  },
  totalValue: {
    fontFamily: 'Helvetica-Bold',
    color: '#1e88e5',
    fontSize: 13,
  }
});

// Create the PDF document component
const BillPDF = ({ data }) => {
  const rate = parseFloat(data.rate) || 0;
  const quintals = parseFloat(data.quintals) || 0;
  const lorryHire = parseFloat(data.lorryHire) || 0;
  const discountPct = parseFloat(data.discount) || 0;
  const cheque = parseFloat(data.chequeAmount) || 0;

  const gross = rate * quintals;
  const discountAmt = (gross * discountPct) / 100;
  const total = gross - lorryHire - discountAmt;
  const diff = cheque - total;
  const status = diff < 0
    ? `Shortage Rs.${Math.abs(diff).toFixed(2)}`
    : `Excess Rs.${diff.toFixed(2)}`;

  // Use "Rs." instead of the Unicode rupee symbol
  const rupeeSymbol = 'Rs.';

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Date at Top Right */}
        <View style={styles.dateContainer}>
          <Text style={styles.dateText}>Date: {data.date}</Text>
        </View>
        
        {/* Centered Logo */}
        <View style={styles.centeredLogoContainer}>
          <Image style={styles.logo} src={logo} />
        </View>
        
        {/* Header */}
        <View style={styles.centeredHeader}>
          <Text style={styles.headerText}>
            Tejas Canvassing
          </Text>
          <Text style={styles.subHeaderText}>
            No 123, 4th Main Road, APMC Yard, Yeshwanthpur, Bangalore-560054
          </Text>
        </View>
        
        {/* Miller & Merchant */}
        <View style={[styles.table, { marginBottom: 20 }]}>
          <View style={styles.tableRow}>
            <Text style={[styles.tableColHeader, { flex: 1 }]}>Miller Name</Text>
            <Text style={[styles.tableColHeader, { flex: 1 }]}>Merchant Name</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={[styles.tableCol, { flex: 1 }]}>{data.millerName}</Text>
            <Text style={[styles.tableCol, { flex: 1 }]}>{data.merchantName}</Text>
          </View>
        </View>

        {/* Rate * Quintals & Amount */}
        <View style={[styles.table, { marginBottom: 0 }]}>
          <View style={styles.tableRow}>
            <Text style={[styles.tableColHeader, { flex: 1, textAlign: 'center' }]}>Rate ({rupeeSymbol})</Text>
            <Text style={[styles.tableColHeader, { flex: 1, textAlign: 'center' }]}>Quintals</Text>
            <Text style={[styles.tableColHeader, { flex: 1, textAlign: 'right' }]}>Amount ({rupeeSymbol})</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={[styles.tableCol, { flex: 1, textAlign: 'center' }]}>{rupeeSymbol} {rate.toFixed(2)}</Text>
            <Text style={[styles.tableCol, { flex: 1, textAlign: 'center' }]}>{quintals.toFixed(2)}</Text>
            <Text style={[styles.tableCol, { flex: 1, textAlign: 'right' }]}>{rupeeSymbol} {gross.toFixed(2)}</Text>
          </View>
        </View>

        {/* Charges and Discounts */}
        <View style={[styles.table, { marginBottom: 20 }]}>
          <View style={styles.tableRow}>
            <Text style={[styles.tableColHeader, { flex: 2 }]}>Description</Text>
            <Text style={[styles.tableColHeader, { flex: 1, textAlign: 'right' }]}>Amount ({rupeeSymbol})</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={[styles.tableCol, { flex: 2 }]}>Lorry Hire</Text>
            <Text style={[styles.tableCol, { flex: 1, textAlign: 'right' }]}>{rupeeSymbol} {lorryHire.toFixed(2)}</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={[styles.tableCol, { flex: 2 }]}>Discount ({discountPct}%)</Text>
            <Text style={[styles.tableCol, { flex: 1, textAlign: 'right' }]}>{rupeeSymbol} {discountAmt.toFixed(2)}</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={[styles.tableCol, { flex: 2, fontWeight: 'bold' }]}>Total Payable</Text>
            <Text style={[styles.tableCol, { flex: 1, textAlign: 'right', fontWeight: 'bold', color: '#1e88e5' }]}>{rupeeSymbol} {total.toFixed(2)}</Text>
          </View>
        </View>

        {/* Payment Info */}
        <View style={[styles.table, { marginBottom: 20 }]}>
          <View style={styles.tableRow}>
            <Text style={[styles.tableColHeader, { flex: 2 }]}>Payment Mode</Text>
            <Text style={[styles.tableColHeader, { flex: 1, textAlign: 'right' }]}>{data.paymentMode}</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={[styles.tableCol, { flex: 2 }]}>Cheque/RTGS/NEFT Amount</Text>
            <Text style={[styles.tableCol, { flex: 1, textAlign: 'right' }]}>{rupeeSymbol} {cheque.toFixed(2)}</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={[styles.tableCol, { flex: 2 }]}>Cheque No / UTR</Text>
            <Text style={[styles.tableCol, { flex: 1, textAlign: 'right' }]}>{data.chequeNo}</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={[styles.tableCol, { flex: 2 }]}>Bill No</Text>
            <Text style={[styles.tableCol, { flex: 1, textAlign: 'right' }]}>{data.billNo}</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={[styles.tableCol, { flex: 2, color: '#1e88e5', fontWeight: 'bold' }]}>Shortage / Excess</Text>
            <Text style={[styles.tableCol, { flex: 1, textAlign: 'right', color: diff < 0 ? '#1e88e5' : '#4ecca3', fontWeight: 'bold' }]}>{status}</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};

export default BillPDF;



