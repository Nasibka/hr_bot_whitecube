const { GoogleSpreadsheet } = require('google-spreadsheet');
const  NodeGoogleDrive = require('node-google-drive')

const keys = require('../config/keysGS')
const doc = new GoogleSpreadsheet('1w5p77A6ulfRAnp2wCxd6KzC6iIEnmyUQnPiY7OgFlp8');
const googleDriveInstance = new NodeGoogleDrive({
    ROOT_FOLDER: '1glH756KIsccZ_FVhRTn9vfMbSdlgJfQu'
});

async function connectGoogleSheet(){
    await doc.useServiceAccountAuth({
        client_email: keys.client_email,
        private_key: keys.private_key,
      });
}
connectGoogleSheet()

async function connectGoogleDrive() { 
    await googleDriveInstance.useServiceAccountAuth(
        keys
    );
}
connectGoogleDrive()

module.exports = {
    doc,
    googleDriveInstance
};