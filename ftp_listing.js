const ftp = require('ftp');

const ftp_host = 'zhernoklov.asuscomm.com';
const ftp_user = 'saf';
const ftp_pass = 'iMV9vDHFM@9Drvb'; // Please avoid storing sensitive information like passwords in plain text.

(async () => {
  try {
    const conn = new ftp();
    await conn.connect({
      host: ftp_host,
      user: ftp_user,
      password: ftp_pass,
      secure: true // Enable TLS for secure connection
    });

    console.log('Connected to FTP server.');

    const listing = await new Promise((resolve, reject) => {
      conn.list((err, files) => {
        if (err) {
          reject(err);
        } else {
          resolve(files);
        }
      });
    });

    console.log('File and folder listing:');
    listing.forEach(file => console.log(file));

    await conn.end();
  } catch (error) {
    console.error('Error:', error);
  }
})();
