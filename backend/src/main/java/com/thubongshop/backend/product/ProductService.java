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

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

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

    public Page<ProductResponse> search(String keyword, Integer categoryId, Integer brandId, Pageable pageable) {
        return repo.search(keyword, categoryId, brandId, pageable)
                   .map(this::mapToResponseBasic);
    }

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
        String brandName = brandRepo.findById(product.getBrandId())
                .map(Brand::getName).orElse(null);

        String categoryName = categoryRepo.findById(product.getCategoryId().longValue())
                .map(Category::getName).orElse(null);


        resp.setBrandName(brandName);
        resp.setCategoryName(categoryName);

        return resp;
    }
 

    public List<ProductResponse> getLatest(int limit) {
        Pageable pageable = PageRequest.of(0, limit);
        return repo.findAllByOrderByCreatedAtDesc(pageable)
                   .stream().map(this::mapToResponseBasic).toList();
    }

    public List<ProductResponse> getRelated(Integer productId, int limit) {
        Product product = repo.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("Product not found"));
        Pageable pageable = PageRequest.of(0, limit);
        return repo.findByCategoryIdAndIdNot(product.getCategoryId(), product.getId(), pageable)
           .stream().map(this::mapToResponseBasic).toList();

    }

    // -------------------- Admin --------------------

    public Page<ProductResponse> listPaged(String keyword, Integer categoryId, Integer brandId, Pageable pageable) {
        return repo.search(keyword, categoryId, brandId, pageable).map(this::mapToResponseBasic);
    }

    public ProductResponse getDetail(Integer id) {
        Product product = repo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Product not found"));
        return mapToResponseBasic(product);
    }

    /**
     * Thêm mới sản phẩm cơ bản (không attributes/images).
     */
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

    /**
     * Thêm mới sản phẩm đầy đủ (bao gồm attributes + images).
     */
    public ProductResponse createFull(ProductRequest req) {
        // 1. Tạo product cơ bản
        Product p = new Product();
        p.setName(req.name());
        p.setDescription(req.description());
        p.setPrice(req.price());
        p.setImageUrl(req.imageUrl());
        p.setCategoryId(req.categoryId());
        p.setBrandId(req.brandId());
        p.setStock(req.stock());
        p = repo.save(p);

        // 2. Lưu attributes
        if (req.attributes() != null) {
            for (ProductAttributeRequest attr : req.attributes()) {
                ProductAttribute pa = ProductAttribute.builder()
                    .id(new ProductAttributeKey(p.getId(), attr.attributeId().intValue()))
                    .value(attr.value())
                    .build();
                paRepo.save(pa);
            }
        }


        // TODO: 3. Lưu images nếu bạn có bảng riêng cho images

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

    // -------------------- Helpers --------------------

    private ProductResponse mapToResponseBasic(Product p) {
        return ProductResponse.builder()
                .id(p.getId())
                .name(p.getName())
                .description(p.getDescription())
                .price(p.getPrice())
                .imageUrl(p.getImageUrl())
                .stock(p.getStock())
                .createdAt(p.getCreatedAt())
                .brandName("TODO")     // lấy từ brand service
                .categoryName("TODO")  // lấy từ category service
                .build();
    }
} 
