package com.thubongshop.backend.upload;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/uploads")
@CrossOrigin(origins = "*")
public class UploadController {

    private static final Path PRODUCTS_ROOT = Paths.get("uploads");   // ảnh sản phẩm
    private static final Path BRANDS_ROOT   = Paths.get("brandimg");  // ảnh brand

    private static final Set<String> ALLOWED = Set.of(
            MediaType.IMAGE_JPEG_VALUE, MediaType.IMAGE_PNG_VALUE,
            "image/webp", MediaType.IMAGE_GIF_VALUE
    );

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> upload(
            @RequestParam("file") MultipartFile file,
            @RequestParam(name = "target", defaultValue = "product") String target // "product" | "brand"
    ) throws IOException {
        if (file.isEmpty()) return ResponseEntity.badRequest().body(Map.of("message", "File rỗng"));
        if (!ALLOWED.contains(file.getContentType()))
            return ResponseEntity.badRequest().body(Map.of("message", "Chỉ cho phép ảnh jpg/png/webp/gif"));

        // chọn thư mục gốc theo target
        Path root = "brand".equalsIgnoreCase(target) ? BRANDS_ROOT : PRODUCTS_ROOT;
        if (!Files.exists(root)) Files.createDirectories(root);

        String ext = getExtension(file.getOriginalFilename());
        String safeName = UUID.randomUUID().toString().replace("-", "") + (ext.isEmpty() ? "" : "." + ext);

        Path abs = root.resolve(safeName).normalize().toAbsolutePath();
        file.transferTo(abs.toFile());

        String urlPrefix = "brand".equalsIgnoreCase(target) ? "/brandimg/" : "/uploads/";

        return ResponseEntity.ok(Map.of(
                "url", urlPrefix + safeName,          // FE bind trực tiếp
                "filename", safeName,
                "size", file.getSize(),
                "uploadedAt", LocalDateTime.now().toString()
        ));
    }

    private String getExtension(String original) {
        if (!StringUtils.hasText(original)) return "";
        String name = Paths.get(original).getFileName().toString();
        int i = name.lastIndexOf('.');
        return (i > -1 && i < name.length() - 1) ? name.substring(i + 1).toLowerCase() : "";
    }
}
