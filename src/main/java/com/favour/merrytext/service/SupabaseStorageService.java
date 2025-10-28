package com.favour.merrytext.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.MediaType;
import org.springframework.http.client.MultipartBodyBuilder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;
import java.io.IOException;
import java.util.UUID;

@Service
public class SupabaseStorageService {

    @Value("${supabase.url}")
    private String supabaseUrl;

    @Value("${supabase.key}")
    private String supabaseApiKey;

    @Value("${supabase.bucketname}")
    private String bucketName;

    private final WebClient webClient;

    public SupabaseStorageService(WebClient.Builder webClientBuilder) {
        this.webClient = webClientBuilder.baseUrl(supabaseUrl).build();
    }

    public String uploadFile(MultipartFile file) throws IOException {
        String fileName = generateFileName(file.getOriginalFilename());
        String filePath = bucketName + "/" + fileName;

        try {
            // Upload file to Supabase Storage
            String uploadUrl = supabaseUrl + "/storage/v1/object/" + filePath;

            MultipartBodyBuilder bodyBuilder = new MultipartBodyBuilder();
            bodyBuilder.part("file", new ByteArrayResource(file.getBytes()) {
                @Override
                public String getFilename() {
                    return fileName;
                }
            });

            String response = webClient.post()
                    .uri(uploadUrl)
                    .header("Authorization", "Bearer " + supabaseApiKey)
                    .header("apikey", supabaseApiKey)
                    .contentType(MediaType.MULTIPART_FORM_DATA)
                    .body(BodyInserters.fromMultipartData(bodyBuilder.build()))
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            // Return public URL for the uploaded file
            return getPublicUrl(filePath);

        } catch (Exception e) {
            throw new IOException("Failed to upload file to Supabase: " + e.getMessage(), e);
        }
    }

    public boolean deleteFile(String fileUrl) {
        try {
            // Extract file path from URL
            String filePath = extractFilePathFromUrl(fileUrl);
            String deleteUrl = supabaseUrl + "/storage/v1/object/" + filePath;

            webClient.delete()
                    .uri(deleteUrl)
                    .header("Authorization", "Bearer " + supabaseApiKey)
                    .header("apikey", supabaseApiKey)
                    .retrieve()
                    .bodyToMono(Void.class)
                    .block();

            return true;
        } catch (Exception e) {
            return false;
        }
    }

    public String getFileInfo(String fileUrl) {
        try {
            String filePath = extractFilePathFromUrl(fileUrl);
            String infoUrl = supabaseUrl + "/storage/v1/object/info/" + filePath;

            return webClient.get()
                    .uri(infoUrl)
                    .header("Authorization", "Bearer " + supabaseApiKey)
                    .header("apikey", supabaseApiKey)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();
        } catch (Exception e) {
            return null;
        }
    }

    private String generateFileName(String originalFileName) {
        String fileExtension = "";
        if (originalFileName != null && originalFileName.contains(".")) {
            fileExtension = originalFileName.substring(originalFileName.lastIndexOf("."));
        }
        return UUID.randomUUID().toString() + fileExtension;
    }

    private String getPublicUrl(String filePath) {
        return supabaseUrl + "/storage/v1/object/public/" + filePath;
    }

    private String extractFilePathFromUrl(String fileUrl) {
        // Extract path from URL like:
        // https://xyz.supabase.co/storage/v1/object/public/bucket-name/filename.jpg
        String prefix = supabaseUrl + "/storage/v1/object/public/";
        if (fileUrl.startsWith(prefix)) {
            return fileUrl.substring(prefix.length());
        }
        throw new IllegalArgumentException("Invalid Supabase file URL: " + fileUrl);
    }

    // Method to validate file before upload
    public void validateFile(MultipartFile file, String expectedMediaType) throws IOException {
        // Check file size (10MB max)
        if (file.getSize() > 10 * 1024 * 1024) {
            throw new IOException("File size exceeds 10MB limit");
        }

        // Check file type
        String contentType = file.getContentType();
        if (contentType == null) {
            throw new IOException("Could not determine file type");
        }

        switch (expectedMediaType) {
            case "image":
                if (!contentType.startsWith("image/")) {
                    throw new IOException("File must be an image (JPEG, PNG, etc.)");
                }
                break;
            case "video":
                if (!contentType.startsWith("video/")) {
                    throw new IOException("File must be a video (MP4, etc.)");
                }
                break;
            case "audio":
                if (!contentType.startsWith("audio/")) {
                    throw new IOException("File must be an audio file (MP3, WAV, etc.)");
                }
                break;
        }
    }
}