package com.thubongshop.backend.brand.controller;

import com.thubongshop.backend.brand.*;
import jakarta.validation.Valid;
import org.springframework.data.domain.*;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;


import java.io.IOException;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/brands")
@CrossOrigin(origins = "*")
public class AdminBrandController {

    private final BrandService service;
    private final BrandImageService imageService;

    public AdminBrandController(BrandService service, BrandImageService imageService) {
        this.service = service;
        this.imageService = imageService;
    }

    // List + search + paging
    @GetMapping
    public ResponseEntity<?> list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id,desc") String sort,
            @RequestParam(required = false) String q
    ) {
        Pageable pageable = buildPageable(page, size, sort);
        Page<BrandResponse> data = service.list(q, pageable);
        return ResponseEntity.ok(Map.of(
                "content", data.getContent(),
                "number", data.getNumber(),
                "size", data.getSize(),
                "totalElements", data.getTotalElements(),
                "totalPages", data.getTotalPages()
        ));
    }

    // Create (JSON) – logoUrl có thể đi kèm nếu đã upload trước
    @PostMapping
    public ResponseEntity<?> create(@Valid @RequestBody BrandRequest req) {
        return ResponseEntity.ok(Map.of("brand", service.create(req)));
    }

    // Update (JSON)
    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Integer id, @Valid @RequestBody BrandRequest req) {
        return ResponseEntity.ok(Map.of("brand", service.update(id, req)));
    }

    // Xoá brand (không tự xoá file cũ để an toàn – tuỳ bạn bật ở dưới)
    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Integer id) {
        service.delete(id);
        return ResponseEntity.ok(Map.of("message", "Deleted"));
    }

    // Tải logo trước (2 bước): trả URL để FE set vào form create/update
    @PostMapping(path = "/logo", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> uploadLogo(@RequestPart("file") MultipartFile file) throws IOException {
        String url = imageService.saveLogo(file);
        return ResponseEntity.ok(Map.of("url", url));
    }

    // Upload & gán logo cho brand (1 bước)
    @PostMapping(path = "/{id}/logo", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> uploadAndAssignLogo(@PathVariable Integer id,
                                                 @RequestPart("file") MultipartFile file,
                                                 @RequestParam(defaultValue = "false") boolean deleteOld) throws IOException {
        var current = service.get(id);
        String url = imageService.saveLogo(file);

        // gán logo mới
        BrandRequest req = new BrandRequest();
        req.setName(current.getName());
        req.setDescription(current.getDescription());
        req.setWebsiteUrl(current.getWebsiteUrl());
        req.setLogoUrl(url);
        var updated = service.update(id, req);

        // tuỳ chọn xoá file cũ nếu là file local trong /brandimg/
        if (deleteOld) imageService.deleteByUrlIfLocal(current.getLogoUrl());

        return ResponseEntity.ok(Map.of("brand", updated));
    }

    private Pageable buildPageable(int page, int size, String sort) {
        try {
            String[] sp = sort.split(",");
            String field = sp[0];
            Sort.Direction dir = (sp.length > 1) ? Sort.Direction.fromString(sp[1]) : Sort.Direction.DESC;
            return PageRequest.of(page, size, Sort.by(dir, field));
        } catch (Exception e) {
            return PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "id"));
        }
    }
}
