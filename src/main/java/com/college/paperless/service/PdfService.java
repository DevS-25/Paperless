package com.college.paperless.service;

import com.college.paperless.entity.Document;
import com.college.paperless.entity.User;
import lombok.RequiredArgsConstructor;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.graphics.image.PDImageXObject;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
public class PdfService {

    public void addDigitalSignToPdf(Document document, User approver, String role) {
        try {
            if (document.getData() == null) {
                throw new RuntimeException("Document data is empty");
            }

            // Only process PDF files
            if (!"application/pdf".equalsIgnoreCase(document.getFileType()) && !document.getFileName().toLowerCase().endsWith(".pdf")) {
                return;
            }

            try (PDDocument pdDocument = PDDocument.load(new ByteArrayInputStream(document.getData()));
                 ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {

                // Get the first page
                PDPage page = pdDocument.getPage(0);

                // Create a content stream to write to the page (Append mode)
                try (PDPageContentStream contentStream = new PDPageContentStream(
                        pdDocument, page, PDPageContentStream.AppendMode.APPEND, true, true)) {

                    // Define position (Bottom Right)
                    float pageWidth = page.getMediaBox().getWidth();
                    float pageHeight = page.getMediaBox().getHeight();
                    float x = pageWidth - 250; // Adjust based on text length
                    float y = 50; // Bottom margin

                    // Check if user has a signature image
                    byte[] signatureData = approver.getSignatureData();
                    if ("HOD".equalsIgnoreCase(role) && approver.getHodSignatureData() != null && approver.getHodSignatureData().length > 0) {
                        signatureData = approver.getHodSignatureData();
                    }

                    if (signatureData != null && signatureData.length > 0) {
                        try {
                            PDImageXObject pdImage = PDImageXObject.createFromByteArray(pdDocument, signatureData, "signature");

                            // Fixed square size
                            float size = 125;
                            contentStream.drawImage(pdImage, x, y, size, size);

                            // Add text below image
                            contentStream.beginText();
                            contentStream.setFont(PDType1Font.HELVETICA, 8);
                            contentStream.setNonStrokingColor(Color.BLACK);
                            contentStream.newLineAtOffset(x, y - 10);
                            contentStream.showText("Digitally Signed by " + approver.getName() + " (" + role + ")");
                            contentStream.newLineAtOffset(0, -10);
                            contentStream.showText("Date: " + LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd-MM-yyyy HH:mm")));
                            contentStream.endText();
                        } catch (Exception e) {
                            System.out.println("Error adding signature image: " + e.getMessage());
                            e.printStackTrace();
                            // Fallback to text box on error
                            drawTextBox(contentStream, x, y, approver.getName(), role);
                        }
                    } else {
                        System.out.println("No signature data found for user: " + approver.getName());
                        // Draw text box
                        drawTextBox(contentStream, x, y, approver.getName(), role);
                    }
                }

                // Save to output stream
                pdDocument.save(outputStream);

                // Update document data
                document.setData(outputStream.toByteArray());
            }

        } catch (IOException e) {
            throw new RuntimeException("Failed to sign document", e);
        }
    }

    private void drawTextBox(PDPageContentStream contentStream, float x, float y, String name, String role) throws IOException {
        // Draw a box
        contentStream.setNonStrokingColor(Color.WHITE);
        contentStream.addRect(x - 10, y - 20, 240, 60);
        contentStream.fill();

        // Draw border
        contentStream.setStrokingColor(Color.GREEN);
        contentStream.setLineWidth(2);
        contentStream.addRect(x - 10, y - 20, 240, 60);
        contentStream.stroke();

        contentStream.beginText();
        contentStream.setFont(PDType1Font.HELVETICA_BOLD, 12);
        contentStream.setNonStrokingColor(new Color(0, 100, 0)); // Dark Green

        contentStream.newLineAtOffset(x, y + 25);
        contentStream.showText("APPROVED BY " + role);

        contentStream.newLineAtOffset(0, -15);
        contentStream.setFont(PDType1Font.HELVETICA, 10);
        contentStream.showText("Name: " + name);

        contentStream.newLineAtOffset(0, -15);
        contentStream.showText("Date: " + LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd-MM-yyyy HH:mm")));

        contentStream.endText();
    }
}
