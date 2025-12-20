package com.college.paperless.service;

import com.college.paperless.entity.User;
import lombok.RequiredArgsConstructor;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.graphics.image.PDImageXObject;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.File;
import java.io.IOException;
import java.nio.file.Path;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
public class PdfService {

    private final FileStorageService fileStorageService;

    public void addDigitalSignToPdf(String filePath, User approver, String role) {
        try {
            Path path = fileStorageService.getFilePath(filePath);
            File file = path.toFile();

            if (!file.exists()) {
                throw new RuntimeException("File not found: " + filePath);
            }

            // Only process PDF files
            if (!filePath.toLowerCase().endsWith(".pdf")) {
                return;
            }

            // Create temp file
            File tempFile = File.createTempFile("paperless_sign_", ".pdf", file.getParentFile());

            try (PDDocument document = PDDocument.load(file)) {
                // Get the first page
                PDPage page = document.getPage(0);

                // Create a content stream to write to the page (Append mode)
                try (PDPageContentStream contentStream = new PDPageContentStream(
                        document, page, PDPageContentStream.AppendMode.APPEND, true, true)) {

                    // Define position (Bottom Right)
                    float pageWidth = page.getMediaBox().getWidth();
                    float pageHeight = page.getMediaBox().getHeight();
                    float x = pageWidth - 250; // Adjust based on text length
                    float y = 50; // Bottom margin

                    // Check if user has a signature image
                    String signaturePathToUse = approver.getSignaturePath();
                    if ("HOD".equalsIgnoreCase(role) && approver.getHodSignaturePath() != null && !approver.getHodSignaturePath().isEmpty()) {
                        signaturePathToUse = approver.getHodSignaturePath();
                    }

                    if (signaturePathToUse != null && !signaturePathToUse.isEmpty()) {
                        try {
                            Path signaturePath = fileStorageService.getFilePath(signaturePathToUse);
                            File signatureFile = signaturePath.toFile();

                            System.out.println("Attempting to add signature from: " + signatureFile.getAbsolutePath());

                            if (signatureFile.exists()) {
                                PDImageXObject pdImage = PDImageXObject.createFromFile(signatureFile.getAbsolutePath(), document);
                                System.out.println("Applying signature: " + signatureFile.getName() + " Original: " + pdImage.getWidth() + "x" + pdImage.getHeight());

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
                            } else {
                                System.out.println("Signature file does not exist: " + signatureFile.getAbsolutePath());
                                // Fallback to text box if file missing
                                drawTextBox(contentStream, x, y, approver.getName(), role);
                            }
                        } catch (Exception e) {
                            System.out.println("Error adding signature image: " + e.getMessage());
                            e.printStackTrace();
                            // Fallback to text box on error
                            drawTextBox(contentStream, x, y, approver.getName(), role);
                        }
                    } else {
                        System.out.println("No signature path found for user: " + approver.getName());
                        // Draw text box
                        drawTextBox(contentStream, x, y, approver.getName(), role);
                    }
                }

                // Save to temp file
                document.save(tempFile);
            }

            // Replace original file with temp file
            java.nio.file.Files.move(tempFile.toPath(), file.toPath(), java.nio.file.StandardCopyOption.REPLACE_EXISTING);

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
