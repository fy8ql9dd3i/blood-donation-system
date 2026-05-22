/**
 * Reporting — Excel export is a binary response; Axios must use responseType: 'blob'
 * so the browser can save the file (see Reports.jsx / ExportExcel.jsx).
 */
import api from './api'

/** GET /api/reports/generate — Excel workbook stream */
export async function downloadReportExcel(params) {
  return api.get('/reports/generate', {
    params,
    responseType: 'blob',
  })
}
