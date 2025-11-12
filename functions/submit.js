// functions/submit.js
const { google } = require('googleapis');

exports.handler = async (event, context) => {
  // 1. Hanya izinkan method POST
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    // 2. Parsing data yang dikirim dari frontend
    const body = JSON.parse(event.body);
    const { nama, email, pesan } = body; // Sesuaikan dengan field form Anda

    // 3. Konfigurasi Autentikasi Google
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        // Penting: replace digunakan untuk menangani karakter baris baru (\n) di Netlify
        private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      },
      scopes: [
        'https://www.googleapis.com/auth/spreadsheets',
        'https://www.googleapis.com/auth/drive' // Jika nanti ingin upload file
      ],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    // 4. Menulis data ke Google Sheets
    // Spreadsheet ID didapat dari URL Google Sheet Anda
    const spreadsheetId = process.env.SPREADSHEET_ID; 

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Sheet1!A:C', // Sesuaikan nama Sheet dan kolom (A sampai C)
      valueInputOption: 'USER_ENTERED',
      resource: {
        values: [
          [nama, email, pesan, new Date().toLocaleString()] // Data yang dimasukkan
        ],
      },
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Data berhasil disimpan!' }),
    };

  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Gagal menyimpan data.', error: error.message }),
    };
  }
};
