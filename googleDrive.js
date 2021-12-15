const fs = require('fs');
const readline = require('readline');
const {google} = require('googleapis');

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/drive.readonly'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = 'token.json';

// Load client secrets from a local file.
fs.readFile('credentials.json', (err, content) => {
  if (err) return console.log('Error loading client secret file:', err);
  // Authorize a client with credentials, then call the Google Drive API.
  authorize(JSON.parse(content), downloadParentFolder);
});

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
  const {client_secret, client_id, redirect_uris} = credentials.web;
  const oAuth2Client = new google.auth.OAuth2(
      client_id, client_secret, redirect_uris[0]);

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) return getAccessToken(oAuth2Client, callback);
    oAuth2Client.setCredentials(JSON.parse(token));
    callback(oAuth2Client);
  });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
function getAccessToken(oAuth2Client, callback) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  console.log('Authorize this app by visiting this url:', authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question('Enter the code from that page here: ', (code) => {
    rl.close();
    oAuth2Client.getToken(decodeURIComponent(code) , (err, token) => {
      if (err) return console.error('Error retrieving access token', err);
      oAuth2Client.setCredentials(token);
      // Store the token to disk for later program executions
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) return console.error(err);
        console.log('Token stored to', TOKEN_PATH);
      });
      callback(oAuth2Client);
    });
  });
}

/**
 * Lists the names and IDs of up to 10 files.
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
function downloadParentFolder(auth) {
  const drive = google.drive({version: 'v3', auth});
  drive.files.list({
    q: `'1XQXzpiqFt279_pBUPhSIzVvi7Ck8dmQ8' in parents`,
    pageSize: 20,
    fields: 'nextPageToken, files(id, name, mimeType)',
  }, (err, res) => {
    if (err) return console.log('The API returned an error: ' + err);
    const files = res.data.files;
    if (files.length) {
      files.map((file) => {
        if (file.mimeType === 'application/vnd.google-apps.folder') {
           createFolder(file.name);
           downloadFolderContent(file.id, auth, file.name);
        }
      });
    } else {
      console.log('No files found.');
    }
  });
}

const createFolder = (folderName) => {
  try {
    if (!fs.existsSync(`./public/assets/${folderName}`)) {
      fs.mkdirSync(`./public/assets/${folderName}`);
    }
  } catch (err) {
    console.error('Error creating new folder: ', err);
  }
};

const downloadFolderContent = (folderId, auth, folderName) => {
  const drive = google.drive({version: 'v3', auth});
  drive.files.list({
    q: `'${folderId}' in parents`,
    pageSize: 20,
    fields: 'nextPageToken, files(id, name, mimeType)',
  }, (err, res) => {
    if (err) return console.log('The API returned an error: ' + err);
    const files = res.data.files;
    if (files.length) {
      files.map((file) => {
        if (file.mimeType === 'application/vnd.google-apps.folder') {
           createFolder(file.name);
           downloadFolderContent(file.id, auth, file.name);
        }
        else {
          downloadFileById(auth, file.id, file.name, folderName);
        }
      });
    } else {
      console.log('No files found.');
    }
  });
};

const downloadFileById = (auth, fileId, fileName, folderName) => {
  const drive = google.drive({version: 'v3', auth});
  const destination = fs.createWriteStream(`./public/assets/${folderName}/${fileName}`);
  drive.files.get({fileId: fileId, alt: 'media', supportsAllDrives: true}, {responseType: 'stream'})
    .then(res => {
       res.data
       .on('end', () => {
          console.log('Done');
       })
       .on('error', (err) => {
          console.error('Error downloading file.');
       })
      .pipe(destination);
    }
  )
  .catch((err) => {
    console.log('error :', err);
  });
}



