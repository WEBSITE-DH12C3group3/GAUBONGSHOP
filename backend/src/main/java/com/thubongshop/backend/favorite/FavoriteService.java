package com.thubongshop.backend.favorite;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class FavoriteService {
    private final FavoriteRepository favoriteRepository;

    /** Lấy danh sách yêu thích của user */
    public List<Favorite> getFavorites(Long userId) {
        return favoriteRepository.findByUserId(userId);
    }

    /** Thêm sản phẩm vào danh sách yêu thích */
    public Favorite addFavorite(Long userId, Long productId) {
        Optional<Favorite> existing = favoriteRepository.findByUserIdAndProductId(userId, productId);
        if (existing.isPresent()) {
            // Nếu đã có thì trả về luôn, tránh lỗi trùng
            return existing.get();
        }

        Favorite fav = new Favorite();
        fav.setUserId(userId);
        fav.setProductId(productId);
        fav.setCreatedAt(LocalDateTime.now());
        return favoriteRepository.save(fav);
    }

    /** Xóa sản phẩm khỏi danh sách yêu thích */
    @Transactional
    public void removeFavorite(Long userId, Long productId) {
        favoriteRepository.deleteByUserIdAndProductId(userId, productId);
    }
    /** Kiểm tra sản phẩm đã được yêu thích chưa */
public boolean isFavorite(Long userId, Long productId) {
    return favoriteRepository.findByUserIdAndProductId(userId, productId).isPresent();
}

}
