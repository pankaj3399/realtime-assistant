import express from 'express';
import { upload } from '../middleware/multer.js';
import { analyze, testAssistant, testPdf, editAnalysis } from '../controller/pdfController.js';

const router = express.Router();


// API Endpoint to analyze PDF
router.post('/analyze', upload.single('pdf'), analyze);
router.put('/analyze/:id', editAnalysis);

router.get('/test-connection',testAssistant);

router.get("/testpdf", upload.single('pdf'), testPdf)

export default router;