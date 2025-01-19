import express from 'express';
import { upload } from '../middleware/multer.js';
import {  testAssistant, testPdf, editAnalysis, uploadFile, saveConversation, analyzeWitSavedData } from '../controller/pdfController.js';

const router = express.Router();


// API Endpoint to analyze PDF
router.post('/analyze', analyzeWitSavedData);
router.post('/upload', upload.single('pdf'), uploadFile);
router.post('/saveconversation', saveConversation);
router.put('/analyze/:id', editAnalysis);

router.get('/test-connection',testAssistant);

router.get("/testpdf", upload.single('pdf'), testPdf)

export default router;
