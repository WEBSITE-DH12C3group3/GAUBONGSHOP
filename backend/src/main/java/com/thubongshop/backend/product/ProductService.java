package com.thubongshop.backend.product;

import com.thubongshop.backend.attribute.AttributeRepository;
import com.thubongshop.backend.attribute.Attribute;
import com.thubongshop.backend.brand.Brand;
import com.thubongshop.backend.brand.BrandRepository;
import com.thubongshop.backend.category.Category;
import com.thubongshop.backend.category.CategoryRepository;
import com.thubongshop.backend.productattribute.ProductAttribute;
import com.thubongshop.backend.productattribute.ProductAttributeKey;
import com.thubongshop.backend.productattribute.ProductAttributeRepository;
import com.thubongshop.backend.productattribute.ProductAttributeRequest;
import com.thubongshop.backend.review.ReviewRepository;
import jakarta.transaction.Transactional;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@Transactional
public class ProductService {

    private final ProductRepository repo;
    private final AttributeRepository attributeRepo;
    private final ProductAttributeRepository paRepo;
    private final ReviewRepository reviewRepo;
    private final BrandRepository brandRepo;
    private final CategoryRepository categoryRepo;
    

    public ProductService(ProductRepository repo,
                          AttributeRepository attributeRepo,
                          ProductAttributeRepository paRepo,
                          ReviewRepository reviewRepo,
                          BrandRepository brandRepo,
                          CategoryRepository categoryRepo) {
        this.repo = repo;
        this.attributeRepo = attributeRepo;
        this.paRepo = paRepo;
        this.reviewRepo = reviewRepo;
        this.brandRepo = brandRepo;
        this.categoryRepo = categoryRepo;
    }

    // -------------------- Client --------------------

    /** Tìm kiếm + phân trang */
    public Page<ProductResponse> search(String keyword, Integer categoryId, Integer brandId,
                                        Double minPrice, Double maxPrice, Pageable pageable) {
        return repo.search(keyword, categoryId, brandId, minPrice, maxPrice, pageable)
                   .map(this::mapToResponseBasic);
    }

    /** Chi tiết sản phẩm (bao gồm attributes + reviews) */
    public ProductResponse getFullDetail(Integer id) {
        Product product = repo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Product not found"));

        ProductResponse resp = mapToResponseBasic(product);

        // 1. Attributes
        var pas = paRepo.findByIdProductId(product.getId());
        resp.setAttributes(pas.stream()
                .map(pa -> new ProductResponse.AttributeDTO(
                        pa.getAttributeId(),
                        attributeRepo.findById(pa.getAttributeId())
                                     .map(Attribute::getName).orElse(""),
                        pa.getValue()
                )).toList());

        // 2. Reviews
        var stats = reviewRepo.getStatsByProduct(product.getId());
        if (stats != null) {
            resp.setAvgRating(stats.getAvgRating());
            resp.setTotalReviews(stats.getTotalReviews());
        }

        // 3. Brand + Category
        resp.setBrandName(
                brandRepo.findById(product.getBrandId())
                         .map(Brand::getName).orElse(null)
        );
        resp.setCategoryName(
                categoryRepo.findById(product.getCategoryId().longValue())
                            .map(Category::getName).orElse(null)
        );

        return resp;
    }

    /** Lấy sản phẩm mới nhất */
    public List<ProductResponse> getLatest(int limit) {
        Pageable pageable = PageRequest.of(0, limit);
        return repo.findAllByOrderByCreatedAtDesc(pageable)
                   .stream().map(this::mapToResponseBasic).toList();
    }

    /** Lấy sản phẩm liên quan cùng danh mục */
    public List<ProductResponse> getRelated(Integer productId, int limit) {
        Product product = repo.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("Product not found"));

        Pageable pageable = PageRequest.of(0, limit);
        return repo.findByCategoryIdAndIdNot(product.getCategoryId(), product.getId(), pageable)
                   .stream().map(this::mapToResponseBasic).toList();
    }

    /** Lấy sản phẩm theo danh sách ID (dùng cho Favorites) */
    public List<ProductResponse> getProductsByIds(List<Integer> ids) {
        return repo.findAllById(ids)
                   .stream().map(this::mapToResponseBasic).toList();
    }

    // -------------------- Admin --------------------

    public Page<ProductResponse> listPaged(String keyword, Integer categoryId, Integer brandId,
                                           Double minPrice, Double maxPrice, Pageable pageable) {
        return repo.search(keyword, categoryId, brandId, minPrice, maxPrice, pageable)
                   .map(this::mapToResponseBasic);
    }

    public ProductResponse getDetail(Integer id) {
        return getFullDetail(id);
    }

    /** Thêm sản phẩm cơ bản */
    public ProductResponse create(ProductRequest req) {
        Product p = new Product();
        p.setName(req.name());
        p.setDescription(req.description());
        p.setPrice(req.price());
        p.setImageUrl(req.imageUrl());
        p.setCategoryId(req.categoryId());
        p.setBrandId(req.brandId());
        p.setStock(req.stock());
        return mapToResponseBasic(repo.save(p));
    }

    /** Thêm sản phẩm đầy đủ (bao gồm attributes) */
    public ProductResponse createFull(ProductRequest req) {
        Product p = new Product();
        p.setName(req.name());
        p.setDescription(req.description());
        p.setPrice(req.price());
        p.setImageUrl(req.imageUrl());
        p.setCategoryId(req.categoryId());
        p.setBrandId(req.brandId());
        p.setStock(req.stock());
        p = repo.save(p);

        if (req.attributes() != null) {
            for (ProductAttributeRequest attr : req.attributes()) {
                ProductAttribute pa = ProductAttribute.builder()
                        .id(new ProductAttributeKey(p.getId(), attr.attributeId().intValue()))
                        .value(attr.value())
                        .build();
                paRepo.save(pa);
            }
        }

        return getFullDetail(p.getId());
    }

    public ProductResponse update(Integer id, ProductRequest req) {
        Product p = repo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Product not found"));
        p.setName(req.name());
        p.setDescription(req.description());
        p.setPrice(req.price());
        p.setImageUrl(req.imageUrl());
        p.setCategoryId(req.categoryId());
        p.setBrandId(req.brandId());
        p.setStock(req.stock());
        return mapToResponseBasic(repo.save(p));
    }

    public void delete(Integer id) {
        repo.deleteById(id);
    }
public List<Product> findByIds(List<Integer> ids) {
        return repo.findAllById(ids);
    }

    // -------------------- Helpers --------------------

    private ProductResponse mapToResponseBasic(Product p) {
        String brandName = (p.getBrandId() != null)
                ? brandRepo.findById(p.getBrandId()).map(Brand::getName).orElse(null)
                : null;

        String categoryName = (p.getCategoryId() != null)
                ? categoryRepo.findById(p.getCategoryId().longValue())
                              .map(Category::getName).orElse(null)
                : null;

        return ProductResponse.builder()
                .id(p.getId())
                .name(p.getName())
                .description(p.getDescription())
                .price(p.getPrice())
                .imageUrl(p.getImageUrl())
                .stock(p.getStock())
                .createdAt(p.getCreatedAt())
                .brandName(brandName)
                .categoryName(categoryName)
                .build();
    }
}
