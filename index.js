const express = require('express');
const fs = require('fs');
const multer = require('multer');
const path = require('path');

const app = express();
const tempUploadFolder = "tempUploads/";
const baseUploadFolder = "uploads/";

// Ensure upload directories exist
if (!fs.existsSync(tempUploadFolder)) {
  fs.mkdirSync(tempUploadFolder, { recursive: true });
}
if (!fs.existsSync(baseUploadFolder)) {
  fs.mkdirSync(baseUploadFolder, { recursive: true });
}

const uploadF = multer({
  dest: tempUploadFolder,
  limits: { fileSize: 50 * 1024 * 1024 } // 50 MB limit
});

app.post("/api/uploadOnServer", uploadF.array("file", 100), (req, res) => {
  console.log("Upload on server API is called");
  try {
    const folderName = req.body.folderName;
    if (!folderName) {
      return res.status(400).send({ message: "Folder name is required." });
    }

    const finalFolderPath = path.join(baseUploadFolder, folderName);

    // Ensure the final folder exists
    if (!fs.existsSync(finalFolderPath)) {
      fs.mkdirSync(finalFolderPath, { recursive: true });
    }

    // Move each file to the new directory
    req.files.forEach((file) => {
      const finalPath = path.join(finalFolderPath, file.originalname);
      fs.renameSync(file.path, finalPath);
    });

    console.log("File upload completed");
    return res.status(200).send(`Uploaded ${req.files.length} files to ${folderName} folder.`);
  } catch (error) {
    console.error(error.message);
    return res.status(500).send(`Internal server error: ${error.message}`);
  }
});

// Add middleware and other route configurations as necessary

const port = 3000; // Use your preferred port for the application
app.listen(port, () => console.log(`Server running on port ${port}`));
