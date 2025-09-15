package com.thubongshop.backend.attribute;

import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class AttributeService {

    private final AttributeRepository attRepo;

    public AttributeService(AttributeRepository attRepo) {
        this.attRepo = attRepo;
    }

    // ---------- Client Methods ----------

    // Lấy tất cả attributes (client dùng khi cần filter / hiển thị)
    public List<Attribute> listAll() {
        return attRepo.findAll();
    }

    // Tìm kiếm nhanh theo tên (client có thể gọi autocomplete)
    public List<Attribute> listByKeyword(String q) {
        return attRepo.findByNameContainingIgnoreCase(q.trim());
    }

    // ---------- Admin Methods ----------

    // Lấy danh sách có phân trang, dùng cho admin quản lý
    public Page<Attribute> listPaged(String q, Pageable pageable) {
        if (q == null || q.isBlank()) {
            return attRepo.findAll(pageable);
        }
        return attRepo.findByNameContainingIgnoreCase(q.trim(), pageable);
    }



    public Attribute get(Integer id) {
        return attRepo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Attribute not found with id=" + id));
    }

    public Attribute create(Attribute req) {
        if (attRepo.existsByNameIgnoreCase(req.getName())) {
            throw new IllegalArgumentException("Attribute name already exists");
        }
        Attribute a = new Attribute();
        a.setName(req.getName());
        a.setDescription(req.getDescription());
        return attRepo.save(a);
    }

    public Attribute update(Integer id, Attribute req) {
        Attribute a = get(id);
        if (!a.getName().equalsIgnoreCase(req.getName())
                && attRepo.existsByNameIgnoreCase(req.getName())) {
            throw new IllegalArgumentException("Attribute name already exists");
        }
        a.setName(req.getName());
        a.setDescription(req.getDescription());
        return attRepo.save(a);
    }

    public void delete(Integer id) {
        if (!attRepo.existsById(id)) {
            throw new IllegalArgumentException("Attribute not found with id=" + id);
        }
        attRepo.deleteById(id);
    }
}
