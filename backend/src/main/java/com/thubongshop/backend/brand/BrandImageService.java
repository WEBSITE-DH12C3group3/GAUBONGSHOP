package com.thubongshop.backend.brand;

import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.Set;
import java.util.UUID;

@Service
public class BrandImageService {

    // Thư mục vật lý lưu ảnh
    private static final Path ROOT = Paths.get("brandimg");
    private static final Set<String> ALLOW = Set.of("jpg","jpeg","png","webp","gif","svg");

    // Trả về URL public để FE dùng trực tiếp
    public String saveLogo(MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) throw new IllegalArgumentException("Empty file");

        String ext = getExtension(file.getOriginalFilename());
        if (!ALLOW.contains(ext)) {
            throw new IllegalArgumentException("Only images are allowed: " + ALLOW);
        }

        Files.createDirectories(ROOT);
        String safe = System.currentTimeMillis() + "-" + Math.abs(UUID.randomUUID().getMostSignificantBits()) +
                "-" + sanitizeBaseName(file.getOriginalFilename()) + "." + ext;

        Path dest = ROOT.resolve(safe).normalize().toAbsolutePath();
        file.transferTo(dest);
        // URL public nhờ spring.web.resources.static-locations
        return "/brandimg/" + safe;
    }

    public boolean deleteByUrlIfLocal(String url) {
        if (!StringUtils.hasText(url)) return false;
        // chỉ xoá nếu nằm trong brandimg (an toàn)
        int i = url.indexOf("/brandimg/");
        if (i < 0) return false;
        String name = url.substring(i + "/brandimg/".length());
        Path p = ROOT.resolve(name).normalize().toAbsolutePath();
        try {
            return Files.deleteIfExists(p);
        } catch (IOException e) {
            return false;
        }
    }

    private String getExtension(String original) {
        if (!StringUtils.hasText(original)) return "png";
        String fileName = Paths.get(original).getFileName().toString();
        int dot = fileName.lastIndexOf('.');
        if (dot < 0) return "png";
        return fileName.substring(dot + 1).toLowerCase();
    }

    private String sanitizeBaseName(String original) {
        if (!StringUtils.hasText(original)) return "logo";
        String base = Paths.get(original).getFileName().toString();
        int dot = base.lastIndexOf('.');
        if (dot > -1) base = base.substring(0, dot);
        // loại ký tự lạ, khoảng trắng -> "-"
        base = base.replaceAll("[^a-zA-Z0-9-_]+", "-");
        if (base.isBlank()) base = "logo";
        return base;
    }
}
