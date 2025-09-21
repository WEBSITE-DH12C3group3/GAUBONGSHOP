package com.thubongshop.backend.favorite.controller;

import com.thubongshop.backend.favorite.Favorite;
import com.thubongshop.backend.favorite.FavoriteService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/favorites")
@RequiredArgsConstructor
public class FavoriteController {

    private final FavoriteService service;

    // ---------------------------
    // Lấy danh sách yêu thích của 1 user
    // ---------------------------
    @GetMapping("/{userId}")
    public ResponseEntity<?> getFavorites(@PathVariable Long userId) {
        try {
            List<Favorite> favorites = service.getFavorites(userId);
            return ResponseEntity.ok(favorites);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                    .body("Lỗi khi lấy danh sách favorites: " + e.getMessage());
        }
    }

    // ---------------------------
    // Thêm sản phẩm vào yêu thích
    // ---------------------------
    @PostMapping("/{userId}/{productId}")
    public ResponseEntity<?> addFavorite(
            @PathVariable Long userId,
            @PathVariable Long productId) {
        try {
            Favorite fav = service.addFavorite(userId, productId);
            return ResponseEntity.ok(fav);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                    .body("Lỗi khi thêm favorite: " + e.getMessage());
        }
    }

    // ---------------------------
    // Xóa sản phẩm khỏi yêu thích
    // ---------------------------
    @DeleteMapping("/{userId}/{productId}")
    public ResponseEntity<?> removeFavorite(
            @PathVariable Long userId,
            @PathVariable Long productId) {
        try {
            service.removeFavorite(userId, productId);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                    .body("Lỗi khi xóa favorite: " + e.getMessage());
        }
    }

    // ---------------------------
    // Kiểm tra 1 sản phẩm có trong yêu thích không
    // ---------------------------
    @GetMapping("/{userId}/{productId}/exists")
    public ResponseEntity<?> isFavorite(
            @PathVariable Long userId,
            @PathVariable Long productId) {
        try {
            boolean exists = service.isFavorite(userId, productId);
            return ResponseEntity.ok(exists);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                    .body("Lỗi khi kiểm tra favorite: " + e.getMessage());
        }
    }
}
